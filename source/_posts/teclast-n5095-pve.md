---
title: 台电玲珑S小主机做旁路有
date: 2022-06-16 21:38:00
categories:
- .Net
tags:
    - Openwrt
    - ProxmoxVE
    - 旁路有
---

# 台电 玲珑S 2.5L小主机

之前用的是星际蜗牛矿渣，一直放在哈尔滨的家里，到上海工作后买了个小米ax1800，没有U口，所以，也就没有什么扩展性，后来虽然找到了shell版的openclash，但是性能还是太差，配置起来也比较麻烦，所以前几天发现了618的活动，899入手了[N5095](https://www.intel.cn/content/www/cn/zh/products/sku/212322/intel-celeron-processor-n5095-4m-cache-up-to-2-90-ghz/specifications.html)+8G D4+256G固态，因为是做nas的所以没选择wifi模块。到货后感觉还不错，送了硬盘线，鼠标垫和键鼠套，还带了根成品网线。

后续找了下相关的配置

| 硬件 | 参数 | 其他 |
|----|----|----|
| CPU |Intel(R) Celeron(R) N5095 @ 2.00GHz |  11代，4核，15w，支持虚拟化，21年第一季度发布|
| 内存 | 8G | 台电自己的|
| 硬盘 | 256G | Teclast YT 256GB SSD |
| 网卡 | Realtek Semiconductor Co., Ltd. RTL8111/8168/8411 | |

没播放视频，不知道是否真的能做到4k60硬解，但是看了一些其他的评测，据说不行。


# ProxmoxVE

安装过程略过，进入系统后两件事，第一是修改源，第二还是修改源
`nano /etc/apt/source.list`
```
deb http://mirrors.aliyun.com/debian bullseye main contrib

deb http://mirrors.aliyun.com/debian bullseye-updates main contrib

# security updates
deb http://mirrors.aliyun.com/debian-security bullseye-security main contrib
```
`ctrl + x ,y`保存，更换成阿里云的源。


我们再更换一个源
```shell
mv /etc/apt/sources.list.d/pve-enterprise.list /etc/apt/sources.list.d/pve-enterprise.list.bak
nano /etc/apt/sources.list.d/pve-no-enterprise.list
```
```
deb http://download.proxmox.com/debian/pve bullseye pve-no-subscription
```

`ctrl + x ,y`保存后我们再进行更新
```shell
apt update
apt upgrade -y
```

# 定制一个自己的openwrt

现在有了可以在线定制的openwrt，这是真的很方便的，[https://supes.top/](https://supes.top/)，根据自己的需要对其进行定制，目前没有专门的xray的客户端插件，所以还是选择了SSR-Plus ，看过一些评测，我比较懒，没有专门去做测试，据说性能是`SSR-Plus >PassWall2 >OpenClash`。
一般的选项如下

| 内容 | 值 |
|----|----|
| 所需软件包 (包名用空格隔开)| |
| 互联网 | SSR-Plus |
| 默认主题 | Argon |
| 后台地址 | 设置自己的本地环境的IP地址,例如 192.168.0.253 |
| 后台密码 | |
| Web服务器 | Uhttpd |
| 旁路由模式 | √ |
| IPv4 网关 | 主路由的地址，例如192.168.0.1 |
| DHCP 服务器 | 不要勾选 |
| EFI镜像 | √ |
| 主机名 | 随你喜欢 |
| ROOTFS.TAR.GZ (用于Docker或LXC等容器) | √ 仅限赞助用户|

我赞助了10元，一个月的有效期，所以直接构建后得到了`openwrt-月.日.年-x86-64-generic-rootfs.tar.gz` 文件。

下载后打开pve的管理端，选中local(pve)存储上，选择右边的CT模板，点上传，选择我们得到的tar.gz文件，点击确定，我们就得到了一个ct模板。

不能用右上角的那个创建CT按钮创建主机，会报错。我们ssh登录到pve中使用命令进行创建

```shell
pct create 100 \
	local:local:vztmpl/openwrt-月.日.年-x86-64-generic-rootfs.tar.gz \
	--rootfs local-lvm:2 \
	--ostype unmanaged \
	--hostname openwrt \
	--arch amd64 \
	--cores 1 \
	--memory 512 \
	--swap 0 \
	-net0 bridge=vmbr0,name=eth0
```

然后回到web端的管理界面启动就好了，因为IP是我们前面定制好的，所以不需要进行修改，如果需要的话，直接选中控制台，然后按回车使用`vi /etc/config/network`进行修改，改完之后记得重启，可以使用`reboot`直接重启，或者使用`/etc/init.d/network restart`只重启网络。

然后我们在浏览器就可以使用`192.168.0.253`登录到openwrt中了。
# 旁路由配置

我喜欢最少的更改，就是dhcp依然是主路由，但是网关由旁路由来做。


| 旁路由 | 主路由 |
| ---- | ---- |
| 网络->LAN->编辑->常规设置| (小米ax1800)常用设置->局域网设置，定位到DHCP服务|
|（高级设置）使用自定义的 DNS 服务器：223.5.5.5 | DNS1 ：192.168.0.253 |
| IPv4 网关: 192.168.0.1 | 默认网关：192.168.0.253 |

主路由设置完之后需要重启，路由下的网络设备会重新获取IP，获取到的网络配置中网关就自动更新为旁路由的IP地址，就可以正常使用了。

# 附加价值1

配置`SSR-Plus`，直接生效，N5095油管8k效果很稳定。
![](/assets/xray-ytb-statistics.png)