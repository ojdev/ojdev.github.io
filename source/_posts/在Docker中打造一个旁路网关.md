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
- 透明代理
title: 在Docker中打造一个旁路网关
updated: '2025-11-18T10:27:47.678+08:00'
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
    volumes:
      - ./mihomo/config.yaml:/root/.config/mihomo/config.yaml # 映射配置文件
      - ./mihomo/ui:/root/.config/mihomo/ui
      - /etc/localtime:/etc/localtime:ro
    # 允许访问 /dev/net/tun 接口
    devices:
      - /dev/net/tun:/dev/net/tun
    cap_add:
      - NET_ADMIN # 允许容器操作网络配置（如 iptables）
      - NET_BROADCAST
      - SYS_MODULE
```

## config.yaml

文件保存:`/root/docker/mihomo/config.yaml`

```yaml
# --------------------------------------------------------
# 核心代理节点定义
# --------------------------------------------------------
proxies:
  - name: "直连"
    type: direct
    udp: true
  - name: "代理节点"
    type: vless
    server: ███.███.███.███
    port: ███
    uuid: ████████-████-████-████-████████
    network: tcp
    tls: true
    udp: true
    flow: xtls-rprx-vision
    servername: www.█████████.com # REALITY servername
    reality-opts:
      public-key: ██████████████████████
      short-id: "██" # optional
      support-x25519mlkem768: false # 如果服务端支持可手动设置为true
    client-fingerprint: chrome # cannot be empty

mode: rule
# ipv6 支持
ipv6: true
log-level: warning
#log-level: debug
# 允许局域网连接
allow-lan: true
# socks5/http 端口
#mixed-port: 7890
#socks-port: 7891       # SOCKS5 代理端口 (可选)
redir-port: 7892       # 💡 透明代理 (Redir) 端口 - 用于 IPTables
tproxy-port: 7893      # TProxy 代理端口 (备用)
tproxy: true
# Meta 内核特性 https://wiki.metacubex.one/config/general
# 统一延迟
# 更换延迟计算方式,去除握手等额外延迟
unified-delay: true
# TCP 并发
# 同时对所有ip进行连接，返回延迟最低的地址
tcp-concurrent: true
# 外部控制端口
external-controller: 0.0.0.0:9090
external-ui: ui
external-ui-url: "https://github.com/MetaCubeX/metacubexd/archive/refs/heads/gh-pages.zip" # 确保 URL 可用
secret: '122333'     # API 密码 (可以自行设置)

geodata-mode: true
geodata-loader: memconservative
# Geo 数据库下载地址
# 源地址 https://github.com/MetaCubeX/meta-rules-dat
# 可以更换镜像站但不要更换其他数据库，可能导致无法启动
geox-url:
  geoip: "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geoip.dat"
  geosite: "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geosite.dat"
#  geoip: "https://cdn.jsdelivr.net/gh/Loyalsoldier/v2ray-rules-dat@release/geoip.dat"
#  geosite: "https://cdn.jsdelivr.net/gh/Loyalsoldier/v2ray-rules-dat@release/geosite.dat"
  mmdb: "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/country.mmdb"
  asn: "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/GeoLite2-ASN.mmdb"

geo-auto-update: true # 是否自动更新 geodata
geo-update-interval: 24 # 更新间隔，单位：小时

# 进程匹配模式
# 路由器上请设置为 off
# always 开启，强制匹配所有进程
# strict 默认，由 Clash 判断是否开启
# off 不匹配进程，推荐在路由器上使用此模式
find-process-mode: off

# 全局客户端指纹
global-client-fingerprint: random # 随机指纹

# 缓存
profile:
  store-selected: true
  store-fake-ip: true

# 自动同步时间以防止时间不准导致无法正常联网
ntp:
  enable: true
  # 是否同步至系统时间，需要 root/管理员权限
  write-to-system: false
  server: time.apple.com
  port: 123
  interval: 30

# 域名嗅探
sniffer:
  enable: true
  sniff:
    TLS:
      ports: [443, 8443]
    HTTP:
      ports: [80, 8080-8880]
      override-destination: true
  skip-domain:
    - "+.baidu.com"
    - "+.bilibili.com"
    - "+.hanime1.me"
# tun 模式
tun:
  enable: false  # enable 'true'
  stack: system  # or 'gvisor'
  dns-hijack:
    - "any:53"
    - "tcp://any:53"
  auto-route: true
  auto-detect-interface: true

