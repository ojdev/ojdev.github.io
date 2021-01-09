---
title: windows-terminal
date: 2019-06-25 14:04:35
categories:
- 收集
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
    "globals" : 
    {
        "alwaysShowTabs" : true,
        "defaultProfile" : "{c6eaf9f4-32a7-5fdc-b5cf-066e8a4b1e40}", //profiles节点中的guid，表示默认打开那个命令行
        "initialCols" : 120,
        "initialRows" : 30,
        "keybindings" : 
        [
            //这部分是快捷键
        ],
        "requestedTheme" : "system",
        "showTabsInTitlebar" : true,
        "showTerminalTitleInTitlebar" : true
    },
    "profiles" : 
    [
        {
            "acrylicOpacity" : 0.5, //毛玻璃效果的透明度，推荐0.75
            "background" : "#012456",
            "closeOnExit" : true,
            "colorScheme" : "Campbell", //对应schemes节点中的配色方案，默认这个算是好看的，其他的还是难看了点
            "commandline" : "powershell.exe",
            "cursorColor" : "#FFFFFF",
            "cursorShape" : "bar",
            "fontFace" : "Consolas",
            "fontSize" : 10,
            "guid" : "{61c54bbd-c2c6-5271-96e7-009a87ff44bf}", //id用来做标识
            "historySize" : 9001,
            "icon" : "ms-appx:///ProfileIcons/{61c54bbd-c2c6-5271-96e7-009a87ff44bf}.png", //图标这中间的id不需要与guid对应。
            "name" : "Windows PowerShell", //显示的名字
            "padding" : "0, 0, 0, 0",
            "snapOnInput" : true,
            "startingDirectory" : "%USERPROFILE%",  //默认打开命令行窗口定位到的路径
            "useAcrylic" : true  //是否打开毛玻璃效果
        },
        {
            "acrylicOpacity" : 0.75,
            "closeOnExit" : true,
            "colorScheme" : "Campbell",
            "commandline" : "cmd.exe",
            "cursorColor" : "#FFFFFF",
            "cursorShape" : "bar",
            "fontFace" : "Consolas",
            "fontSize" : 10,
            "guid" : "{0caa0dad-35be-5f56-a8ff-afceeeaa6101}",
            "historySize" : 9001,
            "icon" : "ms-appx:///ProfileIcons/{0caa0dad-35be-5f56-a8ff-afceeeaa6101}.png",
            "name" : "cmd",
            "padding" : "0, 0, 0, 0",
            "snapOnInput" : true,
            "startingDirectory" : "%USERPROFILE%",
            "useAcrylic" : true
        },
        {
            "acrylicOpacity" : 0.75,
            "closeOnExit" : true,
            "colorScheme" : "One Half Dark",
            "commandline" : "wsl.exe -d Debian",
            "cursorColor" : "#FFFFFF",
            "cursorShape" : "bar",
            "fontFace" : "Consolas",
            "fontSize" : 10,
            "guid" : "{c6eaf9f4-32a7-5fdc-b5cf-066e8a4b1e40}",
            "historySize" : 9001,
            "icon" : "ms-appx:///ProfileIcons/{9acb9455-ca41-5af7-950f-6bca1bc9722f}.png",
            "name" : "Debian",
            "padding" : "0, 0, 0, 0",
            "snapOnInput" : true,
            "startingDirectory" : "%USERPROFILE%",
            "useAcrylic" : true
        },
        {
            "acrylicOpacity" : 0.75,
            "closeOnExit" : true,
            "colorScheme" : "Campbell",
            "commandline" : "wsl.exe -d Debian -u root",  //用root用户的形式启动wsl
            "cursorColor" : "#FFFFFF",
            "cursorShape" : "bar",
            "fontFace" : "Consolas",
            "fontSize" : 10,
            "guid" : "{c6eaf9f4-32a7-5fdc-b5cf-066e8a4b1e41}",
            "historySize" : 9001,
            "icon" : "ms-appx:///ProfileIcons/{9acb9455-ca41-5af7-950f-6bca1bc9722f}.png",
            "name" : "Debian(root)",
            "padding" : "0, 0, 0, 0",
            "snapOnInput" : true,
            "startingDirectory" : "%USERPROFILE%",
            "useAcrylic" : true
        },
        {
            //这个条目是我自己添加的
            "acrylicOpacity" : 0.75,
            "closeOnExit" : true,
            "colorScheme" : "Campbell",
            "commandline" : "wsl.exe -d Debian -u root -e ssh root@***.***.***.***",  //启动一个ssh，如果在wsl中已经做了免密登录，则会直接进入ssh中
            "cursorColor" : "#FFFFFF",
            "cursorShape" : "bar",
            "fontFace" : "Consolas",
            "fontSize" : 10,
            "guid" : "{c6eaf9f4-32a7-5fdc-b5cf-066e8a4b1e42}",//id修改一下，随便改一下就可以，只要满足guid规则。
            "historySize" : 9001,
            "icon" : "ms-appx:///ProfileIcons/{9acb9455-ca41-5af7-950f-6bca1bc9722f}.png",
            "name" : "ssh(root)",
            "padding" : "0, 0, 0, 0",
            "snapOnInput" : true,
            "startingDirectory" : "%USERPROFILE%",
            "useAcrylic" : true
        }
    ],
    "schemes" : 
    [
        {
            "background" : "#0C0C0C",
            "black" : "#0C0C0C",
            "blue" : "#0037DA",
            "brightBlack" : "#767676",
            "brightBlue" : "#3B78FF",
            "brightCyan" : "#61D6D6",
            "brightGreen" : "#16C60C",
            "brightPurple" : "#B4009E",
            "brightRed" : "#E74856",
            "brightWhite" : "#F2F2F2",
            "brightYellow" : "#F9F1A5",
            "cyan" : "#3A96DD",
            "foreground" : "#F2F2F2",
            "green" : "#13A10E",
            "name" : "Campbell",
            "purple" : "#881798",
            "red" : "#C50F1F",
            "white" : "#CCCCCC",
            "yellow" : "#C19C00"
        },
        //其他配色方案
    ]
}
```