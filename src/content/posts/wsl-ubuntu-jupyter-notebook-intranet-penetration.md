---
title: WSL Ubuntu 下配置 Jupyter Notebook 并实现内网穿透
date: 2020-10-16 21:27:24
categories:
  - 技术教程
tags:
  - Jupyter Notebook
  - 内网穿透
---

之前看到有朋友在服务器上，搭建了 [Jupyter Notebook](https://jupyter.org/)（一个笔记本，支持多种编程语言），觉得挺好的，自己也想弄个用用，无奈没有服务器，只好另寻他径。

## 启用 WSL

网络上有很多教程，就不赘述了:

- [手把手教你启用Win10的Linux子系统](https://blog.csdn.net/zhangdongren/article/details/82663977)
- [Win10上体验Linux子系统--Linux虚拟机的完美替代方案](https://www.jianshu.com/p/c3025989c28c)

## 安装 Jupyter Notebook

### 安装

在子系统中选择用 python 来安装 jupyter，因为 Ubuntu 自带了 Python3

1. 将pip升级到最新版本

   ```bash
   pip3 install --upgrade pip
   ```

2. 安装Jupyter Notebook

   ```bash
   pip3 install jupyter
   ```

### 配置

配置的过程中如有疑问，请查阅官方文档，命令如下：

```bash
jupyter notebook --help
```

#### 默认端口启动

安装完成后，在终端输入命令：

```bash
jupyter notebook
```

执行命令后，在终端中会有一些提示信息：

```bash
[I 00:09:44.222 NotebookApp] Serving notebooks from local directory: /home/mahoo12138
[I 00:09:44.223 NotebookApp] The Jupyter Notebook is running at:
[I 00:09:44.224 NotebookApp] http://localhost:8888/
[I 00:09:44.225 NotebookApp] Use Control-C to stop this server and shut down all kernels (twice to skip confirmation).
```

- 注意：之后在Jupyter Notebook的所有操作，都请保持终端**不要关闭**，因为一旦关闭终端，就会断开与本地服务器的链接，jupyter notebook也就关闭了。
- 此时在浏览器中打开**`http://localhost:8888`**，即可看到jupyter notebook

![localhost](https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/tutorials/jupyter/localhost.png)

#### 指定端口启动

如果你想指定端口启动，可输入以下命令：

```shell
jupyter notebook --port <port_number>
```

#### 修改配置文件

- 终端修改
  - 生成配置文件

    ```shell
    jupyter notebook --generate-config
    ```

  - 生成密码

    ```shell
    jupyter notebook password
    ```

    ![password](https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/tutorials/jupyter/password.png)

- 文件修改
  - Win10子系统Ubuntu的目录在*C:\Users\用户名\AppData\Local\Packages\CanonicalGroupLimited.UbuntuonWindows_79rhkp1fndgsc\LocalState\rootfs\home*

  在**home**中打开*Ubuntu用户名* \ .jupyter\jupyter_notebook_config.py文件，如果你准备远程访问，可以定位到*c.NotebookApp.allow_remote_access*，删除 **#**，修改值为 **True**

  ![allow_amote_access](https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/tutorials/jupyter/allow_amote_access.png)

## 远程访问 Jupyter Notebook

### 内网穿透

由于是在本地搭建的 Jupyter Notebook，在外网上是访问不了的，如果想远程访问的话，需要内网穿透，这里推荐使用**[NATAPPP](https://natapp.cn/)**，注册后会有两条免费的隧道使用，配置如图：

![natapp](https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/tutorials/jupyter/natapp.png)

- 之后下载客户端：[直达链接](https://natapp.cn/#download)

- 打开客户端，输入*natapp -authtoken=(之前复制的字符)*，回车

  ```bash
  natapp -authtoken=255b*******773f6
  ```

  ![natapp_ok](https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/tutorials/jupyter/natapp_ok.png)

图中的地址就是外网访问地址了，当然要保持 Ubuntu 子系统客户端和 Natapp 客户端同时运行，Jupyter Notebook才能打开，还有一个体验极差的设置，免费的内网穿透隧道会不定时更换地址，如果真的需要长时间运行，付费版才是王道。

更新：推荐使用自己的 Frp 进行内网穿透，或者是公益的 Sakura Frp。
