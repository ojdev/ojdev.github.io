---
date: '2021-07-29T13:57:45+08:00'
layout: about
mermaid: true
title: about
updated: '2025-11-07T10:59:57.850+08:00'
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
