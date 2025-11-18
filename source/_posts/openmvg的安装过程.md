---
abbrlink: ''
categories:
- - 知识储备
date: '2025-11-18T14:34:53.576742+08:00'
tags:
- openmvg
title: openmvg的安装过程
updated: '2025-11-18T16:01:04.932+08:00'
---
参考：[openMVG/BUILD.md](https://github.com/openMVG/openMVG/blob/develop/BUILD.md#windows)

# 准备工作

需要安装Visual Studio 2022

安装[CMake 3.30.9](https://cmake.org/files/v3.30/)

安装[Graphviz](https://graphviz.org/download/) 要选中添加到环境变量

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

等生成完成后，会在目录下生成一个`Windows-AMD64-`，至此编译完成，可以将此目录添加到环境变量中。

# 使用

将拍摄的照片放到`D:\imgs`中，输出到`D:\imgsout`

```powershell
openMVG_main_SfMInit_ImageListing.exe -i D:\imgs -o D:\imgsout -f 4838 sfm_data.json

openMVG_main_ComputeFeatures.exe -i D:\imgsout\sfm_data.json -o D:\imgsout

openMVG_main_ComputeMatches.exe -i D:\imgsout\sfm_data.json -o D:\imgsout\matches.putatives.bin

openMVG_main_GeometricFilter.exe -i D:\imgsout\sfm_data.json -m D:\imgsout\matches.putatives.bin -g f -o D:\imgsout\matches.f.bin

openMVG_main_SfM.exe --sfm_engine "INCREMENTAL" -i D:\imgsout\sfm_data.json -m D:\imgsout -o D:\imgsout\regconstruction

openMVG_main_ExportUndistortedImages.exe -i D:\imgsout\sfm_data.json -o D:\imgsout\regconstruction\undistortedimage

CD D:\imgsout\regconstruction
openMVG_main_openMVG2openMVS.exe -i sfm_data.bin -o scene.mvs
```

然后打开`ui_openMVG_MatchesViewer.exe`,File中选择`sfm_data.json`,再选择`matches.putatives.bin`就可以查看了。


下载[Releases · cdcseacave/openMVS](https://github.com/cdcseacave/openMVS/releases) 解压后，将上面生成的`D:\imgsout\regconstruction\scene.ms`拖到`Viewer.exe`上可以查看生成的3D模型。
