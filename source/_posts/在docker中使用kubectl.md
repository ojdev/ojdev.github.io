---
title: 关于在Windows中使用Terminal连接SSH登录远程机器中的docker容器中使用kubectl管理集群的那些事
date: 2021-01-13 18:23:08
categories:
- DevOps
tags:
    - Docker
    - kubectl
    - 远程管理
---

不知道为什么我的`Windows 10`安装了`wsl2`后，会莫名其妙的失踪，各种检查都没问题，我怀疑可能处在`软raid`的问题上，但是不的又不影响。但是这又影响到了我日常的工作，所以我就想，在`nas`上用`docker`部署一个`kubectl`，然后通过远程访问，这样不用在本地安装任何东西了。

经过将近一天的实验，终于搞定了，用W`indows Terminal`作为终端，远程通过`ssh`连接到`nas`运行`docker exec`进入容器的终端，中间经历了如何安装`bash-completion`的过程，最后几乎完美。

镜像选用[https://hub.docker.com/_/bash](https://hub.docker.com/_/bash),13.6MB十分小巧。

`kubectl`直接[https://kubernetes.io/zh/docs/tasks/tools/install-kubectl/](https://kubernetes.io/zh/docs/tasks/tools/install-kubectl/)下载到`nas`的一个路径中例如我放在了`/nas/opt/kubectl/`下面。

# docker-compose.yaml的内容

```yml
version: "3.3"
services:
  kubectltest:
    image: bash:5.1.4
    container_name: kubectltest
    user: 0:0
    environment:
      - KUBECONFIG=/.kube/config
    command: ["bash", "-c", "apk add bash-completion && echo 'source /usr/share/bash-completion/bash_completion'> ~/.bashrc && mkdir /etc/bash_completion.d && kubectl completion bash >/etc/bash_completion.d/kubectl && tail -f /dev/null"]
    volumes:
      - /nas/opt/kubectl/config/test:/.kube
      - /nas/opt/kubectl/kubectl:/usr/local/bin/kubectl
    restart: always
    deploy:
      resources:
        limits:
          cpus: '0.3'
          memory: 128M
  kubectlpre:
    image: bash:5.1.4
    container_name: kubectlpre
    user: 0:0
    environment:
      - KUBECONFIG=/.kube/config
    command: ["bash", "-c", "apk add bash-completion && echo 'source /usr/share/bash-completion/bash_completion'> ~/.bashrc && mkdir /etc/bash_completion.d && kubectl completion bash >/etc/bash_completion.d/kubectl && tail -f /dev/null"]
    volumes:
      - /nas/opt/kubectl/config/pre:/.kube
      - /nas/opt/kubectl/kubectl:/usr/local/bin/kubectl
    restart: always
    deploy:
      resources:
        limits:
          cpus: '0.3'
          memory: 128M
```

`bash`的镜像里竟然直接带了`apk`的包管理器这是我没想到的，真的小巧灵活好用，上面command里:

1. 装bash-completion
1. 把source /usr/share/bash-completion/bash_completion写入到 ~/.bashrc，每次登陆后就可以直接使用kubectl自动提示
1. 创建目录 mkdir /etc/bash_completion.d 用来存放自动提示文件
1. kubectl completion bash >/etc/bash_completion.d/kubectl 写入自动提示
1. tail -f /dev/null 保持容器运行


`/nas/opt/kubectl/config/pre`存放的是`config`文件,我平时要管理多个集群，所以我这里又多个目录。

# Windows Terminal 配置

``` json
            {
                "guid": "{58ad8b0c-3ef8-5f4d-bc6f-13e4c00f2534}",
                "hidden": false,
                "name": "测试环境",
                "commandline": "ssh -t root@192.168.0.250 \"/bin/docker exec -it kubectltest bash\"",
                "icon": "ms-appx:///ProfileIcons/{61c54bbd-c2c6-5271-96e7-009a87ff44bf}.png",
                "colorScheme": "Vintage"
            },
            {
                "guid": "{58ad8b0c-3ef8-5f4d-bc6f-13e4c00f2535}",
                "hidden": false,
                "name": "预发布环境",
                "commandline": "ssh -t root@192.168.0.250 \"/bin/docker exec -it kubectlpre bash\"",
                "icon": "ms-appx:///ProfileIcons/{61c54bbd-c2c6-5271-96e7-009a87ff44bf}.png",
                "colorScheme": "One Half Light"
            },
```

重点在哪个`ssh -t`，不然会进不去，这样就完成了一个在本地打开终端直接进入到`nas`里的`docker`容器中进行`kubectl`管理集群的套娃操作。

# 最后总结

1. 远程连接的时候`ssh`的`-t`参数是`tty`的意思，不加这个参数后面的`docker exec -it`会报`the input device is not a TTY`错，进不去的。
1. `docker-compose.yml`中的`command`节点中多条命令用`&&`分隔，如果是`&`分隔，或造成命令并行执行，前一个还没结束，后一个就执行完了。