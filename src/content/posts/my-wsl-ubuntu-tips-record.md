---
title: 我的 WSL Ubuntu 使用经验与实用配置指南
cover: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/ubuntu.png
categories: 
- 技术教程
tags:
- Ubuntu
- Windows 10
date: 2019-11-06 22:48:43
---

## 国内网络安装/更新

目前最新版是 2.7.10, 使用 `https://gh-proxy.org` 等代理加速加载：

```plaintext
https://gh-proxy.com/https://github.com/microsoft/WSL/releases/download/2.7.10/wsl.2.7.10.0.x64.msi
```

下载 Ubuntu WSL 镜像，通过源镜源镜像下载：

```plaintext
https://mirrors.ustc.edu.cn/ubuntu-releases/24.04/ubuntu-24.04.3-wsl-amd64.wsl
```


## 安装 Apache2 错误

安装好 Apache2 后，通过命令`service apache2 start `启动，报错为：

```shell
AH00076: Failed to enable APR_TCP_DEFER_ACCEPT
```

解决办法在 stackoverflow 上有，方法如下：

`sudo vi` 打开 `/etc/apache2/apache2.conf`，在文件的最底部加上一行以下内容：

```
AcceptFilter http none
```

然后重启 Apache2 问题解决。

常用指令：

```shell
update-rc.d apache2 defaults
```

将apache2服务添加到自动启动程序组。

## 通过源代码安装软件

+ 使用压缩包管理工具解压缩软件包

+ 进入到解压缩文件所在的目录

+ 执行指令：

  ```shell
  ./configure
  make
  install
  ```

  

