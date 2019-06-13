---
title: RabbitMQ.EventBus.AspNetCore
date: 2019-05-06 13:52:00
categories: 知识储备
tags: 
    - RabbitMQ
    - .net core
    - EventBus
    - Asp.Net Core
---

[![NuGet](https://img.shields.io/nuget/v/RabbitMQ.EventBus.AspNetCore.svg?style=popout)](https://www.nuget.org/packages/RabbitMQ.EventBus.AspNetCore)  [![NuGet](https://img.shields.io/nuget/dt/RabbitMQ.EventBus.AspNetCore.svg?style=popout)](https://www.nuget.org/packages/RabbitMQ.EventBus.AspNetCore)


`RabbitMQ.EventBus.AspNetCore`是一个基于官方`RabbitMQ.Client`的二次封装包，专门针对`Net Core`项目进行开发，在`微服务`中进行消息的传递使用起来比较方便。
## 特性
1. 断线重连机制
1. 可扩展
1. 消费失败自动打回

### 使用说明

#### 1. 注册
~~~ csharp
public void ConfigureServices(IServiceCollection services)
{
    string assemblyName = typeof(Startup).GetTypeInfo().Assembly.GetName().Name;
    services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_1);
    services.AddRabbitMQEventBus(()=>"amqp://guest:guest@192.168.0.252:5672/", eventBusOptionAction: eventBusOption =>
    {
        eventBusOption.ClientProvidedAssembly(assemblyName);
        eventBusOption.EnableRetryOnFailure(true, 5000, TimeSpan.FromSeconds(30));
        eventBusOption.RetryOnFailure(TimeSpan.FromMilliseconds(100));
        eventBusOption.AddLogging(LogLevel.Warning);
    });
    services.AddButterfly(butterfly =>
    {
        butterfly.CollectorUrl = "http://192.168.0.252:6401";
        butterfly.Service = "RabbitMQEventBusTest";
    });
}
~~~
#### 2. 订阅消息
##### 2.1 自动订阅消息
~~~ csharp
public void Configure(IApplicationBuilder app, IHostingEnvironment env, IServiceTracer tracer)
{
    if (env.IsDevelopment())
    {
        app.UseDeveloperExceptionPage();
    }
    app.RabbitMQEventBusAutoSubscribe();
    app.UseMvc();
}
~~~
##### 2.2 手动订阅消息
~~~ csharp
public void Configure(IApplicationBuilder app, IHostingEnvironment env, IRabbitMQEventBus eventBus)
{
    if (env.IsDevelopment())
    {
        app.UseDeveloperExceptionPage();
    }
    eventBus.Serialize<EventMessage, EventMessageHandler>();
    app.UseMvc();
}
~~~
#### 3. 发消息
~~~ csharp
[Route("api/[controller]")]
[ApiController]
public class EventBusController : ControllerBase
{
    private readonly IRabbitMQEventBus _eventBus;

    public EventBusController(IRabbitMQEventBus eventBus)
    {
        _eventBus = eventBus ?? throw new ArgumentNullException(nameof(eventBus));
    }

    // GET api/values
    [HttpGet]
    public IActionResult Send()
    {
        _eventBus.Publish(new
        {
            Body = "发送消息",
            Time = DateTimeOffset.Now
        }, exchange: "RabbitMQ.EventBus.Simple", routingKey: "rabbitmq.eventbus.test");
        return Ok();
    }
}
~~~
#### 4. 订阅消息
~~~ csharp
[EventBus(Exchange = "RabbitMQ.EventBus.Simple", RoutingKey = "rabbitmq.eventbus.test")]
[EventBus(Exchange = "RabbitMQ.EventBus.Simple", RoutingKey = "rabbitmq.eventbus.test1")]
[EventBus(Exchange = "RabbitMQ.EventBus.Simple", RoutingKey = "rabbitmq.eventbus.test2")]
public class MessageBody : IEvent
{
    public string Body { get; set; }
    public DateTimeOffset Time { get; set; }
}
public class MessageBodyHandle : IEventHandler<MessageBody>, IDisposable
{
    private readonly ILogger<MessageBodyHandle> _logger;

    public MessageBodyHandle(ILogger<MessageBodyHandle> logger)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public void Dispose()
    {
        Console.WriteLine("释放");
    }

    public Task Handle(EventHandlerArgs<MessageBody1> args)
    {
        _logger.Information(args.Original);
        _logger.Information(args.Redelivered);
        _logger.Information(args.Exchange);
        _logger.Information(args.RoutingKey);

        _logger.Information(args.Event.Body);
        return Task.CompletedTask;
    }
}
~~~