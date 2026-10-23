---
abbrlink: 抵御SSH爆破
categories:
- - 安全防护
date: '2026-10-23T10:52:56.386573+08:00'
tags:
- 安全防护
- ssh爆破
- Fail2Ban
- aliyun
- ecs
- vps
- 主机
title: 使用 Fail2Ban 抵御阿里云服务器上的 SSH 暴力破解攻击
updated: '2026-10-23T10:52:59.561+08:00'
---
服务器公网 IP 暴露在公网上之后，SSH 登录日志里几乎每分每秒都在承受着来自全球各地扫描脚本的暴力破解（Brute-force attack）。

本文将结合一次真实的防御实战，记录如何通过 **Fail2Ban** 配合 **systemd** 后端，快速搭建起自动封禁恶意 IP 的安全防线。


## 发现威胁：查看 SSH 异常登录日志

首先，通过系统的安全日志可以观察到大量的攻击行为。例如，使用 `journalctl` 查看 SSH 服务日志：`journalctl -u ssh -f`

```accesslog
Oct 22 10:33:11 aliyun sshd[10042]: Invalid user abcd from 103.110.64.2 port 58886
Oct 22 10:33:11 aliyun sshd[10029]: Received disconnect from 103.110.64.2 port 58826:11: Bye Bye [preauth]
Oct 22 10:33:11 aliyun sshd[10029]: Disconnected from invalid user abcd 103.110.64.2 port 58826 [preauth]
Oct 22 10:33:11 aliyun sshd[10040]: Received disconnect from 103.110.64.2 port 58874:11: Bye Bye [preauth]
Oct 22 10:33:11 aliyun sshd[10040]: Disconnected from invalid user abcd 103.110.64.2 port 58874 [preauth]
Oct 22 10:33:11 aliyun sshd[10036]: Invalid user abcd from 103.110.64.2 port 58850
Oct 22 10:33:11 aliyun sshd[10044]: Invalid user accounting from 103.110.64.2 port 58908
Oct 22 10:33:11 aliyun sshd[10042]: Received disconnect from 103.110.64.2 port 58886:11: Bye Bye [preauth]
Oct 22 10:33:11 aliyun sshd[10042]: Disconnected from invalid user abcd 103.110.64.2 port 58886 [preauth]
Oct 22 10:33:12 aliyun sshd[10036]: Received disconnect from 103.110.64.2 port 58850:11: Bye Bye [preauth]
Oct 22 10:33:12 aliyun sshd[10036]: Disconnected from invalid user abcd 103.110.64.2 port 58850 [preauth]
Oct 22 10:33:12 aliyun sshd[10044]: Received disconnect from 103.110.64.2 port 58908:11: Bye Bye [preauth]
Oct 22 10:33:12 aliyun sshd[10044]: Disconnected from invalid user accounting 103.110.64.2 port 58908 [preauth]
Oct 22 10:33:12 aliyun sshd[10047]: Invalid user accounting from 103.110.64.2 port 58940
Oct 22 10:33:12 aliyun sshd[10047]: Received disconnect from 103.110.64.2 port 58940:11: Bye Bye [preauth]
Oct 22 10:33:12 aliyun sshd[10047]: Disconnected from invalid user accounting 103.110.64.2 port 58940 [preauth]
Oct 22 10:33:12 aliyun sshd[10049]: Invalid user accounting from 103.110.64.2 port 58958
Oct 22 10:33:12 aliyun sshd[10046]: Invalid user accounting from 103.110.64.2 port 58930
Oct 22 10:33:12 aliyun sshd[10051]: Invalid user accounting from 103.110.64.2 port 58966
Oct 22 10:33:12 aliyun sshd[10046]: Received disconnect from 103.110.64.2 port 58930:11: Bye Bye [preauth]
Oct 22 10:33:12 aliyun sshd[10046]: Disconnected from invalid user accounting 103.110.64.2 port 58930 [preauth]
Oct 22 10:33:12 aliyun sshd[10051]: Received disconnect from 103.110.64.2 port 58966:11: Bye Bye [preauth]
Oct 22 10:33:12 aliyun sshd[10049]: Received disconnect from 103.110.64.2 port 58958:11: Bye Bye [preauth]
Oct 22 10:33:12 aliyun sshd[10049]: Disconnected from invalid user accounting 103.110.64.2 port 58958 [preauth]
Oct 22 10:33:12 aliyun sshd[10051]: Disconnected from invalid user accounting 103.110.64.2 port 58966 [preauth]
Oct 22 10:33:13 aliyun sshd[10061]: Invalid user ace from 103.110.64.2 port 58992
Oct 22 10:33:13 aliyun sshd[10063]: Invalid user ace from 103.110.64.2 port 59008
Oct 22 10:33:13 aliyun sshd[10065]: Invalid user ace from 103.110.64.2 port 59022
Oct 22 10:33:13 aliyun sshd[10061]: Received disconnect from 103.110.64.2 port 58992:11: Bye Bye [preauth]
Oct 22 10:33:13 aliyun sshd[10061]: Disconnected from invalid user ace 103.110.64.2 port 58992 [preauth]
Oct 22 10:33:13 aliyun sshd[10069]: Invalid user ace from 103.110.64.2 port 59034
Oct 22 10:33:13 aliyun sshd[10065]: Received disconnect from 103.110.64.2 port 59022:11: Bye Bye [preauth]
Oct 22 10:33:13 aliyun sshd[10065]: Disconnected from invalid user ace 103.110.64.2 port 59022 [preauth]
Oct 22 10:33:13 aliyun sshd[10063]: Received disconnect from 103.110.64.2 port 59008:11: Bye Bye [preauth]
Oct 22 10:33:13 aliyun sshd[10063]: Disconnected from invalid user ace 103.110.64.2 port 59008 [preauth]
Oct 22 10:33:13 aliyun sshd[10071]: Invalid user ace from 103.110.64.2 port 59040
Oct 22 10:33:13 aliyun sshd[10069]: Received disconnect from 103.110.64.2 port 59034:11: Bye Bye [preauth]
Oct 22 10:33:13 aliyun sshd[10069]: Disconnected from invalid user ace 103.110.64.2 port 59034 [preauth]
Oct 22 10:33:13 aliyun sshd[10073]: Invalid user ace from 103.110.64.2 port 59048
Oct 22 10:33:13 aliyun sshd[10058]: Invalid user ace from 103.110.64.2 port 58978
Oct 22 10:33:13 aliyun sshd[10071]: Received disconnect from 103.110.64.2 port 59040:11: Bye Bye [preauth]
Oct 22 10:33:13 aliyun sshd[10071]: Disconnected from invalid user ace 103.110.64.2 port 59040 [preauth]
```

