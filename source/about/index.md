---
title: about
date: 2021-07-29 13:57:45+08:00
updated: 2025-10-20 20:57:00+08:00
mermaid: true
layout: about
---

# 使用mklink转移目录增加C盘空间

`mklink`是类似linux中的创建链接，文件夹转换后会在原有位置创建一个文件夹链接，保证正常使用，例如将`C:\Program Files\dotnet`的文件夹直接移动到`D:\Program Files\dotnet`，使用管理员打开cmd执行如下命令

```shell
C:\Windows\System32>mklink /J "C:\Program Files\dotnet" "D:\Program Files\dotnet"
为 C:\Program Files\dotnet <<===>> D:\Program Files\dotnet 创建的联接
```
`C:\Program Files\`目录下会出现一个带箭头的dotnet。
