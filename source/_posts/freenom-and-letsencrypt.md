---
title: Freenow申请的域名申请letsencrypt证书的方法
date: 2022-12-23 14:24:02
updated:  2022-12-29 10:50:00
mermaid: true
categories:
- 知识储备
tags:
 - Freenom
 - SSL证书
 - letsencrypt
 - 免费顶级域名
---


freenow申请的域名，直接使用进行`cloudflare`解析是可以的，但是申请证书的时候却无法直接使用`certbot/dns-cloudflare`选择dns的方式直接通过api申请和续期。
```log
Saving debug log to /var/log/letsencrypt/letsencrypt.log

How would you like to authenticate with the ACME CA?
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
1: Obtain certificates using a DNS TXT record (if you are using Cloudflare for
DNS). (dns-cloudflare)
2: Spin up a temporary webserver (standalone)
3: Place files in webroot directory (webroot)
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Select the appropriate number [1-3] then [enter] (press 'c' to cancel): 1
Requesting a certificate for *.****.**
Encountered CloudFlareAPIError adding TXT record: 1038 You cannot use this API for domains with a .cf, .ga, .gq, .ml, or .tk TLD (top-level domain). To configure the DNS settings for this domain, use the Cloudflare Dashboard.
Error communicating with the Cloudflare API: You cannot use this API for domains with a .cf, .ga, .gq, .ml, or .tk TLD (top-level domain). To configure the DNS settings for this domain, use the Cloudflare Dashboard.
Ask for help or search for solutions at https://community.letsencrypt.org. See the logfile /var/log/letsencrypt/letsencrypt.log or re-run Certbot with -v for more details.
```

只能通过手动添加txt解析记录的方式进行证书申请。

我选择了使用acme的申请方式进行申请，但是依然无法做到全自动，因为上面提到了，cloudflare的api不能对`.cf, .ga, .gq, .ml, or .tk TLD (top-level domain).`顶级域名进行api申请。

由于不喜欢在服务器上安装东西，所以还是采用docker的方式。

# 第一步：编写docker-compose.yml

```yml
version: "3"
services:
  nginx:
    image: nginx:alpine
    container_name: nginx
    environment:
      - TZ=Asia/Shanghai
      - NGINX_PORT=80
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./config/nginx/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./config/nginx/nginx/conf.d:/etc/nginx/conf.d
      - ./config/nginx/www/html:/usr/share/nginx/html
      - ./letsencrypt/etc/:/etc/letsencrypt/
      - /dev/shm/:/dev/shm/
  acme.sh:
    image: neilpang/acme.sh:latest
    container_name: acme.sh
    command: daemon
    volumes:
      - ./acmeout:/acme.sh
      - ./config/nginx/www/html:/www
      - ./letsencrypt/etc/live:/letsencrypt
      - /var/run/docker.sock:/var/run/docker.sock
```

`nginx`容器挂载的解释：

- `./config/nginx/nginx/nginx.conf:/etc/nginx/nginx.conf:ro` 是默认的`nginx.conf`文件的映射
- `./config/nginx/nginx/conf.d:/etc/nginx/conf.d` 是网站配置文件的路径，也就是nginx.conf 中include部分的路径
- `./config/nginx/www/html:/usr/share/nginx/html` 默认的网页文件存放路径
- `./letsencrypt/etc/:/etc/letsencrypt/` 证书存放路径

` acme.sh`容器挂载的解释：

- `./acmeout:/acme.sh` acme.sh 执行文件的路径
- `./config/nginx/www/html:/www` nginx中网页文件的路径，申请证书时使用`--webroot`方便
- `- ./letsencrypt/etc/live:/letsencrypt` 证书路径，方便存放


# 第二步：编写网站的conf文件

我们以github的反代为例，在本地的`./config/nginx/nginx/conf.d`下编写一个文件

```conf
server {
    server_name git.域名;
    listen 80;
    location / {
        root /usr/share/nginx/html;
        index index.html;
    }
}
```

# 第三步：启动容器

```shell
docker-compose up -d
docker exec acme.sh --set-default-ca --server letsencrypt
```

# 第四步：申请证书

由于acme.sh不会自动创建路径，所以我们在申请证书前需要手动创建路径

```shell
mkdir -p ./letsencrypt/etc/live/git.域名
```

然后再申请证书

```shell
docker exec acme.sh --issue -d git.域名 --webroot /www --key-file /letsencrypt/git.域名/privkey.pem --fullchain-file /letsencrypt/git.域名/fullchain.pem --keylength 4096
```

为了方便申请，我们写一个脚本来执行上面的两个步骤
```shell
mkdir -p ./letsencrypt/etc/live/$1
docker exec acme.sh --issue -d $1 --webroot /www --key-file /letsencrypt/$1/privkey.pem --fullchain-file /letsencrypt/git.域名/fullchain.pem --keylength 4096
```

保存为`regssl.sh`

我们再使用的时候就可以`bash regssl.sh a.b.com`的方式使用了。

# 第五步：再次修改网站的conf文件

```conf
server {
    server_name git.域名;
    listen 80;
    location / {
        root /usr/share/nginx/html;
        index index.html;
    }
}
server {
    server_name git.域名;
    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/git.qunb.ml/fullchain.pem; 
    ssl_certificate_key /etc/letsencrypt/live/git.qunb.ml/privkey.pem; 
    location / {
        proxy_pass https://github.com;
        proxy_redirect https://github.com https://git.qunb.ml;
    }
}
```

然后重启nginx

```shell
docker restart nginx
```

# 第六步：设置自动更新证书

`crontab -e`
添加如下内容

```cron
44 0 * * * docker exec acme.sh --cron
```

# 注意

不能申请泛域名证书
