---
title: Linux中开启samba
date: 2023-06-30 14:46:09
updated: 2023-06-30 14:46:09
categories:
- 家庭服务
tags:
- NAS
- Jellyfin
- Proxmox VE
- PVE
---

# 更新与安装
```bash
apt update
apt upgrade -y
apt install nano samba -y
```

# 配置

切换目录到`/etc/samba`,编辑配置文件`nano smb.conf`,在文件的最后添加
```conf
[datacenter]
    comment = 描述
    path  = /路径
    guest ok = no  ;或yes
    browsable = no ;或yes
    ;write list = root
```
保存后添加账户`smbpasswd -a root`输入新的密码，然后重启服务
```bash
systemctl restart smdb
systemctl restart samba
systemctl enable --now smbd
```

# 添加新账号

```bash 
useradd user1

smbpasswd -a user1
```

