---
title: 'Tynel：把 TypeScript 编译成原生二进制'
description: '一个用 TypeScript 语法书写、编译为 Go 运行时原生二进制的编译器项目：从动机与六阶段规划，到第一个能被反汇编验证的加法程序。'
order: 13
accent: '#7dd3fc'
categories:
- 技术教程
tags:
- TypeScript
- Go
- 编译器
---

这个专栏记录一个编译器从零长出来的过程。输入是 TypeScript 源码，输出是不依赖 Node、不依赖 JavaScript 引擎的原生二进制，运行时用 Go 的。

写的时候会照顾两类人：写 TypeScript 但不熟机器码和调用约定的，和写 Go 但没进过编译器内部的。遇到 Go 工具链的地方解释 Go，遇到 JavaScript 数值语义的地方解释 JavaScript，谁也不假定对方那一半。

计划分六个阶段，每个阶段都得交出一个能看见的结果：手写中间表示跑出原生程序、真实 TypeScript 出二进制、条件选择、状态与循环、静态模块，最后把它做成一个能用的命令。

从[第一篇：用 TypeScript 的语法，写出 Go 的二进制](./tynel-1.md)开始读。