这是典型的 **SSH 暴力破解攻击（Brute-force attack）** 日志。

有人在用自动化脚本（如 Hydra、Medusa 或定制扫描器），通过 IP 地址 `103.110.64.2` 对你的服务器进行密集的 SSH 密码字典跑分。

我们需要自动化的防御工具——**Fail2Ban**。

## 配置 Fail2Ban 监控 SSH

在 Debian / Ubuntu 环境下安装好 `fail2ban` 后，推荐在 `/etc/fail2ban/jail.d/` 目录下创建独立的自定义配置文件，避免修改主配置文件。

新建并编辑 `/etc/fail2ban/jail.d/sshd.local`：

```ini
[sshd]
enabled = true
backend = systemd
mode = aggressive
maxretry = 3
findtime = 10m
bantime = 1d
port = ssh
filter = sshd
```

核心参数说明：

* `backend = systemd`：直接从 systemd journal 读取日志，效率高。
* `maxretry = 3`：允许失败尝试 3 次。
* `findtime = 10m`：在 10 分钟的滑动窗口内计算失败次数。
* `bantime = 1d`：达到阈值后，封禁该 IP 1 天（86400秒）。

配置完成后，重启 Fail2Ban 服务使生效：

```bash
systemctl restart fail2ban
```

## 验证防御效果与封禁状态

通过查看 `/var/log/fail2ban.log` 可以清晰看到拦截全过程：

`tail -f /var/log/fail2ban.log`

```
2026-10-23 10:46:04,932 fail2ban.actions        [57388]: NOTICE  [sshd] Restore Ban 101.96.205.145
2026-10-23 10:46:17,135 fail2ban.filter         [57388]: INFO    [sshd] Found 101.96.205.145 - 2026-10-23 10:46:16
2026-10-23 10:48:35,386 fail2ban.filter         [57388]: INFO    [sshd] Found 101.96.205.145 - 2026-10-23 10:48:35
2026-10-23 10:48:35,388 fail2ban.filter         [57388]: INFO    [sshd] Found 38.7.145.143 - 2026-10-23 10:48:35
2026-10-23 10:50:50,888 fail2ban.filter         [57388]: INFO    [sshd] Found 101.96.205.145 - 2026-10-23 10:50:50
2026-10-23 10:50:51,055 fail2ban.actions        [57388]: WARNING [sshd] 101.96.205.145 already banned
2026-10-23 10:53:05,136 fail2ban.filter         [57388]: INFO    [sshd] Found 101.96.205.145 - 2026-10-23 10:53:04
2026-10-23 10:55:36,636 fail2ban.filter         [57388]: INFO    [sshd] Found 101.96.205.145 - 2026-10-23 10:55:36
2026-10-23 10:58:06,885 fail2ban.filter         [57388]: INFO    [sshd] Found 101.96.205.145 - 2026-10-23 10:58:06
2026-10-23 10:58:07,196 fail2ban.actions        [57388]: WARNING [sshd] 101.96.205.145 already banned
```

查看当前被封禁的 IP 列表

`fail2ban-client status sshd`

```
root@aliyun:~# fail2ban-client status sshd
Status for the jail: sshd
|- Filter
|  |- Currently failed: 0
|  |- Total failed:     7
|  `- Journal matches:  _SYSTEMD_UNIT=sshd.service + _COMM=sshd
`- Actions
   |- Currently banned: 1
   |- Total banned:     1
   `- Banned IP list:   101.96.205.145
```

在底层防火墙（iptables）中确认`iptables -L f2b-sshd -v -n`

```
root@aliyun:~# iptables -L f2b-sshd -v -n
Chain f2b-sshd (1 references)
 pkts bytes target     prot opt in     out     source               destination
    0     0 REJECT     0    --  *      *       101.96.205.145       0.0.0.0/0            reject-with icmp-port-unreachable
    0     0 RETURN     0    --  *      *       0.0.0.0/0            0.0.0.0/0
```

通过 **Fail2Ban + Systemd 日志源 + iptables 防火墙** 的组合拳，我们能够实现：

1. **自动化响应**：无需人工干预，脚本扫描达到阈值秒级封禁。
2. **资源保护**：有效减轻 SSH 服务的并发连接压力和系统日志污染。
3. **安全闭环**：结合服务重启后的状态恢复机制（Persistent Database），确保恶意 IP 在服务器重启后依然处于黑名单中。


**注意： 服务重启后，会自动释放被ban的ip**
