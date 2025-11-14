---
date: '2021-07-29T13:57:45+08:00'
layout: about
mermaid: true
title: about
updated: '2025-11-14T18:28:05.263+08:00'
---
# 使用mklink转移目录增加C盘空间

`mklink`是类似linux中的创建链接，文件夹转换后会在原有位置创建一个文件夹链接，保证正常使用，例如将`C:\Program Files\dotnet`的文件夹直接移动到`D:\Program Files\dotnet`，使用管理员打开cmd执行如下命令

```shell
C:\Windows\System32>mklink /J "C:\Program Files\dotnet" "D:\Program Files\dotnet"
为 C:\Program Files\dotnet <<===>> D:\Program Files\dotnet 创建的联接
```

`C:\Program Files\`目录下会出现一个带箭头的dotnet。

## 常用内容

```shell
mklink /J "C:\Program Files\dotnet" "D:\Program Files\dotnet"
```

# 使用本地代理代理git

```shell
git config --global http.proxy 127.0.0.1:10808
```

# comfy cli启动时传入参数

```shell
comfy launch -- --lowvram --bf16-unet --bf16-vae --bf16-text-enc
```

# 在python中使用gpu

由于有些时候直接安装依赖后并未使用gpu，所以需要单独处理一下,cuda13可以向下兼容。

先下载[CUDA Toolkit - Free Tools and Training | NVIDIA Developer](https://developer.nvidia.com/cuda-toolkit) 并安装。

然后下载 [cuDNN 历史版本 | NVIDIA 开发者](https://developer.nvidia.cn/rdp/cudnn-archive)，然后解压后将`bin`,`include`,`lib`三个文件夹复制到CUDA Toolkit的目录中，默认为`C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v13.0`

```shell
pip uninstall torch
pip install torch torchvision torchaudio --extra-index-url https://download.pytorch.org/whl/cu130
```

验证

```python
import torch
print(torch.cuda.is_available())

# 会输出 True
```

# PostgreSQL碎片整理

## VACUM

会重写表中的每一行数据，整理存储碎片，压缩表空间；会重建表的所有索引，整理索引碎片压缩索引空间。

VACUM不会锁表

```pgsql
VACUM 表名
VACUM FULL 表名
```

## pg_repack

注意事项

* **存储空间**：全表重组时，剩余存储空间需至少为待重组表大小的两倍。
* **限制**：pg\_repack 无法操作临时表和 GiST 索引。
* **性能影响**：重组表和索引时会占用较多磁盘 IO，需提前评估对业务的影响。
* **权限问题**：若遇到权限报错，可使用 *--no-superuser-check* 参数，但全表重组仍需超级用户权限。

通过 pg\_repack，您可以高效地优化 PostgreSQL 数据库的表空间，提升性能并减少存储浪费。

```pgsql
postgres -hCREATE EXTENSION pg_repack

# 检查但不执行
pg_repack --dry-run --no-superuser-check --echo --no-order -h 主机 -p 端口 -d 数据库 -U 用户 --table schema1.table1
# 检查并执行
pg_repack --no-superuser-check --echo --no-order -h 主机 -p 端口 -d 数据库 -U 用户 --table schema1.table1
```

# windows环境下的使用ssh鉴权登录

```powershell
ssh-keygen -t rsa -C "a@b.work"
type $env:USERPROFILE\.ssh\id_rsa.pub | ssh -p 端口 用户名@IP "cat >> ./.ssh/authorized_keys"

```

# kubectl在linux中按tab不提示

```shell
echo 'source <(kubectl completion bash)' >>~/.bashrc
or
apt install bash-completion
kubectl completion bash >/etc/bash_completion.d/kubectl
source /usr/share/bash-completion/bash_completion
```

#