# dns 设置
# 已配置 ipv6
dns:
  enable: true
  listen: 0.0.0.0:1053
  ipv6: true
  # 路由器个人建议使用 redir-host 以最佳兼容性
  # 其他设备可以使用 fake-ip
  enhanced-mode: redir-host
  prefer-h3: true
  respect-rules: true
  cache-algorithm: arc
  cache-size: 4096
#  enhanced-mode: fake-ip
  fake-ip-range: 28.0.0.1/8
  fake-ip-filter-mode: blacklist
  fake-ip-filter:
    - '*'
    - '+.lan'
    - '+.local'
    - "+.market.xiaomi.com"
  default-nameserver:
    - 192.168.50.1
    - tls://223.5.5.5
    - tls://223.6.6.6
  nameserver:
    - 192.168.50.1
    - https://doh.pub/dns-query
    - https://dns.alidns.com/dns-query
    - 'tls://8.8.4.4#dns'
    - 'tls://1.0.0.1#dns'
  proxy-server-nameserver:
    - https://doh.pub/dns-query
    - https://dns.google/dns-query
  nameserver-policy:
    "geosite:gfw":
      - "tls://dns.google"
      - "tls://cloudflare-dns.com"
    "geosite:cn,private":
#      - https://doh.pub/dns-query
#      - https://dns.alidns.com/dns-query
      - https://223.5.5.5/dns-query
    "geosite:!cn,!private":
      - "tls://dns.google"
      - "tls://cloudflare-dns.com"
  fallback:
    - tls://8.8.4.4
    - tls://1.1.1.1
  fallback-filter:
    geoip: true
    geoip-code: CN
    geosite:
      - gfw
    ipcidr:
      - 240.0.0.0/4
    domain:
      - '+.google.com'
      - '+.facebook.com'
      - '+.youtube.com'

# 规则订阅
rule-providers:
  # 秋风广告拦截规则
  # https://awavenue.top
  # 由于 Anti-AD 误杀率高，本项目已在 1.11-241024 版本更换秋风广告规则
  AWAvenue-Ads:
    type: http
    behavior: domain
    format: yaml
    # path可为空(仅限clash.meta 1.15.0以上版本)
    path: ./rule_provider/AWAvenue-Ads.yaml
    url: "https://raw.githubusercontent.com/TG-Twilight/AWAvenue-Ads-Rule/refs/heads/main/Filters/AWAvenue-Ads-Rule-Clash-Classical.yaml"
    interval: 600

