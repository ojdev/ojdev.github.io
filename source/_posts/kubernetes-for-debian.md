---
title: k8s的环境搭建
date: 2019-06-03 17:31:00
categories:
- [软甲开发, 运维]
tags:
  - k8s
  - debian9
---

依然是模拟环境，使用windows10的hyperV。

在虚拟机中安装debian9，只要核心的那种，开openssh的。

更新debian
```shell
apt update
apt upgrade -y
```

## 开启root的ssh登录

修改`/etc/ssh/sshd_config`中的 `PermitRootLogin`为`PermitRootLogin yes`，保存
然后重启`/etc/init.d/ssh restart`
非必须

## 关闭交换内存
>kubernetes 的想法是将实例紧密包装到尽可能接近100％。 所有的部署应该与 CPU 和内存限制固定在一起。 所以如果调度程序发送一个 pod 到一台机器，它不应该使用交换，设计者不想交换，因为它会减慢速度，所以关闭 swap 主要是为了性能考虑。当然为了一些节省资源的场景，比如运行容器数量较多，可添加 kubelet 参数 --fail-swap-on=false 来解决。

```shell
swapoff -a 
nano /etc/fstab
```
找到swap was on /dev/sda3 during installation
把下面的/dev开头的注释掉

或者在init的时候使用参数`kubeadm init --ignore-preflight-errors Swap`

## 然后安装[k8s的aliyun源](https://opsx.alibaba.com/mirror?lang=zh-CN)
```shell
apt-get update && apt-get install -y apt-transport-https
curl https://mirrors.aliyun.com/kubernetes/apt/doc/apt-key.gpg | apt-key add - 
cat <<EOF >/etc/apt/sources.list.d/kubernetes.list
deb https://mirrors.aliyun.com/kubernetes/apt/ kubernetes-xenial main
EOF  
apt-get update
apt-get install -y kubelet kubeadm kubectl
apt-mark hold kubelet kubeadm kubectl
```

## 添加docker源

```shell
curl -fsSL https://download.docker.com/linux/debian/gpg | apt-key add -

cat <<EOF>/etc/apt/sources.list.d/docker.list
deb [arch=amd64] https://download.docker.com/linux/debian stretch stable
EOF
apt update
apt install -y docker-ce
```

## 添加docker的aliyun镜像源[参考](https://kubernetes.io/docs/setup/cri/)
```shell
cat <<EOF>/etc/docker/daemon.json
{
  "registry-mirrors": ["https://********.mirror.aliyuncs.com"],
  "exec-opts": ["native.cgroupdriver=systemd"],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m"
  },
  "storage-driver": "overlay2"
}
EOF
mkdir -p /etc/systemd/system/docker.service.d
systemctl daemon-reload
systemctl restart docker
systemctl enable docker
```

重启系统，让所有配置生效。

## 开始集群初始化
```shell
kubeadm init --image-repository registry.cn-hangzhou.aliyuncs.com/google_containers
```
`--image-repository`指定拉取镜像的地址，避免从google无法访问的情况
成功后的内容
```shell
Your Kubernetes control-plane has initialized successfully!

To start using your cluster, you need to run the following as a regular user:

  mkdir -p $HOME/.kube
  sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
  sudo chown $(id -u):$(id -g) $HOME/.kube/config

You should now deploy a pod network to the cluster.
Run "kubectl apply -f [podnetwork].yaml" with one of the options listed at:
  https://kubernetes.io/docs/concepts/cluster-administration/addons/

Then you can join any number of worker nodes by running the following on each as root:

kubeadm join 172.17.183.236:6443 --token 4xr9ys.yxaxewry4xarkghy \
    --discovery-token-ca-cert-hash sha256:3a73933bfd0fb5e2fe2e045292a395d55c652e9e8a141111335b1710350f9d37

```


创建成功后根据提示进行操作，记录最下面的链接语句，以备其他节点接入。

## 安装Helm
先去[Helm](https://github.com/helm/helm/releases)的releases页面查看当前最高的版本号，目前最高的是2.14.1

### 下载并安装
```shell
curl -O -L https://get.helm.sh/helm-v2.14.1-linux-amd64.tar.gz
tar -zxvf helm-v2.14.1-linux-amd64.tar.gz
mv linux-amd64/helm /usr/local/bin/helm
```

创建tiller的serviceaccount和clusterrolebinding
```shell
kubectl create serviceaccount --namespace kube-system tiller
kubectl create clusterrolebinding tiller-cluster-rule --clusterrole=cluster-admin --serviceaccount=kube-system:tiller
helm init --history-max 200  --service-account tiller --stable-repo-url https://kubernetes.oss-cn-hangzhou.aliyuncs.com/charts
```
## 安装Istio

先去[Istio](https://github.com/istio/istio/releases)的releases页面查看当前最高的版本号，目前最高的是1.2.0
### 下载并安装
```shell
curl -L https://git.io/getLatestIstio | ISTIO_VERSION=1.2.0 sh -
```
或者下载还未正式提供的版本1.2.1
```shell
curl -O -L https://github.com/istio/istio/archive/1.2.1.tar.gz
tar -zxvf 1.2.1.tar.gz
cd istio-1.2.1
```
