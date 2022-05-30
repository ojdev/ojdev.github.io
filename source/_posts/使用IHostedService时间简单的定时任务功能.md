---
title: 使用IHostedService时间简单的定时任务功能
date: 2022-05-30 11:29:10
categories:
- .Net
tags:
    - C#
    - .Net Core
    - 定时任务
---

# 前言

有些时候再开发过程中会遇到定时执行任务的情况，这种需求功能很小，如果采用`hangfire`或者`Quartz.NET`之类的框架，就有些庞大，不值得建库建表去进行配置管理，使用`while`或者`timer`又不够具有封装性，所以微软.net core提供了`IHostedService`（[在 ASP.NET Core 中使用托管服务实现后台任务](https://docs.microsoft.com/zh-cn/aspnet/core/fundamentals/host/hosted-services?view=aspnetcore-6.0&tabs=visual-studio)）托管服务时间简单的后台任务管理器。

# 实现

我们采用`IHostedService` 基类进行封装以满足我们的简单需求，这个接口有两个实现。

- StartAsync(CancellationToken)
- StopAsync(CancellationToken)

## StartAsync

简单的描述，就是启动任务，再这里对任务的逻辑进行处理。

## StopAsync

终止任务，一般来讲就是服务本身或者说应用本身停止的时候自动调用该接口。对后台任务涉及到的资源进行释放或者其他需要的逻辑进行处理的。

## 具体实现

我们的需求很简单，就是再每周五上午8点的时候查询报表，然后通过邮件发送给指定的接收人。

实现的原理依然是在启动的时候开启一个`Timer`定时器，然后定时进行轮询，判断时间，时间到此范围的时候就执行`DoWork`方法进行逻辑处理。由于`IHostedService`是单例的，所以没有办法进行依赖注入，但是有另一个方法，就是在这里注入一个同为单例的`IServiceScopeFactory`，需要使用其他类的时候，通过`using var scope = _serviceScopeFactory.CreateScope();var cache = scope.ServiceProvider.GetRequiredService<IDistributedCache>()`的形式进行对象获取。这里还有一点小瑕疵，就是目前的`Timer`中的`TimerCallback`还不支持异步的形式，有点遗憾。

```csharp
namespace Email.Report.Infrastructure.BackgroundTasks;

/// <summary>
/// 门店(中心)周报
/// </summary>
public class StatisticWeeklyDoWork : IHostedService, IAsyncDisposable
{
    private const string Title = "周报";
    private readonly Task _completedTask = Task.CompletedTask;
    private readonly ILogger<StatisticWeeklyDoWork> _logger;
    private readonly IServiceScopeFactory _serviceScopeFactory;
    private Timer? _timer;
    /// <summary>
    /// 
    /// </summary>
    /// <param name="logger"></param>
    /// <param name="serviceScopeFactory"></param>
    public StatisticWeeklyDoWork(ILogger<StatisticWeeklyDoWork> logger, IServiceScopeFactory serviceScopeFactory)
    {
        _logger = logger;
        _serviceScopeFactory = serviceScopeFactory;
    }
    /// <summary>
    /// 
    /// </summary>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    public Task StartAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("{Title} {Service} is running.", Title, nameof(StatisticWeeklyDoWork));
        _timer = new Timer(DoWork, null, TimeSpan.Zero, TimeSpan.FromSeconds(30));
        return _completedTask;
    }
    private void DoWork(object? state)
    {
        var now = DateTimeOffset.Now;
        if (now.DayOfWeek == DayOfWeek.Friday && now.Hour == 8 && now.Minute < 10)   // 每周五的上午8点
        {
            using var scope = _serviceScopeFactory.CreateScope();
            var cache = scope.ServiceProvider.GetRequiredService<IDistributedCache>();
            cache.BackgroundCheck($"StatisticWeeklyDoWork_{now:yyyyMMddHH}", () =>
            {
                var service = scope.ServiceProvider.GetRequiredService<IEmaliByExcelManager>();
                _logger.LogInformation("{Title} is working, 当前时间：{time}", Title, now.ToString("yyyy-MM-dd HH:mm:ss"));
                // 实际逻辑处理
                _logger.LogInformation("{Title} is complete, 当前时间：{time}", Title, now.ToString("yyyy-MM-dd HH:mm:ss"));
            });
        }
    }
    /// <summary>
    /// 
    /// </summary>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    public Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("{Title} {Service} is stopping.", Title, nameof(StatisticWeeklyDoWork));
        _timer?.Change(Timeout.Infinite, 0);
        return _completedTask;
    }
    /// <summary>
    /// 
    /// </summary>
    /// <returns></returns>
    public async ValueTask DisposeAsync()
    {
        if (_timer is IAsyncDisposable timer)
        {
            await timer.DisposeAsync();
        }
        _timer = null;
    }
}

```

## 防止重复执行

其实也没有这个必要，我们可以在`Timer`的最后一个参数改为1秒一次，我们只要判断时间因素到秒级一般不会出现问题，但是如果操作失败了，就会出现邮件没有发出的情况，所以我们还是增加了一个判断，时间拉长到30秒，任务执行时间也比较长，例如10秒20秒的情况，甚至有些耗时任务，可能或执行2分钟，那么每30秒的判断就会重复进入任务中，这里用到了一个` cache.BackgroundCheck(****`来对任务的执行进行管理，使用了分布式缓存`IDistributedCache`进行二次封装满足调用需求。

```csharp
namespace Email.Report.Infrastructure.Extensions;

/// <summary>
/// 
/// </summary>
public static class IDistributedCacheExtensions
{
    /// <summary>
    /// 任务执行检查
    /// </summary>
    /// <param name="cache"></param>
    /// <param name="key">任务检查key</param>
    /// <param name="action"></param>
    public static void BackgroundCheck(this IDistributedCache cache, string key, Action action)
    {
        var workingKey = key + "_working";
        var isWorkingKey = cache.GetString(key);
        if (isWorkingKey == "working")
        {
            return;
        }
        cache.SetString(workingKey, "working", new DistributedCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromMinutes(5)));
        var complete = cache.GetString(key);
        if (string.IsNullOrEmpty(complete))
        {
            action?.Invoke();
            cache.SetString(key, "complete", new DistributedCacheEntryOptions().SetAbsoluteExpiration(TimeSpan.FromHours(2)));
        }

    }
}
```

代码中每个任务执行，我们都有一个独立的key，调用到的时候就先写入一个working的key，这样重复进入的时候判断在执行中就会自动返回了，然后执行在判断是否已经执行结束，如果还没有，则开始执行逻辑，执行完之后就写入完成的key，这样就不会重复判断了，要注意的是，key的写入时间，与任务的实行时间，不能出现太小的差距，否则就会出现重复进入的情况。

## 注册服务

我们可以有多个这样的后台任务，在服务启动的时候进行注册，就可以自动启动了

```csharp
namespace Email.Report.API;
/// <summary>
/// 
/// </summary>
public class Program
{
    /// <summary>
    /// 
    /// </summary>
    /// <param name="args"></param>
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.

        builder.Services.AddControllers();
        #region 定时任务
        builder.Services.AddDistributedMemoryCache(); //缓存
        builder.Services.AddHostedService<StatisticWeeklyDoWork>();
        #endregion
        var app = builder.Build();

        // Configure the HTTP request pipeline.

        app.UseAuthorization();
        app.MapControllers();
        app.Run();
    }
}
```