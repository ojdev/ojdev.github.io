---
abbrlink: ''
categories:
- - 知识储备
date: '2025-11-18T14:34:53.576742+08:00'
tags:
- openmvg
title: openmvg的安装过程
updated: '2025-11-18T14:34:53.984+08:00'
---
参考：[openMVG/BUILD.md](https://github.com/openMVG/openMVG/blob/develop/BUILD.md#windows)


# 准备工作

需要安装Visual Studio 2022

安装CMake 3.30.9

## 安装vcpkg

在D盘根目录

```powershell
git clone https://github.com/Microsoft/vcpkg
cd vcpkg
./bootstrap-vcpkg.bat

.\vcpkg.exe install openmvg[core,openmp,opencv]

```

## 编译openMVG

同样在D盘根目录

```powershell
git clone --recursive https://github.com/openMVG/openMVG.git
```

打开`D:\openMVG\src\CMakeLists.txt`

找到`option(OpenMVG_USE_RERUN "Enable Rerun logging" ON)`修改为`option(OpenMVG_USE_RERUN "Enable Rerun logging" OFF)`

然后继续在D盘根目录

```powershell
mkdir openMVG_Build
cd openMVG_Build
cmake -G "Visual Studio 17 2022" -A x64 -DCMAKE_TOOLCHAIN_FILE=D:/vcpkg/scripts/buildsystems/vcpkg.cmake -DOPENMVG_USE_RERUN=OFF -DEIGEN_INCLUDE_DIR_HINTS="D:/vcpkg/installed/x64-windows/include" ../openMVG/src/
```

完成后，使用visual studio 2022打开`openMVG_Build`目录下的`openMVG.sln`点菜单中的`生成`->`生成解决方案`

等生成完成后，会在目录下生成一个`Windows-AMD64-`，至此编译完成。
