---
title: powershell7的美化
date: 2021-05-28 16:58:00
categories:
- 知识储备
tags:
- pwsh
- powershell
---

# 前言

`Powershell`已经升级到7了，目前看上去很好用了，`windows10`到今天已经原生支持了`openssh`，而且，很多的linux中的命令也可以直接在`powershell`中使用，这样免去了我单独安装子系统的的情况，`wsl2`不知道为什么，在我家的电脑上会出现丢失系统的问题，这就导致了我维护集群的配置文件和kubeconfig丢失的问题，后来想到，反正有堡垒机，不如都放上去，使用`windows terminal`直接将选项卡配置成ssh，自动登录也就都解决了，但是不可否认的是，`powershell`虽然不是太好用，但是比命令提示行强大是肯定的，无非就是一个习惯的问题，坚持了几天，也就习惯了，但是丑是没办法的，所以有了这个美化过程，很容易的。

# 安装Powershell 7
    
[Powershell7 Github](https://github.com/PowerShell/PowerShell) 根据自己的喜好进行选择，我选择了msi的安装包，大概在14还是15年的时候接触过[Chocolatey](https://chocolatey.org/)，当时角色终于在windows上也有程序包管理器了，但结果是，不好用，后来也没在关注过，这两年发现很多的地方都在推荐，其实可以尝试以下。

# 开始美化
    
一般来讲，操作步骤大同小异，我写这一篇也是因为换了新的电脑后找不到步骤了，有一个步骤一直报错，但是还想不起来怎么处理了，所以查找后找到了，也就顺手记录一下。

```powershell
set-executionpolicy remotesigned
Install-Module posh-git -Scope CurrentUser
Install-Module oh-my-posh -Scope CurrentUse
Install-Module -Name PSReadLine -Scope CurrentUser -Force -SkipPublisherCheck # 这个是自动提示的，看个人选择，一般用不上，因为自动提示后面总是会带上.exe扩展名，并且会在后面自动加一个空格，总是，我觉得不好用
```

然后为了达到每次一次打开都是设置好的美化效果，所以需要把配置写道个人配置文件中

```powershell
if (!(Test-Path -Path $PROFILE )) { New-Item -Type File -Path $PROFILE -Force } notepad $PROFILE
```

执行后会打开一个记事本，将下面内容写入到记事本中保存。

```notepad
Install-Module posh-git
Install-Module oh-my-posh
Set-PoshPrompt Paradox
```

查看所有配色方式的命令是`Get-PoshThemes`

很多教程上将`Set-PoshPrompt Paradox`写成了`Set-Theme Paradox`，是因为老版本的是这么设置的，很多时候报错也是在这里。

如果不需要自动检查更新可以只写一样
```notepad
Set-PoshPrompt Paradox
```

这样，每次打开的时候会检查更新，就不会卡。

# 设置字体

上面的步骤就美化完成了，只不过看起来还是很难看，所以需要安装字体,根据[fonts](https://ohmyposh.dev/docs/fonts)页面上的两种字体，自己选择一下就可以了，默认推荐的`MesloLGM NF`效果也不错，然后安装完字体后，默认的设置比较麻烦，所以我都是使用`terminal`的设置里找到`powershell`，然后外观中直接选字体。

在`terminal`的配置中，应该是这样的
```json
{
    "fontFace": "MesloLGM NF",
    "guid": "{574e775e-4f2a-5b96-ac1e-a2962a402336}",
    "hidden": false,
    "name": "PowerShell",
    "source": "Windows.Terminal.PowershellCore"
}
```

# 参考
- [ohmyposh](https://ohmyposh.dev/docs/)
- [fonts](https://ohmyposh.dev/docs/fonts)