---
title: 在AzureDevops中集成SonarQube
date: 2019-06-12 10:48:13
categories:
- DevOps
tags: 
  - DevOps
  - Azure DevOps
  - SonarQube
---

[SonarQube](http://www.sonarqube.org)是管理代码质量的一个平台，有商业版也可以本地部署。

## 部署SonarQube
>[SonarQube](http://www.sonarqube.org)需要Jdk的支持；
>
>ElasticSearch是可选的；
>
>数据库使用jdbc；

本内容使用Docker进行部署
## docker-compose.yaml
```yaml
version: "3"

services:
  CodeQuality.SonarQube:
    image: sonarqube:lts  ##新版，7.x只能对master分支进行分析，需要商业授权
    container_name: codequality-sonarqube
    environment:
      - SONARQUBE_JDBC_USERNAME=${DB_POSTGRESQL_USER}
      - SONARQUBE_JDBC_PASSWORD=${DB_POSTGRESQL_PASS}
      - SONARQUBE_JDBC_URL=jdbc:postgresql://${DB_POSTGRESQL_URL_AND_PORT}/sonar
    ports:
      - "2303:9000"
      - "2302:9002"    
    volumes:
      - "/etc/timezone:/etc/timezone"
      - "/etc/localtime:/etc/localtime"          
    restart: always
```

这里使用了pgsql。

部署完成后要进行配置，用admin进行登录，点击右上角头像，选择我的账户->安全

在令牌下输入一个令牌名选择"生成",复制生成的令牌。
![](/images/2019/06/12/1.png)

## AzureDevops

在AzureDevops中安装[SonarQube](https://marketplace.visualstudio.com/items?itemName=SonarSource.sonarqube)

进入azure devops中，进入项目，进入到设置中的服务连接，新建服务连接中找到SonarQube服务连接，输入任意的名称，Server Url输入http://[部署的地址]:2303,Token输入刚刚生成的令牌，保存即可。
![](/images/2019/06/12/2.png)
以.net core生成PR审阅的时候顺便做代码质量检测举例，其他的项目有些麻烦。

1. 在生成定义中添加任务`Prepare Analysis Configuration`
1. 在`SonarQube Server Endpoint`中选择我们刚刚创建的服务连接
1. ProjectKey中填入一个名字，推荐使用`$(Build.Repository.Name)`用仓储的名字
1. Project Name可以留空
1. Project Version写一个版本号，推荐使用`PR$(Build.BuildNumber)`
以上推荐做成任务组。

继续添加.net core生成过程，Restore、Build、Test、项目路径要选择成解决方案文件。

然后添加任务`Run Code Analysis`

添加任务`Publish Quality Gate Result`

这样，在每次PR生成的时候就会自动去做代码质量检测，商业版授权，会将检测中的不合理内容直接更新到PR中，非商业代理则需要登录SonarQube去查看。

一下是实际的应用

## 定义任务组

![](/images/2019/06/12/3.png)
![](/images/2019/06/12/4.png)

## 实际应用

![](/images/2019/06/12/5.png)
![](/images/2019/06/12/6.png)