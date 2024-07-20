---
title: 架构蓝皮书(基础版)
date: 2019-07-16 13:00:00
categories:
- [软件开发, 架构]
tags:
    - 架构
---

组织架构

DevOps

K8S

Docker

Git

# 工欲善其事，必先利其器

## 云

首先，当一个团队开始的时候需要有装备，硬件装备是桌椅板凳电脑网络，开发过程中需要测试环境，代码管理工具等。此时，一个局域网内的私有云就够了。但是考虑到外出和在家办公的场景，那么[Aliyun](https://www.aliyun.com/)、Google云等这类的线上云是一个更好的选择，而且，再做CI/CD的时候会更方便一些。然而弊端就是需要额外的支出。

代码管理工具，一般是[GitHub](https://github.com/)，[GitLab](https://about.gitlab.com/)，[Azure DevOps](https://azure.microsoft.com/zh-cn/services/devops/)，这里推荐Azure DevOps。

## 敏捷

一个团队，再项目进程中需要一个合理的管理，节点日期，任务管理分配，时间计算等，一个有效率的团队不应该是一个大的团队，即使有了大的团队，也应该根据不同的场景进行拆分，目前看来，一个敏捷团队再3人以上，7人一下应该是比较合理的，7人以上应该也没问题，但是个人感觉，效率可能会有个折扣。

敏捷团队要做什么？按照以往的文章与成书中描述，是透明，检验，适应。

### 透明

透明是指在开发环节中保持高度的可见性，所有的成员都应该知道和理解进度和要做的内容。

### 检验

开发过程中要做到足够的检验，用以确保开发过程中能够及时的发现重大偏差以及错误。

### 适应

在上面的检验中发现了重大的偏差以及错误，那么应该即使的调整并纠正，来检查偏差以及错误带来的损失。

### 敏捷怎么做

敏捷中有3个角色，分别是PO（产品负责人），SM（敏捷大师），Dev（开发人员）。

#### 产品负责人

#### 开发团队

#### 敏捷大师

#### 误区

敏捷模式不是万能的，而且不应该为了敏捷而敏捷，在开发过程中，应该根据团队自身情况对敏捷进行调整，例如由PO担任SM的角色也是可以的。

## 微服务

微服务，将业务划分为最小单位，彼此独立，充分的解耦，语言无关性，一个最小化的服务可以是任意的语言进行开发，采用http或者rpc在服务之间进行交互。部署简单，对某一个服务进行升级的时候不会影响整个环境，甚至在某些集群中可以做到无感切换。

敏捷是最适合微服务开发的一种模式。

# Azure DevOps

[Azure DevOps](https://azure.microsoft.com/zh-cn/services/devops/)免费提供线上的版本，好处是一直使用到最新的版本，但是没有足够的本地化，当然也免去了多余的费用。

另外，[Azure DevOps](https://azure.microsoft.com/zh-cn/services/devops/)还提供了[本地服务器版本](https://go.microsoft.com/fwlink/?LinkId=2041267&clcid=0x804),下载后直接在本地的服务器安装就可以使用了。

> 它能做什么
> 1. 它提供了交互较好的板管理，并且很大程度上可以进行自定义
> 1. 它有完整的长篇故事，积压工作项，任务，bug的管理
> 1. 并且仓储支持Git以及VSTS自身的仓储管理
> 1. 而且可以安装很多插件
> 1. 还有WebHook可以有一系列的事件触发
> 1. 可以接入很多第三方服务

对于使用Visual Studio进行开发的团队，Azure DevOps是一个不二选择。

## 创建团队

首先创建一个团队，打开项目设置，进入常规下的团队中，新建团队，起一个名字，填写说明并保存，
随后点击进入刚创建的团队，添加成员。

![](/images/architecture_1.png)

## 创建一个迭代

进入Boards下面的项目配置中，在合适的层级点新建或者在层级下新建子级，填入迭代名称，设置迭代周期，点击保存并关闭

![](/images/architecture_2.png)

## 冲刺面板

进入Brards下的冲刺菜单，右侧打开面板，选择一个冲刺，右面区域的左上角选择也给冲刺，右侧可以在该冲刺下面创建一个新的冲刺，

![](/images/architecture_4.png)

点击容量，对团队成员进行配置，用来处理对应的燃尽图。

![](/images/architecture_3.png)

### 积压项

点新建工作项，添加新的积压项，然后在积压项下创建任务，并进行跟踪。

![](/images/architecture_5.png)

# DDD

DDD,被称作为领域驱动设计，做了这么久，其实最大的难点在于聚合根的设计上，总是会出现不恰当的存在。

# Git

# Docker

# CQRS

## EventSource

# .Net Core

## 健康检查

.Net Core默认已经支持了健康检查，只要在代码中开启功能就可以了

```csharp
public IServiceProvider ConfigureServices(IServiceCollection services){
    ...
    services.AddHealthChecks();
    ...
}

public void Configure(IApplicationBuilder app) {
    ...
    app.UseHealthChecks("/hc", new HealthCheckOptions
    {
        ResultStatusCodes =
        {
            [Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Healthy] = StatusCodes.Status200OK,
            [Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Degraded] = StatusCodes.Status200OK,
            [Microsoft.Extensions.Diagnostics.HealthChecks.HealthStatus.Unhealthy] = StatusCodes.Status503ServiceUnavailable
        }
    });
    #endregion    ...
}
```

## CQRS

## 单元测试

## 多版本API

## Swagger

## 消息队列

### 消息中心

## Gateway

# 集群

## Docker Swarm

## kubernetes

# 其他

[一个框架](https://github.com/ojdev/NetCoreTemplate) 它不一定是对的，但是它有参考价值。
