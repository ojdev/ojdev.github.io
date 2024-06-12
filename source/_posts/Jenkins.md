---
title: Jenkins
date: 2024-06-11 10:16:00
updated:  2024-06-12 17:39:00
categories:
- [软件开发, 运维]
tags:
- Jenkins
- CICD
- DevOps
---

# 安装

```yaml
services:
  jenkins:
    image: jenkins/jenkins:lts-jdk21
    user: root
    container_name: jenkins
    environment:
      - TZ=Asia/Shanghai
      - DOCKER_TLS_CERTDIR=/certs
    restart: always
    privileged: true
    ports:
      - 8080:8080
      - 50000:50000
    working_dir: /var/jenkins_home
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - jenkins-data:/var/jenkins_home
volumes:
  jenkins-data:
    name: jenkins-data
```

# 启动服务

`docker compose up -d`

# 查看密码

仅在第一次启动容器后使用查看日志`docker logs jenkins-blueocean`

日志中出现如下内容

```logs
*************************************************************
*************************************************************
*************************************************************

Jenkins initial setup is required. An admin user has been created and a password generated.
Please use the following password to proceed to installation:

这里的就是管理员密码

This may also be found at: /var/jenkins_home/secrets/initialAdminPassword

*************************************************************
*************************************************************
*************************************************************
```

如果忘记了admin密码，那么进入容器，使用cat进行查询。

`docker exec -it jenkins-blueocean bash`
`cat /var/jenkins_home/secrets/initialAdminPassword`

# Jenkins 更新地址镜像修改

进入到容器内部，修改 `/var/jenkins_home/updates/default.json` ,将其中的`updates.jenkins-ci.org/download` 替换为 `mirrors.tuna.tsinghua.edu.cn/jenkins`

或者直接使用sed修改

```shell
sed -i 's/https:\/\/updates.jenkins.io\/download/http:\/\/mirrors.aliyun.com\/jenkins/g' default.json
```

有些版本是如下内容

```shell
sed -i 's/https:\/\/updates.jenkins-ci.org\/download/http:\/\/mirrors.aliyun.com\/jenkins/g' default.json
```

然后重启服务。

# Jenkins 初始化

随后使用浏览器访问`ip:8080` 填入管理员密码，点击`继续`，选择`安装推荐的插件`等待安装完成。

# 插件更新地址镜像修改

进入 `Manage Jenkins` -> `Manage Plugin` -> `Advanced` 最下面有 `Update Site`，设置为：`https://mirrors.tuna.tsinghua.edu.cn/jenkins/updates/update-center.json`




