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
* 如果使用linux真机可以指定vm-driver为none，这样就不需要配置交换机

hyperV的交换机
```bash
 minikube config set hyperv-virtual-switch "Default Switch"
 ```
 有空格需要用双引号包起来

 ## 创建集群

开始创建集群

 ```bash
 minikube start --image-mirror-country cn --memory 1024 --cpus 2 --registry-mirror https://*******.mirror.aliyuncs.com
 ```

 带参数--image-mirror-country cn，设置成cn就贴心的将镜像拉取送google改到了杭州aliyun
 --registry-mirror的镜像地址则会直接给docker

 可能会失败好几遍，每次失败就```minikube delete```然后重新创建就可以了
 
 最后成功内容如下
 
 ```bash
 * minikube v1.1.0 on windows (amd64)
* checking main repository and mirrors for images
* using image repository registry.cn-hangzhou.aliyuncs.com/google_containers
* Creating hyperv VM (CPUs=2, Memory=2048MB, Disk=20000MB) ...
* Configuring environment for Kubernetes v1.14.2 on Docker 18.09.6
* Pulling images ...
* Launching Kubernetes ...
* Verifying: apiserver proxy etcd scheduler controller dns
* Done! kubectl is now configured to use "minikube"
 ```

 # 控制台

 ```bash
 minikube dashboard
 ```