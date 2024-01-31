---
title: windows-terminal
date: 2019-06-25 14:04:35
categories:
- [软件开发, 运维]
tags:
    - windows-terminal
    - wsl
---

## windows-terminal

windows-terminal发布了，虽然只是预览版，目前还是很简单的部分功能，从windows商店中直接搜windows-terminal就能安装，前提是windows10已经升级1903.

## 1903 中的 wsl

经过一个下午的摸索，大致了解了一些简单的用法，推荐安装wsl版的debian或者ubuntu，开启linux子系统后在windows商店中搜索ubuntu或者debian安装就可以了。安装完成后启动一下，推荐debian，小巧，一共73m，ubuntu18要200多m。

wsl终端体验也很好，cmd中使用ssh登录经常会出现乱行的问题，wsl中则没有这个现象，而且，目前的wsl中很多操作可以对windows本身进行修改。缺什么也可以指直接使用linux的方式安装，而写windows的秋季更新中的wsl 2.0docker可以与windows中的互通。

这样一来也免了安装cygwin或者chocolatey了。

新版的vscode好像也只是直接使用wsl来进行控制台操作了，不过目前好像还是预览版中的功能。

## 配置

因为目前没有配置界面，所有的设置都是一个json文档，所以这里稍微的解释一下配置方法。

```json

{
    "$schema": "https://aka.ms/terminal-profiles-schema",
    "actions": 
    [
        {
            "command": 
            {
                "action": "copy",
                "singleLine": false
            },
            "keys": "ctrl+c"
        },
        {
            "command": "find",
            "keys": "ctrl+shift+f"
        },
        {
            "command": "paste",
            "keys": "ctrl+v"
        },
        {
            "command": 
            {
                "action": "splitPane",
                "split": "auto",
                "splitMode": "duplicate"
            },
            "keys": "alt+shift+d"
        }
    ],
    "copyFormatting": "none",
    "copyOnSelect": false,
    "defaultProfile": "{574e775e-4f2a-5b96-ac1e-a2962a402336}",
    "launchMode": "default",
    "profiles": 
    {
        "defaults": 
        {
            "acrylicOpacity": 0.43209999999999998,
            "font": 
            {
                "face": "Cascadia Code PL"
            },
            "suppressApplicationTitle": true,
            "useAcrylic": true
        },
        "list": 
        [
            {
                "commandline": "powershell.exe",
                "guid": "{61c54bbd-c2c6-5271-96e7-009a87ff44bf}",
                "hidden": true,
                "name": "Windows PowerShell"
            },
            {
                "commandline": "cmd.exe",
                "guid": "{0caa0dad-35be-5f56-a8ff-afceeeaa6101}",
                "hidden": true,
                "name": "\u547d\u4ee4\u63d0\u793a\u7b26"
            },
            {
                "font": 
                {
                    "face": "MesloLGM NF"
                },
                "guid": "{574e775e-4f2a-5b96-ac1e-a2962a402336}",
                "hidden": false,
                "name": "PowerShell",
                "source": "Windows.Terminal.PowershellCore"
            },
            {
                "guid": "{b453ae62-4e3d-5e58-b989-0a998ec441b8}",
                "hidden": true,
                "name": "Azure Cloud Shell",
                "source": "Windows.Terminal.Azure"
            },
            {
                "commandline": "ssh root@192.168.0.250",
                "name": "pve-local",
                "font": 
                {
                    "face": "Cascadia Code PL"
                },
            },
            {
                "guid": "{58ad8b0c-3ef8-5f4d-bc6f-13e4c00f2530}",
                "hidden": false,
                "name": "Debian",
                "source": "Windows.Terminal.Wsl"
            },
            {
                "colorScheme": "Vintage",
                "commandline": "wsl.exe -d Debian -u root",
                "icon": "ms-appx:///ProfileIcons/{9acb9455-ca41-5af7-950f-6bca1bc9722f}.png",
                "name": "Debian (root)",
                "startingDirectory": "%USERPROFILE%"
            }
        ]
    },
    "theme": "dark",
    "useAcrylicInTabRow": true
}
```
