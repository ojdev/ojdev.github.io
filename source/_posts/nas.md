---
title: 家庭服务管理：NAS
date: 2021-01-07 12:28:09
categories:
- 家庭服务
tags:
- NAS
- Jellyfin
- Proxmox VE
- PVE
- docker
- docker-compose
- homeassistan
- 小米
- 格力
- qBittorrent
- 松花江
---

# 1 一个NAS都应该能做什么

我是一个经历了家庭互联网从无到有的人，小的时候家里有个电视就算是富裕家庭了，一般的家庭还仅限于有个收音机；后来逐渐的，电视，彩色电视，电话，录像机，那个时候还有一种叫录像厅的地方呢，又租录像带的地方，5毛钱一周；然后出现了VCD，DVD，大哥大，BB机，掌中宝娱乐的东西越来越丰富。

之后我到外面上高中，那是2002年，那个时候已经有网吧了，但是电脑还不是普通家庭可以承受的。

等到我上了大学的时候，就到了2005年，彼时，小灵通还有一席之地，网吧遍地开花，上网一个电话，车接车送，包夜5元还送面包和可乐。但是学校里有笔记本的同学依然是少数，很多时候大家还是用U盘和MP3，MP4来互相拷贝东西，移动硬盘由于造价比较高，并不普及，而且，120G的都算是大容量存储了。

等毕业后，移动硬盘算是比较普及的，但是依然不大，320G和500G的都算大容量了，因为那个年代，资源的体积也是很小的。

逐渐的，很多东西变成了消费品，手机的普及，家庭宽带的普及，3G的出现和4G的升级，互联网才开始完全平民化，我个人来讲，3G的出现时一个转折点，4G的出现让很多想法得以实现。资源的质量也越来越高，以前的120p的资源，到后来的480，然后进化到720p，1080p;后来之间开始普及的2k，4k，蓝光等。存储空间也开始越来越便宜，从1T的hdd到现在消费级别的1T的ssd。

手机，电视，电脑，这是家庭的网络基础互联装备，以前一个硬盘到处插不觉得麻烦，现在建个网路共享我都觉得不方便，所以逐渐的，开始了NAS的路线。

NAS所需的功能，和是否需要NAS都是看个人和家庭的需求是否有必要，否则就是吃灰的产品。那么一个NAS，对我来讲需要以下的功能。

## 1.1 流媒体

彼时靠文件夹来分辨是什么电影，什么电视剧等等，资源混在一起，或者分成不同目录，甚至不同的硬盘装不同的东西，但是看的时候依然麻烦，而且目前网页观看也成为了大家容易接收的方式，以前电脑必装的千千静听，realplayer,xmplaoer,potplayer等等播放器，如今也变的鲜少有人问津。所以，流媒体服务就成为了一个比较基础的功能，应该能够做到，海报，简介，自动下载字幕，播放，分类这些基础的功能，下面是能够满足这几项条件的推荐。

- Jellyfin

免费，开源，.Net Core，有TV端，Android端，网页端，PC端，而且，都免费，但是有点小缺点，就是硬解，遇到不支持的格式的就会强制硬解，而且使用服务端硬解，而不会使用本地硬解。

- Emby

Jellyfin就是从这分家的，因为Emby有收费订阅，TV端就需要订阅，其他的几乎一样。据说硬解能力比Jellyfin强。

- Plex

这是个很强的产品，大部分都推荐的，但是，订阅后体检更好。TV，手机端都需要订阅后才能用，这个好像是本地硬解，不占用服务器资源，只用了一次，所以不是很确定。

- elfilm

