# gocron - 定时任务管理系统

[![Build Status](https://travis-ci.org/linthan/gocron.png)](https://travis-ci.org/linthan/gocron)
[![Downloads](https://img.shields.io/github/downloads/linthan/gocron/total.svg)](https://github.com/linthan/gocron/releases)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg?maxAge=2592000)](https://github.com/linthan/gocron/blob/master/LICENSE)
[![Release](https://img.shields.io/github/release/linthan/gocron.svg?label=Release)](https://github.com/linthan/gocron/releases)

# 项目简介

使用 Go 语言开发的轻量级定时任务集中调度和管理系统, 用于替代 Linux-crontab [查看文档](https://github.com/linthan/gocron/wiki)

原有的延时任务拆分为独立项目[延迟队列](https://github.com/linthan/delay-queue)

## 功能特性

- Web 界面管理定时任务
- crontab 时间表达式, 精确到秒
- 任务执行失败可重试
- 任务执行超时, 强制结束
- 任务依赖配置, A 任务完成后再执行 B 任务
- 账户权限控制
- 任务类型
  - shell 任务
    > 在任务节点上执行 shell 命令, 支持任务同时在多个节点上运行
  - HTTP 任务
    > 访问指定的 URL 地址, 由调度器直接执行, 不依赖任务节点
- 查看任务执行结果日志
- 任务执行结果通知, 支持邮件、Slack、Webhook

### 截图

![流程图](https://raw.githubusercontent.com/linthan/gocron/master/assets/screenshot/scheduler.png)
![任务](https://raw.githubusercontent.com/linthan/gocron/master/assets/screenshot/task.png)
![任务日志](https://raw.githubusercontent.com/linthan/gocron/master/assets/screenshot/tasklog.png)
![Slack](https://raw.githubusercontent.com/linthan/gocron/master/assets/screenshot/notification.png)

### 支持平台

> Windows、Linux、Mac OS

### 环境要求

> MySQL

## 下载

[releases](https://github.com/linthan/gocron/releases)

[版本升级](https://github.com/linthan/gocron/wiki/版本升级)

## 安装

### 二进制安装

1. 解压压缩包
2. `cd 解压目录`
3. 启动

- 调度器启动
  - Windows: `gocron.exe web`
  - Linux、Mac OS: `./gocron web`
- 任务节点启动, 默认监听 0.0.0.0:5921
  - Windows: `gocron-node.exe`
  - Linux、Mac OS: `./gocron-node`

4. 浏览器访问 http://localhost:5920

### 源码安装

- 安装 Go 1.9+
- `go get -d github.com/linthan/gocron`
- 编译 `make`
- 启动
  - gocron `./bin/gocron web`
  - gocron-node `./bin/gocron-node`

### docker

```shell
docker run --name gocron -p 5920:5920 -d ouqg/gocron
```

### 开发

1. 安装 Go1.9+, Node.js, Yarn
2. 安装前端依赖 `make install-vue`
3. 启动 gocron, gocron-node `make run`
4. 启动 node server `make run-vue`, 访问地址 http://localhost:8080

访问http://localhost:8080, API 请求会转发给 gocron

`make` 编译

`make run` 编译并运行

`make package` 打包

> 生成当前系统的压缩包 gocron-v1.5-darwin-amd64.tar.gz gocron-node-v1.5-darwin-amd64.tar.gz

`make package-all` 生成 Windows、Linux、Mac 的压缩包

### 命令

- gocron

  - -v 查看版本

- gocron web
  - --host 默认 0.0.0.0
  - -p 端口, 指定端口, 默认 5920
  - -e 指定运行环境, dev|test|prod, dev 模式下可查看更多日志信息, 默认 prod
  - -h 查看帮助
- gocron-node
  - -allow-root \*nix 平台允许以 root 用户运行
  - -s ip:port 监听地址
  - -enable-tls 开启 TLS
  - -ca-file   CA 证书文件
  - -cert-file 证书文件
  - -key-file 私钥文件
  - -h 查看帮助
  - -v 查看版本

## To Do List

- [x] 版本升级
- [x] 批量开启、关闭、删除任务
- [x] 调度器与任务节点通信支持 https
- [x] 任务分组
- [x] 多用户
- [x] 权限控制

## 程序使用的组件

- Web 框架 [Macaron](http://go-macaron.com/)
- 定时任务调度 [Cron](https://github.com/robfig/cron)
- ORM [Xorm](https://github.com/go-xorm/xorm)
- UI 框架 [Element UI](https://github.com/ElemeFE/element)
- 依赖管理 [Govendor](https://github.com/kardianos/govendor)
- RPC 框架 [gRPC](https://github.com/grpc/grpc)

## 反馈

提交[issue](https://github.com/linthan/gocron/issues/new)

## ChangeLog

## v1.5

- 前端使用 Vue+ElementUI 重构
- 任务通知
  - 新增 WebHook 通知
  - 自定义通知模板
  - 匹配任务执行结果关键字发送通知
- 任务列表页显示任务下次执行时间

## v1.4

- HTTP 任务支持 POST 请求
- 后台手动停止运行中的 shell 任务
- 任务执行失败重试间隔时间支持用户自定义
- 修复 API 接口调用报 403 错误

## v1.3

- 支持多用户登录
- 增加用户权限控制

## v1.2.2

- 用户登录页增加图形验证码
- 支持从旧版本升级
- 任务批量开启、关闭、删除
- 调度器与任务节点支持 HTTPS 双向认证
- 修复任务列表页总记录数显示错误

## v1.1

- 任务可同时在多个节点上运行
- \*nix 平台默认禁止以 root 用户运行任务节点
- 子任务命令中增加预定义占位符, 子任务可根据主任务运行结果执行相应操作
- 删除守护进程模块
- Web 访问日志输出到终端
