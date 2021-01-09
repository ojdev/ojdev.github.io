---
title: 没事穷折腾：fastboot刷机
date: 2012-05-28 16:04:56
categories:
- 收集
tags:
---

我有个HTC G7，没事我就穷折腾，各种刷机，刷过各种第三方，刷过RUU，刷过自己用厨房定制的各种ROM，现在一直在使用CM9。

所以想用fastboot来刷机，看看怎么刷。首先启动到bootloader界面，然后输入如下命令

~~~ cmd
fastboot +w      清除userdata和cache
fastboot erase system
fastboot erase boot
~~~

然后使用recovery开始刷新的rom吧。当然还有其他的方式，但是我没那么用过。

~~~ cmd
fastboot flash hboot hboot.img      刷hboot
fastboot flash recovery recovery.img      刷recovery
fastboot flash radio radio.img      刷RADIO
fastboot flash boot boot.img      刷BOOT
fastboot flash system system.img      刷system
fastboot flash userdata userdata.img      刷用户数据
fastboot reboot      重启
~~~