# --------------------------------------------------------
# 策略组定义
# --------------------------------------------------------
proxy-groups:
  # 默认组现在只允许在代理和直连之间选择
  - {name: 默认, type: select, proxies: [自动选择, 代理节点, 直连], icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/mini/Proxy.png"}

  # 所有服务策略组现在都使用简化的 &pr 模板
  - {name: Google, type: select, proxies: [自动选择, 代理节点, 直连], icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/mini/Google_Search.png"}
  - {name: Github, type: select, proxies: [自动选择, 代理节点, 直连]}
  - {name: Apple, type: select, proxies: [自动选择, 代理节点, 直连], icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/mini/Apple.png"}
  - {name: Telegram, type: select, proxies: [自动选择, 代理节点, 直连], icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/mini/Telegram.png"}
  - {name: Twitter, type: select, proxies: [自动选择, 代理节点, 直连], icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/mini/Twitter.png"}
  - {name: TikTok, type: select, proxies: [自动选择, 代理节点, 直连], icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/mini/TikTok.png"}
  - {name: Pixiv, type: select, proxies: [自动选择, 代理节点, 直连]}
  - {name: Steam, type: select, proxies: [自动选择, 代理节点, 直连]}
  - {name: OneDrive, type: select, proxies: [自动选择, 代理节点, 直连], icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/mini/OneDrive.png"}
  - {name: 微软服务, type: select, proxies: [自动选择, 直连, 代理节点], icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/mini/Microsoft.png"}
  - {name: ehentai, type: select, proxies: [自动选择, 代理节点, 直连], icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/mini/Panda.png"}
  - {name: 哔哩哔哩, type: select, proxies: [自动选择, 代理节点, 直连], icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/mini/bilibili.png"}
  - {name: 哔哩东南亚, type: select, proxies: [自动选择, 代理节点, 直连], icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/mini/bilibili.png"}
  - {name: 巴哈姆特, type: select, proxies: [自动选择, 代理节点, 直连], icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/mini/Bahamut.png"}
  - {name: YouTube, type: select, proxies: [自动选择, 代理节点, 直连], icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/mini/YouTube.png"}
  - {name: NETFLIX, type: select, proxies: [自动选择, 代理节点, 直连], icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/mini/Netflix.png"}
  - {name: Spotify, type: select, proxies: [自动选择, 代理节点, 直连], icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/mini/Spotify.png"}

  - {name: 国内, type: select, proxies: [直连], icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/mini/China_Map.png"}
  - {name: 其他, type: select, proxies: [自动选择, 代理节点, 直连], icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/mini/Final.png"}

  - {name: 广告拦截, type: select, proxies: [REJECT, DIRECT, 自动选择] }

  - {name: 自动选择, type: url-test, include-all: true, exclude-type: direct, url: "https://www.gstatic.com/generate_204", interval: 800, tolerance: 10}

rules:
  # 若需禁用 QUIC 请取消注释 QUIC 两条规则
  # 防止 YouTube 等使用 QUIC 导致速度不佳, 禁用 443 端口 UDP 流量（不包括国内）
  - AND,(AND,(DST-PORT,443),(NETWORK,UDP)),(NOT,((GEOSITE,cn))),REJECT
  - AND,(AND,(DST-PORT,443),(NETWORK,UDP)),(NOT,((GEOIP,CN))),REJECT

  - RULE-SET,AWAvenue-Ads,广告拦截

  - DOMAIN-SUFFIX,immersivetranslate.com,DIRECT
  # 自定义
  # - GEOSITE,bilibili,哔哩哔哩
  # - GEOSITE,category-scholar-!cn,境外AI
  - GEOSITE,gfw,其他
  - GEOSITE,apple,Apple
  - GEOSITE,apple-cn,Apple
  - GEOSITE,ehentai,ehentai
  - GEOSITE,github,Github
  - GEOSITE,twitter,Twitter
  - GEOSITE,youtube,YouTube
  - GEOSITE,google,Google
  - GEOSITE,google-cn,Google # Google CN 不走代理会导致香港等地区节点 Play Store 异常
  - GEOSITE,telegram,Telegram
  - GEOSITE,netflix,NETFLIX
  - GEOSITE,tiktok,TikTok
  - GEOSITE,bahamut,巴哈姆特
  - GEOSITE,spotify,Spotify
  - GEOSITE,pixiv,Pixiv
  - GEOSITE,steam@cn,国内
  - GEOSITE,steam,Steam
  - GEOSITE,onedrive,OneDrive
  - GEOSITE,microsoft@cn,国内
  - GEOSITE,microsoft,微软服务
  - GEOSITE,geolocation-!cn,其他
  - GEOIP,google,Google
  - GEOIP,netflix,NETFLIX
  - GEOIP,telegram,Telegram
  - GEOIP,twitter,Twitter

  - GEOSITE,CN,DIRECT
  - GEOIP,CN,DIRECT,no-resolve

  # 绕过局域网地址
  - IP-CIDR,10.0.0.0/8,DIRECT
  - IP-CIDR,172.16.0.0/12,DIRECT
  - IP-CIDR,192.168.0.0/16,DIRECT
  - IP-CIDR,100.64.0.0/10,DIRECT
  - IP-CIDR,127.0.0.0/8,DIRECT

  - MATCH,其他
```

## 宿主机流量劫持脚本

文件保存:`/root/`redirect



`.sh`

```shel
#!/bin/bash

# ======================================================================
# Host 模式下 Mihomo 透明代理 IPTables 脚本 (优化版 - TCP/UDP 全协议支持)
# 作者：Gemini AI / 基于用户脚本优化
# 最后更新：2025-11-15
# ======================================================================

# ----------------------------------------------------------------------
# 核心配置变量 (请根据您的环境修改)
# ----------------------------------------------------------------------
HOST_IP="192.168.50.254"            # PVE 宿主机 IP
MIHOMO_REDIR_PORT="7892"            # Mihomo TCP/UDP 透明代理端口 (用于 REDIRECT)
MIHOMO_TPROXY_PORT="7893"           # Mihomo TPROXY 端口 (用于 UDP/未来 TCP 优化)
MIHOMO_API_PORT="9090"              # 💡 增加：Mihomo 外部控制/Web UI 端口
MIHOMO_DNS_PORT="1053"              # 💡 增加：Mihomo DNS 监听端口 (来自您的配置文件)
XRAY_SERVER_IP="███.███.███.███"      # Vless/Xray 上游服务器 IP
LOCAL_LAN="192.168.50.0/24"         # 您的局域网 CIDR
PVE_OUT_INTERFACE="vmbr0"           # PVE 宿主机用于连接局域网/互联网的接口

# ----------------------------------------------------------------------
# 排除列表 (私有 IP 范围)
# ----------------------------------------------------------------------
EXCLUDE_IPS="\
10.0.0.0/8 \
172.16.0.0/12 \
192.168.0.0/16 \
127.0.0.0/8 \
"

# ----------------------------------------------------------------------
# 1. 清除旧规则和自定义链 (提高幂等性)
# ----------------------------------------------------------------------
echo "--- 1. 清除旧规则和自定义链 ---"

# 💡 清除 TPROXY 路由规则
ip rule del fwmark 1 table 100 2>/dev/null
ip route del local 0.0.0.0/0 dev lo table 100 2>/dev/null

# 从 PREROUTING 链中移除引用
iptables -t nat -D PREROUTING -p tcp -s "$LOCAL_LAN" -d "$HOST_IP" -j RETURN 2>/dev/null
iptables -t nat -D PREROUTING -p tcp -s "$LOCAL_LAN" ! -d "$LOCAL_LAN" -j MIHOMO_PROXY 2>/dev/null
iptables -t mangle -D PREROUTING -p udp -s "$LOCAL_LAN" -d "$HOST_IP" -j RETURN 2>/dev/null
iptables -t mangle -D PREROUTING -p udp -s "$LOCAL_LAN" ! -d "$LOCAL_LAN" -j MIHOMO_TPROXY 2>/dev/null

# 清除自定义链
iptables -t nat -F MIHOMO_PROXY 2>/dev/null
iptables -t nat -X MIHOMO_PROXY 2>/dev/null
iptables -t mangle -F MIHOMO_TPROXY 2>/dev/null
iptables -t mangle -X MIHOMO_TPROXY 2>/dev/null

# 清除 POSTROUTING MASQUERADE 规则 (防止重复)
iptables -t nat -D POSTROUTING -s "$LOCAL_LAN" -o "$PVE_OUT_INTERFACE" -j MASQUERADE 2>/dev/null

# ----------------------------------------------------------------------
# 2. 启用系统内核转发
# ----------------------------------------------------------------------
echo "--- 2. 启用系统内核转发 ---"
echo 1 > /proc/sys/net/ipv4/ip_forward
sysctl -p > /dev/null

# ----------------------------------------------------------------------
# 3. 配置 Mihomo 代理转发链 (NAT 表用于 TCP REDIRECT)
# ----------------------------------------------------------------------
echo "--- 3. 配置 MIHOMO_PROXY (NAT 表) ---"
iptables -t nat -N MIHOMO_PROXY

# 排除 Vless 服务器 IP (避免自代理/回环)
iptables -t nat -A MIHOMO_PROXY -d "$XRAY_SERVER_IP" -j RETURN

# 排除本地和私有网络流量 (宿主机自用/内网通信)
echo "排除私有网络地址..."
for ip_cidr in $EXCLUDE_IPS; do
    iptables -t nat -A MIHOMO_PROXY -d "$ip_cidr" -j RETURN
done

# 排除 Mihomo 自身的端口 (防止回环)
echo "排除 Mihomo 自身端口 ($MIHOMO_REDIR_PORT, $MIHOMO_API_PORT)..."
iptables -t nat -A MIHOMO_PROXY -p tcp --dport "$MIHOMO_REDIR_PORT" -j RETURN
iptables -t nat -A MIHOMO_PROXY -p tcp --dport "$MIHOMO_API_PORT" -j RETURN

# 排除 SSH 端口 (22)
iptables -t nat -A MIHOMO_PROXY -p tcp --dport 22 -j RETURN

# TCP 流量重定向到 Mihomo REDIR 端口
echo "重定向剩余 TCP 流量到本机 $MIHOMO_REDIR_PORT..."
iptables -t nat -A MIHOMO_PROXY -p tcp -j REDIRECT --to-ports "$MIHOMO_REDIR_PORT"

# ----------------------------------------------------------------------
# 4. 配置 TPROXY 代理转发链 (MANGLE 表用于 UDP)
# ----------------------------------------------------------------------
echo "--- 4. 配置 MIHOMO_TPROXY (MANGLE 表) ---"
iptables -t mangle -N MIHOMO_TPROXY

# 排除 Vless 服务器 IP
iptables -t mangle -A MIHOMO_TPROXY -d "$XRAY_SERVER_IP" -j RETURN

# 排除本地和私有网络流量
for ip_cidr in $EXCLUDE_IPS; do
    iptables -t mangle -A MIHOMO_TPROXY -d "$ip_cidr" -j RETURN
done

# 排除 Mihomo 自身的端口 (防止回环)
echo "排除 Mihomo 自身端口 ($MIHOMO_TPROXY_PORT, $MIHOMO_API_PORT)..."
iptables -t mangle -A MIHOMO_TPROXY -p udp --dport "$MIHOMO_TPROXY_PORT" -j RETURN
iptables -t mangle -A MIHOMO_TPROXY -p tcp --dport "$MIHOMO_API_PORT" -j RETURN

# TPROXY 处理 UDP 流量 (使用 mark 标记 1)
echo "重定向剩余 UDP 流量到本机 $MIHOMO_TPROXY_PORT..."
iptables -t mangle -A MIHOMO_TPROXY -p udp -j TPROXY --on-ip 0.0.0.0 --on-port "$MIHOMO_TPROXY_PORT" --tproxy-mark 1

# ----------------------------------------------------------------------
# 5. 拦截和重定向客户端流量 (PREROUTING)
# ----------------------------------------------------------------------
echo "--- 5. 拦截客户端流量 (PREROUTING) ---"

# 💡 A. 强制接管 DNS (53 端口) 并重定向到 Mihomo DNS 端口 (1053)
# 仅拦截来自局域网的 DNS 查询
echo "强制接管局域网 DNS (53) -> $MIHOMO_DNS_PORT..."
iptables -t nat -A PREROUTING -p udp -s "$LOCAL_LAN" --dport 53 -j REDIRECT --to-ports "$MIHOMO_DNS_PORT"
iptables -t nat -A PREROUTING -p tcp -s "$LOCAL_LAN" --dport 53 -j REDIRECT --to-ports "$MIHOMO_DNS_PORT"

# 💡 排除目标为宿主机本身的流量 (如访问 Web UI 或 SSH)
iptables -t nat -A PREROUTING -p tcp -s "$LOCAL_LAN" -d "$HOST_IP" -j RETURN
iptables -t mangle -A PREROUTING -p udp -s "$LOCAL_LAN" -d "$HOST_IP" -j RETURN

# TCP 流量：拦截局域网内设备且目标不在局域网内的流量，转发至 MIHOMO_PROXY
iptables -t nat -A PREROUTING -p tcp -s "$LOCAL_LAN" ! -d "$LOCAL_LAN" -j MIHOMO_PROXY

# UDP 流量：拦截局域网内设备且目标不在局域网内的流量，转发至 MIHOMO_TPROXY
iptables -t mangle -A PREROUTING -p udp -s "$LOCAL_LAN" ! -d "$LOCAL_LAN" -j MIHOMO_TPROXY

# ----------------------------------------------------------------------
# 6. 配置 IP 转发伪装 (MASQUERADE)
# ----------------------------------------------------------------------
echo "--- 6. 配置 IP 转发伪装 (MASQUERADE) ---"
# 确保所有转发出去的流量源IP被伪装成PVE宿主机IP，解决客户端直连请求无法返回的问题。
echo "添加 POSTROUTING MASQUERADE 规则到 $PVE_OUT_INTERFACE..."
iptables -t nat -A POSTROUTING -s "$LOCAL_LAN" -o "$PVE_OUT_INTERFACE" -j MASQUERADE

# ----------------------------------------------------------------------
# 7. 必要的路由设置 (TPROXY 需要)
# ----------------------------------------------------------------------
echo "--- 7. 配置 TPROXY 路由规则 ---"
# 设置 IP 路由规则，使标记为 1 的数据包进入 TPROXY 流程
ip rule add fwmark 1 table 100
ip route add local 0.0.0.0/0 dev lo table 100

echo "✅ Mihomo Host 模式透明代理配置完成！请确保 Mihomo 正在运行。"
exi
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

随后打开路由器，修改局域网设置，将DHCP服务中的默认网关与DNS改为宿主机的IP，比如我这里就是192.168.50.254，随后保存，重启路由器，验证设备上网是否正常。

可以打开`http://192.168.50.254:9090/ui`，查看ui界面中的流量以及配置信息。

# 后续

如果有问题，查询日志，带着日期找个AI问一下。