[http://getelfilm.com/](http://getelfilm.com/)

## 1.2 下载

- qBittorrent

同时满足了BT下载和挂PT的需求，以前一直都是使用aria2的，但是aria2下载BT和PT需要单独的配置，不能一个端直接满足，所以，最后还是使用了这个。

- aria2

老牌下载工具

## 1.3 Home Assistant

基础的家庭物联网工具，我是比较早接触智能家居设备的，这也导致了我家的产品比较割裂，空气净化器是，空调是格力的，扫地机是小米的，电视是乐视的，可视猫眼是叮咚，门锁是美的，有了HomeAssistant后，可以将其中一部分整合到上面。

## 1.4 旁路网关

流畅的网络体验。

## 1.5 文件共享

Linux下比较流行的就是SMB，但是现在看来，好像并不是常用的了。

## 1.6 可扩展性
### 1.6.1 Docker

#### 1.6.1.1 Home Assistant

家庭物联网

#### 1.6.1.2 qBittorrent

既满足bt又能满足pt

#### 1.6.1.3 Jellyfin

多端免费的媒体管理，自动刮削，硬解。

#### 1.6.1.4 签到

免去了每天手动签到的麻烦过程，但是gthub actions可以替代。

#### 1.6.1.5 百度云

### 1.6.2 虚拟机
#### 1.6.2.1 windows

挂游戏，一般来说我来玩传奇的时候会挂机。

#### 1.6.2.2 linux

我用来ssh，远程管理k8s。其实nas本身就是Linux。

## 1.7 云

- Nextcloud

## 1.8 ZeroTier

- 异地访问
- VPN直连

## frpc

- 内网穿透

## 1.9 选用什么系统？
### 1.9.1 群晖
#### 1.9.1.1 黑群晖

内网穿透、稳定的应用（也不一定）、同步、备份。
虽然免费，但是升级什么的比较麻烦。

#### 1.9.1.2 白群晖

内网穿透、稳定的应用（也不一定）、同步、备份、稳定、可升级、贵。

我觉得性价比不高。

### 1.9.2 ProxmoxVE（推荐★★★★★）
其本质上是一个Debian系统，用起来熟悉。
#### 1.9.2.1 zfs存储
```bash
ls -l /dev/disk/by-id/
total 0
lrwxrwxrwx 1 root root  9 Dec 30 10:29 ata-SCWW_SSD_16G_0000000000000 -> ../../sda
lrwxrwxrwx 1 root root 10 Dec 30 10:29 ata-SCWW_SSD_16G_0000000000000-part1 -> ../../sda1
lrwxrwxrwx 1 root root 10 Dec 30 10:29 ata-SCWW_SSD_16G_0000000000000-part2 -> ../../sda2
lrwxrwxrwx 1 root root 10 Dec 30 10:29 ata-SCWW_SSD_16G_0000000000000-part3 -> ../../sda3
lrwxrwxrwx 1 root root  9 Dec 30 10:29 ata-ST99999999-******-****** -> ../../sdc
lrwxrwxrwx 1 root root  9 Dec 30 10:29 ata-TOSHIBA_******_****** -> ../../sdb

#raid-0
zpool create -f -o ashift=12 nas /dev/disk/by-id/ata-ST99999999-******-****** /dev/disk/by-id/ata-TOSHIBA_******_******

# 加新硬盘
zpool attach nas /dev/disk/by-id/ata-ST88888888-******-******
```
上面完成后会在根目录下生成一个nas文件夹，就是存储池的空间了。

软raid
创建存储池
做为目录
#### 1.9.2.2 软路由
``` bash
qm importdisk 100 /nas/20201229-Ipv4P-Mini-x86-64-generic-squashfs-combined-efi.img nas-local
```
#### 1.9.2.3 lxc
做软路由
虚拟机

### 1.9.3 FreeNAS（推荐★★★）

免费

### 1.9.4 OMV（OpenMediaVault）

免费、功能过于基础。

### 1.9.5 Windows Server（推荐★★★★）

免费，这点可能很多人不知道，Windows Server Core是有免费版本的。只是没有桌面环境，但是已经Windows Server了，桌面环境除了浪费空间和资源外，真的就没什么用了。

HyperV可以直接使用[Windows Admin Center](https://www.microsoft.com/zh-cn/windows-server/windows-admin-center)可以直接进行管理，也可以使用Windows10 的hyper-V远程管理。

硬件直通对硬件本身要求较高，但是一般也够用了。

用起来操作很熟悉。

### 1.9.6 Ubuntu Server
### 1.9.7 UNRAID
据说硬件直通性能非常好，但是收费，虽然有破解版。
### 1.9.8 ESXI
老牌。
## 1.10 硬件上最好有什么？
### 1.10.1 网卡
- 千兆
- 万兆
### 1.10.2 Raid卡
- 多硬盘，也可以用软raid
### 1.10.3 热插拔
- 多盘位
### 1.10.4 USB3
- 打印机
### 1.10.5 DC电源
- 静音
### 1.10.6 1+N块硬盘
- 组RAID

# 2 NAS服务管理
## 2.1 Jellyfin

### 2.1.1 电影多版本管理

以`Wonder Woman 1984`这部电影为例，我的电影都是放在`/nas/movies`里的,所以目录结构是这样的:
``` bash
movies/
└── Wonder.Woman.1984.2020
    ├── Wonder.Woman.1984.2020 - 1080P.mkv
    ├── Wonder.Woman.1984.2020 - 1080P.china.srt
    └── Wonder.Woman.1984.2020 - 2160p.mp4
    └── Wonder.Woman.1984.2020 - 8k.mp4
    └── Wonder.Woman.1984.2020 - 不是导演剪辑版.mp4
    └── Wonder.Woman.1984.2020 - 山寨版.mp4
```
根据`jellyfin`文档显示，当多个不同格式的版本合并起来的时候，需要让文件名与文件夹名保持一直然后再后面加`{空格}{连字符}{空格}{版本标签}`的形式，这样jellyfin就可以进行识别，在电影的界面中就可以进行版本的切换选择，在这一点上不如plex方便了。 其中标签是可以自定义的，连字符不支持`.`和空格。

** 官方的文档中推荐的文件夹名是`Wonder.Woman.1984 (2020)` ，但是实际使用中我发现`Wonder.Woman.1984.2020`也是可以的，在文件管理上，名字中带有空格对我来讲会不大习惯，所以可以根据自己习惯选择对名称的管理。

#### 参考链接

+ [https://jellyfin.org/docs/general/server/media/movies.html](https://jellyfin.org/docs/general/server/media/movies.html)

### 2.1.2 字幕中的方块

一般的解决方式都是在字幕中进行设置，这种方式是使用转码烧录的形式，对cpu和内存都会进行消耗，对于性能比较低的nas来说，压力很大，比如我的j1900矿渣。目前有一个简单的解决办法，升级到`>Jellyfin 10.7.0`的版本，目前还是`rc`版，这个版本支持加载自定义的字体了`控制台>播放>备用字体文件路径`，就解决了。

## 2.2 docker-compose
### 2.2 1 安装docker

``` bash
apt update
apt install apt-transport-https
apt upgrade -y
curl -fsSL https://download.docker.com/linux/debian/gpg | apt-key add -
echo "deb [arch=amd64] https://download.docker.com/linux/debian $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list
```
#### 参考链接

+ [https://docs.docker.com/engine/install/debian/](https://docs.docker.com/engine/install/debian/)
### 2.2 2 安装docker-compose

``` bash
apt install docker-ce docker-compose
```

### 2.2 3 前期准备

创建子网隔离，非必须。
``` bash
docker network create --subnet 10.10.10.0/24 pve-subnet
```
该处的`pve-subnet`对应下面`docker-compose.yml`文件中`networks`节点下的`name`,可以忽略，`docker-compose`会自动建立。

### 2.2 4 为什么使用docker-compose

docker虽然部署与管理变的容易，但是当遇到版本升级的时候就需要重新使用命令行进行一次部署，然而很多时候我都懒得进行本分，目前工作中使用的是k8s，在家用nas上我觉得实在是没必要，于是比较传统的`docker-compose`就是一个很好的解决方案。
每当有版本升级的时候只要修改`docker-compose.yml`文件中对应的镜像标签，然后重新docker-compose up -d就自动进行拉取部署升级，不会影响其他未修改配置的镜像，就方便很多了。

## 2.3 Home Assistant

### 2.3.1 调用本地图片

在`configuration.yaml`文件的位置建立一个`www`文件夹，将要引用的文件放进去，在配置文件中使用`/local`对应的就是`www`文件夹中的文件，例如
``` bash
 blueprints
│   └── automation
│       └── homeassistant
│           ├── motion_light.yaml
│           └── notify_leaving_zone.yaml
├── configuration.yaml
├── deps
├── groups.yaml
├── home-assistant.log
├── home-assistant_v2.db
├── scenes.yaml
├── scripts.yaml
├── secrets.yaml
├── tts
└── www
    └── floorplan.png
```
如果要在配置中调用`www/floorplan.png`则对应的配置文件为:
```yaml
type: picture-elements
image: /local/floorplan.png
elements:
  - type: state-badge
    entity: binary_sensor.updater
    style:
      top: 65%
      left: 38%
```

### 2.3.2 水位流量采集

我在天气好的时候会出去钓鱼，但是松花江如果在汛期的时候涨水，有些地方就去不了了，为了不耽误时间，我发现松辽水利网每天8点会发布一次当前的水位流量，所以我进行了采集，这样出门前看一下水位和流速来判断可以去哪个地方钓鱼，避免白跑一趟。

在`configuration.yaml`下面加入下面的内容，就可以在面板中加载进来了。
``` yaml
sensor:
  - platform: scrape
    resource: http://www.slwr.gov.cn/swjgzfw/sssq.asp
    name: slwr shuiwei
    select: 'script'
    index: 1
    scan_interval: 3600
    value_template: >-
      {{ (value | replace ("cvt(","") | replace (");","") | replace ("'","") ) }}
  - platform: scrape
    resource: http://www.slwr.gov.cn/swjgzfw/sssq.asp
    name: slwr liuliang
    select: 'font'
    index: 8
    scan_interval: 3600
```

### 2.3.3 小米扫地机器人

第一二代的小米扫地机，使用的是`Token`的方式加入的，目前有一个简单的工具[https://github.com/PiotrMachowski/Xiaomi-cloud-tokens-extractor](https://github.com/PiotrMachowski/Xiaomi-cloud-tokens-extractor) 运行后输入账号密码就可以获取到局域网中的`IP`和`Token`、`设备Id`，我们这里使用`IP`和`Token`就够了。
获取到信息后，在`configuration.yaml`下面加入下面的内容，就可以在面板中加载进来了。

``` yaml
vacuum:
  - platform: xiaomi_miio
    host: 192.168.0.69
    token: **********************************
```

### 2.3.4 格力宁韵空调

[https://github.com/RobHofmann/HomeAssistant-GreeClimateComponent](https://github.com/RobHofmann/HomeAssistant-GreeClimateComponent)
下载最新版本解压后如下
```
|   climate.yaml
|   configuration.yaml
|   info.md
|   LICENSE
|   README.md
|
+---.github
|   \---ISSUE_TEMPLATE
|           bug_report.md
|           feature_request.md
|
\---custom_components
    \---gree
            climate.py
            manifest.json
            __init__.py
```

如果`configuration.yaml`同级目录下没有`custom_components`则直接复制进去，如果已经存在，则复制下面的`gree`到`custom_components`下，然后在复制`climate.yaml`到`configuration.yaml`同级目录,之后编辑``configuration.yaml`同级目录加入一行`climate: !include climate.yaml`。

使用`格力+`接入空调，这样就能在路由器中看到空调的`IP`和`MAC`，下面会用到，虽然我是在苏宁购买的，但是苏宁的app实在是不好用，于是下载了`格力+`，在添加设备的时候直接选择`宁韵`，然后重置空调的`wifi`，就可以连接了，如果连不上，那么修改`wifi`里的`2.4G`的`无线模式`为`11gb`开头的模式。

之后编辑`climate.yaml`中的内容：

```yaml
- platform: gree
  name: 起一个名字，例如ningyun_ac
  host: 空调的IP地址
  port: 7000
  mac: '空调的MAC地址，可以是-分隔，也可以是:分隔'
  target_temp_step: 1
  lights: input_boolean.first_ac_lights
  health: input_boolean.first_ac_health
  sleep: input_boolean.first_ac_sleep
  powersave: input_boolean.first_ac_powersave
```

### 2.3.x lovelace

``` yaml
title: 保利·上城
views:
  - panel: false
    title: Home
    icon: 'hass:home-assistant'
    badges: []
    cards:
      - type: vertical-stack
        cards:
          - type: 'custom:weather-card'
            entity: weather.bao_li_shang_cheng
            number_of_forecasts: '5'
          - type: horizontal-stack
            cards:
              - type: entity
                entity: sensor.slwr_shuiwei
                name: 水位
                unit: 米
              - type: entity
                entity: sensor.slwr_liuliang
                name: 流量
                unit: 立方米
      - type: picture-elements
        elements:
          - type: state-icon
            entity: vacuum.xiaomi_vacuum_cleaner
            style:
              top: 65%
              left: 35%
          - type: state-icon
            entity: climate.ningyun_ac
            style:
              top: 8%
              left: 35%
        image: /local/floorplan.png
      - type: vertical-stack
        cards:
          - type: thermostat
            entity: climate.ningyun_ac
            name: 格力宁韵
          - type: picture-glance
            image: /local/img/vacuum.png
            entities:
              - entity: vacuum.xiaomi_vacuum_cleaner
            tap_action:
              action: more-info
            hold_action:
              action: none
            title: 小米
            entity: vacuum.xiaomi_vacuum_cleaner
```

## 2.4 syncthing

资源占用小，内网发现，全球发现，内网穿透。

要注意的是从其他设备同步过来的文件夹，默认情况下会出现在`/config`下，

## 附录

### linux下rename命令进行批量重命名

```bash
rename 's///g' *.mp4
例如
rename 's/cowboy\.bebop\.//g' *.mkv
将cowboy.bebop替换为空，也就是删掉
```
其中`s`为开始，第一个`/`后面写要查找的字符串,第二个`/`进行分隔，第三个`/`前面写替换的字符串，然后`g`结尾

特殊字符用`\`进行转义，包括`空格`和`[]{}().\`~!@#$%^&*_+-=;:'"<>,?`之类的，总之就是会影响正则的都要进行转义

### docker-compose.yml

``` yaml
version: "3.3"
services:
  qbittorrent:
    image: ghcr.io/linuxserver/qbittorrent:amd64-latest
    container_name: qbittorrent
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Asia/Shanghai
      - UMASK_SET=022
      - WEBUI_PORT=8008
    volumes:
      - /nas/opt/qbittorrent/config:/config
      - /nas:/downloads
    ports:
      - 6969:6969
      - 6969:6969/udp
      - 8008:8008
    restart: always
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 200M
  home-assistant:
    image: homeassistant/home-assistant:2020.12.1
    container_name: home-assistant
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Asia/Shanghai
    volumes:
      - /etc/localtime:/etc/localtime:ro
      - /nas/opt/home-assistant/config:/config
    restart: always
    network_mode: 'host'
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 200M
  syncthing:
    image: ghcr.io/linuxserver/syncthing
    container_name: syncthing
    hostname: syncthing
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Asia/Shanghai
    volumes:
      - /nas/syncthing:/config
    ports:
      - 8384:8384
      - 22000:22000
      - 21027:21027/udp
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
networks:
  default:
    external:
      name: pve-subnet
```

启动`start.sh`文件里，直接使用`bash start.sh`启动。

``` bash
docker-compose --compatibility -f docker-compose.yml up -d
```

停止了`stop.sh`文件里，直接使用`bash stop.sh`停止。
``` bash
docker-compose --compatibility down
```

增加`--compatibility`参数是因为docker不是swam的模式的情况下，`deploy`节点下对资源的限制是不起作用的。
