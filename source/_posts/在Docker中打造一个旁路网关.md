---
abbrlink: docker旁路网关
categories:
- - NAS
date: '2025-11-15T16:26:06.527679+08:00'
tags:
- NAS
- Docker
- 旁路网关
- 科学上网
title: 在Docker中打造一个旁路网关
updated: '2025-11-15T16:26:11.055+08:00'
---
家里设备较多，有些设备有需要保持代理状态，所以每个设备都去做代理，遇到更新的时候就会很麻烦，单独部署一个软路由又会增加不必要的成本，十有八九是性能浪费，我并不需要极端小的延迟，够用就好，于是在Proxmox VE 9中本身存在的Docker中安装一个Mihomo，用来作为网关代理局域网中的流量。


# 方案对比

对比了常用的xray和clash，xray设置较为复杂，以前设置过一次虽然成功了，但是会导致我的游戏无法登录，而clash又已经不再维护，

经过gemini的一番比对，所有选择了Mihomo。


# 准备工作

mihomo作为clash后续的替代，保持了更新，而且配置上又可以直接使用clash的文件，所以方便多了。

不包含docker的安装过程，如果需要可以参考：[docker-ce | 镜像站使用帮助 | 清华大学开源软件镜像站 | Tsinghua Open Source Mirror](https://mirrors.tuna.tsinghua.edu.cn/help/docker-ce/)


## 开启 IP 转发

```shell
# 永久生效
echo "net.ipv4.ip_forward = 1" >> /etc/sysctl.conf
sysctl -p
```

## docker-compose

文件保存:`/root/docker/docker-compose.yml`

```yaml
services:
  mihomo:
    image: metacubex/mihomo:latest
    container_name: mihomo
    restart: always
    # 启用特权模式，允许创建 TUN 接口并修改 iptables
    privileged: true
    network_mode: host # 使用 host 网络模式，方便设置透明网关和让 PVE 宿主机使用
    environment:
      # mihomo 监听的 TPROXY 端口，与 config.yaml 中的 TPROXY 端口保持一致
      TPROXY_PORT: 7893
      # 启用透明代理模式（重要）
      TPROXY_MODE: "true"
      # 是否绕过中国大陆 IP（重要：设置为 false，mihomo才能根据规则处理所有流量）
      BYPASS_CN: "false"
    volumes:
      - ./mihomo/config.yaml:/root/.config/mihomo/config.yaml # 映射配置文件
      - ./mihomo/ruleset:/root/.config/mihomo/ruleset
      - ./mihomo/ui:/root/.config/mihomo/ui
      - /etc/localtime:/etc/localtime:ro
      - /lib/modules:/lib/modules:ro
    # 允许访问 /dev/net/tun 接口
    devices:
      - /dev/net/tun:/dev/net/tun
    cap_add:
      - NET_ADMIN # 允许容器操作网络配置（如 iptables）
    command: mihomo -d /etc/mihomo -m /etc/mihomo/config.yaml -ext-ctl 0.0.0.0:9090 -ext-ui /etc/mihomo/ui -redir :7892
```

## config.yaml

文件保存:`/root/docker/mihomo/config.yaml`

```yaml
# ----------------------------------------------------------------------
# Mihomo 核心配置 (参考您的模板，调整为透明网关模式)
# ----------------------------------------------------------------------
port: 7890             # HTTP 代理端口 (可选)
socks-port: 7891       # SOCKS5 代理端口 (可选)
redir-port: 7892       # 💡 透明代理 (Redir) 端口 - 用于 IPTables
tproxy-port: 7893      # TProxy 代理端口 (备用)

# 移除 mixed-port，因为我们使用了专用的 redir-port
# mixed-port: 7894

# authentication: ["user:password"] # 仅在公网暴露时推荐，局域网可以省略

ipv6: false
allow-lan: true        # 允许局域网设备连接
mode: rule             # 使用规则模式
log-level: info
unified-delay: false
tcp-concurrent: true

# 外部控制和 Web UI
external-controller: 0.0.0.0:9090 # 💡 监听 0.0.0.0 允许局域网访问
external-ui: ui
external-ui-url: "https://github.com/MetaCubeX/metacubexd/archive/refs/heads/gh-pages.zip" # 确保 URL 可用
secret: '122333'     # API 密码 (可以自行设置)

find-process-mode: strict
global-client-fingerprint: chrome

profile:
  store-selected: true
  store-fake-ip: true

# ----------------------------------------------------------------------
# 代理配置 (Proxies) - 整合您的 XRAY 节点
# ----------------------------------------------------------------------
proxies:
  - name: "直连"
    type: direct
    udp: true
  # 您的 VLESS Reality 节点配置
  - name: "XRAY"
    type: vless
    server: 服务端IP
    port: 服务端端口
    uuid: 服务端的ID
    network: tcp
    tls: true
    flow: ■■■■■■■■■■■
    servername: ■■■■■■■■■■■
    reality-opts:
      public-key: ■■■■■■■■■■■
      short-id: ■■■■■■■■■■■
#      spider-x: ■■■■■■■■■■■
#      fingerprint: chrome
# ----------------------------------------------------------------------
# 代理组 (Proxy Groups)
# ----------------------------------------------------------------------
proxy-groups:
  # 默认自动选择组 - 仅包含 Vless 节点和直连
  - name: 默认
    type: select
    proxies: [自动选择, 直连]

  - name: 自动选择
    type: url-test
    url: "https://www.gstatic.com/generate_204" # 测试地址
    include-all: true
    exclude-type: direct
    interval: 300
#    proxies: [XRAY, 直连] # 💡 仅包含您的 Reality 节点和直连

  - name: 全球代理 # 所有需要代理的流量都指向这个组
    type: select
    proxies: [自动选择, XRAY, 直连]

  - name: 国内
    type: select
    proxies: [直连, 自动选择]

  - name: 🚫 阻止
    type: select
    proxies: [REJECT]

  # 将所有服务特定的组都指向 "全球代理" 或 "自动选择"
  - name: Google
    type: select
    proxies: [全球代理, 直连]
  - name: Telegram
    type: select
    proxies: [全球代理, 直连]
  - name: Twitter
    type: select
    proxies: [全球代理, 直连]
  - name: 哔哩哔哩
    type: select
    proxies: [国内, 全球代理, 直连] # B站国内流量多
  - name: YouTube
    type: select
    proxies: [全球代理, 直连]
  - name: Spotify
    type: select
    proxies: [全球代理, 直连]
  - name: NETFLIX
    type: select
    proxies: [全球代理, 直连]
  - name: Github
    type: select
    proxies: [全球代理, 直连]
  - name: 其他
    type: select
    proxies: [全球代理, 直连]

# ----------------------------------------------------------------------
# 流量嗅探 (Sniffer)
# ----------------------------------------------------------------------
sniffer:
  enable: false
#  sniff:
#    HTTP:
#      ports: [80, 8080-8880]
#      override-destination: true
#    TLS:
#      ports: [443, 8443]
#    QUIC:
#      ports: [443, 8443]
#  skip-domain:
#    - "Mijia Cloud"
#    - "+.push.apple.com"

# ----------------------------------------------------------------------
# 透明网关/TUN 配置
# ----------------------------------------------------------------------
tun:
  enable: false  # 💡 在 Docker 透明网关场景下，不使用内置 TUN，而是使用 Redir + IPTables
  # 如果要启用，请确保容器拥有足够的权限，并理解其与 Redir 的区别。
  # stack: mixed
  # dns-hijack:
  #   - "any:53"
  # auto-route: true
  # auto-redirect: true
  # auto-detect-interface: true

# ----------------------------------------------------------------------
# DNS 配置
# ----------------------------------------------------------------------
dns:
  enable: true
  ipv6: false
#  enhanced-mode: fake-ip
#  fake-ip-filter:
#    - "*"
#    - "+.lan"
#    - "+.local"
#    - "+.market.xiaomi.com"
  default-nameserver:
    - tls://223.5.5.5
    - tls://223.6.6.6
  nameserver:
    - https://doh.pub/dns-query
    - https://dns.alidns.com/dns-query
  # 添加一个外部 DNS 服务器，用于解析国际域名
  fallback:
    - tls://1.0.0.1
    - tls://8.8.4.4
  fallback-filter:
    geoip: true
    geoip-code: CN # 针对 CN 地区
    domain: ["+.google.com", "+.facebook.com"] # 包含这些域名的查询使用 fallback

# ----------------------------------------------------------------------
# 路由规则 (Rules)
# ----------------------------------------------------------------------
rules:
  # -------------------- 优先级最高的黑白名单 (按需添加) --------------------
  # 黑名单示例：强制阻止某些域名或IP
  - DOMAIN-SUFFIX,example.com,🚫 阻止
  - IP-CIDR,1.1.1.1/32,🚫 阻止

  # 白名单示例：强制走代理的域名
  - DOMAIN-SUFFIX,always-proxy.com,全球代理

  # -------------------- 规则提供者 (Rule Providers) --------------------
  - RULE-SET,private_ip,直连,no-resolve # 私有 IP 直连
  - RULE-SET,github_domain,Github
  - RULE-SET,twitter_domain,Twitter
  - RULE-SET,youtube_domain,YouTube
  - RULE-SET,google_domain,Google
  - RULE-SET,telegram_domain,Telegram
  - RULE-SET,netflix_domain,NETFLIX
  - RULE-SET,bilibili_domain,哔哩哔哩
  - RULE-SET,spotify_domain,Spotify

  # -------------------- 国内外分流核心 --------------------
  - RULE-SET,cn_domain,国内      # 国内域名走国内组 (直连优先)
  - RULE-SET,geolocation-!cn,全球代理 # 非中国大陆域名/国家代码走代理

  - RULE-SET,cn_ip,国内          # 国内 IP 走国内组 (直连优先)

  # -------------------- 最终匹配规则 --------------------
  - MATCH,全球代理              # 剩余所有流量走全局代理组 (实现国内外流量分离)

# ----------------------------------------------------------------------
# 规则提供者 (Rule Providers) - 采用您提供的 MetaCubeX/meta-rules-dat 仓库
# ----------------------------------------------------------------------
rule-anchor:
  ip: &ip {type: http, interval: 86400, behavior: ipcidr, format: mrs, health-check-proxy: DIRECT} # 💡 添加 DIRECT 确保启动下载
  domain: &domain {type: http, interval: 86400, behavior: domain, format: mrs, health-check-proxy: DIRECT} # 💡 添加 DIRECT 确保启动下载

rule-providers:
  private_ip:
    <<: *ip
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/private.mrs"
  cn_ip:
    <<: *ip
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/cn.mrs"
  google_ip:
    <<: *ip
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/google.mrs"
  netflix_ip:
    <<: *ip
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/netflix.mrs"
  twitter_ip:
    <<: *ip
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/twitter.mrs"
  telegram_ip:
    <<: *ip
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/telegram.mrs"

  private_domain:
    <<: *domain
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/private.mrs"
  cn_domain:
    <<: *domain
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/cn.mrs"
  github_domain:
    <<: *domain
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/github.mrs"
  twitter_domain:
    <<: *domain
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/twitter.mrs"
  youtube_domain:
    <<: *domain
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/youtube.mrs"
  google_domain:
    <<: *domain
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/google.mrs"
  telegram_domain:
    <<: *domain
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/telegram.mrs"
  netflix_domain:
    <<: *domain
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/netflix.mrs"
  bilibili_domain:
    <<: *domain
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/bilibili.mrs"
  spotify_domain:
    <<: *domain
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/spotify.mrs"
  geolocation-!cn:
    <<: *domain
    url: "https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/geolocation-!cn.mrs
```

## 宿主机流量劫持脚本

文件保存:`/root/redirect.sh`

```shel
#!/bin/bash

# ======================================================================
# Host 模式下 Mihomo 透明代理 IPTables 脚本 (TCP/UDP 全协议支持)
# 作者：Gemini AI
# 最后更新：2025-11-15
# ======================================================================

# ----------------------------------------------------------------------
# 核心配置变量 (请根据您的环境修改)
# ----------------------------------------------------------------------
HOST_IP="192.168.50.254"            # PVE 宿主机 IP
MIHOMO_REDIR_PORT="7892"          # Mihomo TCP/UDP 透明代理端口 (用于 REDIRECT)
MIHOMO_TPROXY_PORT="7893"         # Mihomo TPROXY 端口 (用于 UDP/未来 TCP 优化)
XRAY_SERVER_IP="■■■■■■■■"    # Vless/Xray 上游服务器 IP
LOCAL_LAN="192.168.50.0/24"         # 您的局域网 CIDR
PVE_OUT_INTERFACE="vmbr0"           # PVE 宿主机用于连接局域网/互联网的接口 (如 eth0 或 vmbr0)

# ----------------------------------------------------------------------
# 1. 清除旧规则和自定义链
# ----------------------------------------------------------------------
echo "--- 1. 清除旧规则和自定义链 ---"
# 清除 nat 表中的自定义链
iptables -t nat -F MIHOMO_PROXY 2>/dev/null
iptables -t nat -X MIHOMO_PROXY 2>/dev/null
# 清除 mangle 表中的自定义链
iptables -t mangle -F MIHOMO_TPROXY 2>/dev/null
iptables -t mangle -X MIHOMO_TPROXY 2>/dev/null

# 从 PREROUTING 链中移除引用
iptables -t nat -D PREROUTING -j MIHOMO_PROXY 2>/dev/null
iptables -t mangle -D PREROUTING -j MIHOMO_TPROXY 2>/dev/null

# ----------------------------------------------------------------------
# 2. 启用系统内核转发
# ----------------------------------------------------------------------
echo "--- 2. 启用系统内核转发 ---"
echo 1 > /proc/sys/net/ipv4/ip_forward
sysctl -p

# ----------------------------------------------------------------------
# 3. 配置 Mihomo 代理转发链 (NAT 表用于 TCP 重定向)
# ----------------------------------------------------------------------
echo "--- 3. 配置 MIHOMO_PROXY (NAT 表) ---"
iptables -t nat -N MIHOMO_PROXY

# 排除 Vless 服务器 IP (避免自代理/回环 - 解决 i/o timeout)
echo "排除 Xray 服务端 IP ($XRAY_SERVER_IP)..."
iptables -t nat -A MIHOMO_PROXY -d "$XRAY_SERVER_IP" -j RETURN

# 排除本地和私有网络流量 (避免内网通信被代理)
echo "排除私有网络地址..."
iptables -t nat -A MIHOMO_PROXY -d 10.0.0.0/8 -j RETURN
iptables -t nat -A MIHOMO_PROXY -d 172.16.0.0/12 -j RETURN
iptables -t nat -A MIHOMO_PROXY -d 192.168.0.0/16 -j RETURN
iptables -t nat -A MIHOMO_PROXY -d 127.0.0.0/8 -j RETURN

# 排除 SSH 端口 (22)
echo "排除 SSH 端口 (22)..."
iptables -t nat -A MIHOMO_PROXY -p tcp --dport 22 -j RETURN

# TCP 流量重定向到 Mihomo REDIR 端口 (7892)
echo "重定向剩余 TCP 流量到本机 $MIHOMO_REDIR_PORT..."
iptables -t nat -A MIHOMO_PROXY -p tcp -j REDIRECT --to-ports "$MIHOMO_REDIR_PORT"

# ----------------------------------------------------------------------
# 4. 配置 TPROXY 代理转发链 (MANGLE 表用于 UDP)
# ----------------------------------------------------------------------
echo "--- 4. 配置 MIHOMO_TPROXY (MANGLE 表) ---"
iptables -t mangle -N MIHOMO_TPROXY

# 排除 Vless 服务器 IP (避免自代理/回环)
iptables -t mangle -A MIHOMO_TPROXY -d "$XRAY_SERVER_IP" -j RETURN

# 排除本地和私有网络流量
iptables -t mangle -A MIHOMO_TPROXY -d 10.0.0.0/8 -j RETURN
iptables -t mangle -A MIHOMO_TPROXY -d 172.16.0.0/12 -j RETURN
iptables -t mangle -A MIHOMO_TPROXY -d 192.168.0.0/16 -j RETURN
iptables -t mangle -A MIHOMO_TPROXY -d 127.0.0.0/8 -j RETURN

# TPROXY 处理 UDP 流量 (使用 mark 标记)
echo "重定向剩余 UDP 流量到本机 $MIHOMO_TPROXY_PORT..."
# TPROXY 将数据包重定向到 Mihomo 的 TPROXY 端口 (7893) 并标记
iptables -t mangle -A MIHOMO_TPROXY -p udp -j TPROXY --on-ip 0.0.0.0 --on-port "$MIHOMO_TPROXY_PORT" --tproxy-mark 1

# ----------------------------------------------------------------------
# 5. 拦截和重定向客户端流量 (PREROUTING)
# ----------------------------------------------------------------------
echo "--- 5. 拦截客户端流量 (PREROUTING) ---"
# 仅拦截源 IP 在局域网内且目标 IP 不在局域网内的流量

# TCP 流量通过 nat 表的 MIHOMO_PROXY 链进行处理
iptables -t nat -A PREROUTING -p tcp -s "$LOCAL_LAN" ! -d "$LOCAL_LAN" -j MIHOMO_PROXY

# UDP 流量通过 mangle 表的 MIHOMO_TPROXY 链进行处理
iptables -t mangle -A PREROUTING -p udp -s "$LOCAL_LAN" ! -d "$LOCAL_LAN" -j MIHOMO_TPROXY

# ----------------------------------------------------------------------
# 6. 配置 IP 转发伪装 (SNAT/MASQUERADE) - 解决国内直连 I/O Timeout
# ----------------------------------------------------------------------
echo "--- 6. 配置 IP 转发伪装 (MASQUERADE) ---"
# 清除旧的转发规则，以防冲突
iptables -t nat -D POSTROUTING -s "$LOCAL_LAN" -o "$PVE_OUT_INTERFACE" -j MASQUERADE 2>/dev/null

# 添加新的 MASQUERADE 规则，确保所有转发出去的流量源IP被伪装成PVE宿主机IP
# 解决客户端直连请求无法返回的问题
echo "添加 POSTROUTING MASQUERADE 规则到 $PVE_OUT_INTERFACE..."
iptables -t nat -A POSTROUTING -s "$LOCAL_LAN" -o "$PVE_OUT_INTERFACE" -j MASQUERADE

# ----------------------------------------------------------------------
# 7. 必要的路由设置 (TPROXY 需要)
# ----------------------------------------------------------------------
# 设置 IP 路由规则，使标记为 1 的数据包进入 TPROXY 流程
ip rule add fwmark 1 table 100 2>/dev/null
ip route add local 0.0.0.0/0 dev lo table 100 2>/dev/null

echo "✅ Mihomo Host 模式透明代理配置完成！"
exit 
```


## 流量劫持脚本自启动

文件保存：`/etc/systemd/system/mihomo-iptables.service`

```shell
[Unit]
Description=Mihomo Transparent Proxy IPTables Rules
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
ExecStart=/root/redirect.sh
RemainAfterExit=yes
StandardOutput=journal

[Install]
WantedBy=multi-user.target
```


## 启动！

切换到`/root`路径，执行如下命令

```shell
# 重载 Systemd 配置
systemctl daemon-reload

# 启用服务，设置开机自启动
systemctl enable mihomo-iptables.service

# 立即启动服务
systemctl start mihomo-iptables.service

# 检查服务状态
systemctl status mihomo-iptables.service

```

状态正常后再切换到`/root/docker`,启动容器

```shell
docker compose up -d

# 查看日志
docker compose logs mihomo -f
```

随后打开路由器，修改局域网设置，将DHCP服务中的默认网关改为宿主机的IP，比如我这里就是192.168.50.254，随后保存，重启路由器，验证设备上网是否正常。

可以打开http://192.168.50.254:9090，查看ui界面中的流量以及配置信息。


# 后续

如果有问题，查询日志，带着日期找个AI问一下。
