# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

GitHub Actions TypeScript action，监听 GitHub Actions 工作流状态，向飞书群发送构建通知。打包后部署为 `dist/index.js`，由 `action.yml` 引用。

## 常用命令

```bash
pnpm run test                                    # 运行测试（jest + ts-jest）
pnpm run test -- --testPathPattern=<文件名>      # 运行单个测试文件
pnpm run lint                                    # ESLint 检查
pnpm run format:write                            # Prettier 格式化
pnpm run package                                 # 打包 src/index.ts → dist/index.js
pnpm run bundle                                  # 格式化 + 打包（推荐）
pnpm run all                                     # 完整流程：格式化+lint+测试+覆盖率+打包
```

> `dist/` 目录需要提交到仓库，GitHub Actions 直接运行 `dist/index.js`。

## 核心架构

**数据流：**
```
GitHub Actions 触发
  → get-action-options.ts   # 读取 action inputs
  → getWorkFlow.ts          # 调用 GitHub API 获取 workflow run 数据
  → push.ts                 # 核心业务：解析 → 构建飞书消息 → 发送
```

**关键模块：**
- `src/config.ts` — 飞书机器人 WebHook、通知用户（email→open_id）、项目名称映射，均硬编码
- `src/api/push.ts` — 环境判断（release/master→生产）、群路由（工作日/周末）、@通知逻辑（基础用户+推送人）
- `src/api/request/index.ts` — Axios 实例，自动补全 `https://api.github.com` 前缀
- `src/utils/index.ts` — commit 格式化、耗时计算、周末判断

**扩展点：**
- 新增项目：在 `src/config.ts` 的 `projectNames` 中添加 repo name → 配置映射
- 新增通知用户：在 `src/config.ts` 的 `notifyUserList` 中添加
- 新增飞书群：在 `src/config.ts` 的 `botUrls` 中添加，`src/api/push.ts` 中调整路由
