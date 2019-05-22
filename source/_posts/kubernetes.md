---
title: kubernetes
date: 2019-05-22 16:59:56
tags:
---

# 创建虚拟机主节点

在windows上模拟kubernetes集群，推荐使用hyper-v

打开Hyper-V管理器，点击右侧快速创建，在弹出的窗口中选择左侧的Ubuntu 19.04，点击右下角的创建虚拟机，就会自动下载镜像并创建，国内下载镜像较慢，推荐挂上全局的代理。

创建完虚拟机后给该虚拟机重命名为k8s-master作为主节点。选择连接，开始自动安装并配置ubuntu。

# 在主节点中安装k8s

我们采用[minikube](https://github.com/kubernetes/minikube)来安装，简单快捷.

```bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64 && sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

因为要连接到google，所以可能需要代理，使用下面的方式

```bash
https_proxy=192.168.0.1:1080 curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64 && sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

安装完成后查看一下版本号，确认安装成功

```bash
minikube version
```
如果安装成功则会打印出版本号

开始创建集群

```bash
minikube start
```

同样，如果需要的话使用代理

```bash
https_proxy=192.168.0.1:1080 minikube start
```
