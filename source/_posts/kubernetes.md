---
title: 在windows上创建kubernetes集群
date: 2019-05-22 16:59:56
tags: hyperV, minikube, kubernetes, windows10
---
# 环境
> Windows 10 Pro 1903
> [Minikube](https://github.com/kubernetes/minikube)
> 代理环境（127.0.0.1:1080）
# 准备工作

## 下载minikube
[Release](https://github.com/kubernetes/minikube/releases/tag/v1.1.0)
下载最新的版本，保存到F:\k8s文件夹中，并重命名为`mikikube`

在小娜哪里搜索env，选择`编辑系统环境变量`,在path节点中增加`F:\k8s`；增加新的环境变量`MINIKUBE_HOME`值为`F:\\k8s`(注意是双斜杠)

打开命令提示行，推荐[terminal](https://github.com/microsoft/terminal)

对minikube进行配置:

使用hyperv创建
```bash
minikube config set vm-driver hyperv
```
hyperV的交换机名成
```bash
 minikube config set hyperv-virtual-switch "Default Switch"
 ```
 有空格需要用双引号包起来

 ## 创建集群

因为需要从google下载iso，所以需要一个代理
 ```bash
 set HTTPS_PROXY=127.0.0.1:1080
 set HTTP_PROXY=192.168.0.252:1081
 set NO_PROXY=172.17.0.0/12,localhost,127.0.0.1,192.168.0.1/24
 ```
 
172.17.0.0/12是minikube的ip段，是不需要代理的，其他的是本地资源的地址也是不需要代理的，如果不写NO_PROXY，创建集群的时候可能会出现问题

 或者手动下载iso放到本地的服务器
 ```bash
 minikube config set iso-url http://127.0.0.1/minikube-v1.1.0.iso
 ```

推荐使用本地服务器

开始创建集群

 ```bash
 minikube start
 ```