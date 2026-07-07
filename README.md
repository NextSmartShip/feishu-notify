# Create a GitHub Action Using TypeScript

[![GitHub Super-Linter](https://github.com/actions/typescript-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/actions/typescript-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

## Use Guide

### 项目结构

```text
src/
  index.ts              # GitHub Action 入口
  main.ts               # 串联输入解析与通知流程
  action-options.ts     # 读取 action inputs 和 GitHub context
  config.ts             # 飞书群、项目名、预览地址、通知人配置
  types.ts              # 共享类型
  api/
    index.ts            # GitHub / 飞书 API 封装
    workflow.ts         # 获取 workflow run，支持 workflow-run-json 测试入口
    push.ts             # 组装并发送飞书卡片
    request/index.ts    # axios 实例与请求拦截器
  utils/index.ts        # 日期、commit 格式化、token、预览地址等工具
```

### 标准远端用法

通知 job 需要显式使用 `if: ${{ always() }}`，否则依赖的构建 job 失败后，GitHub
Actions 会直接跳过通知 job，action 代码不会有执行机会。

```yaml
notify:
  if: ${{ always() }}
  needs: [build]
  runs-on: ubuntu-latest
  permissions:
    contents: read
    actions: read
  steps:
    - uses: NextSmartShip/feishu-notify@master
      with:
        token: ${{ github.token }}
```

### 测试群组

远端测试时必须指定 `target-group: personal`，通知只会发送到“前端大佬们”对应的
`FrontEndOldManGroupBot`，避免误发生产群组或周末群组。

```yaml
notify:
  if: ${{ always() }}
  needs: [build]
  runs-on: ubuntu-latest
  permissions:
    contents: read
    actions: read
  steps:
    - uses: NextSmartShip/feishu-notify@master
      with:
        token: ${{ github.token }}
        target-group: personal
```

### 提交展示逻辑

通知卡片里的提交信息以当前 workflow run 的 `head_sha` / `head_commit` 为准：

- 优先使用 workflow run 返回的 `head_commit`，不额外查询关联 PR。
- 如果 `head_commit` 不存在，回退到 GitHub Commit API 拉取 `head_sha`
  对应的单个commit。
- 不再通过 `commits/{sha}/pulls` 查找关联 PR，也不会展示关联 PR 的全部 commits。

这样可以保证飞书消息展示的是当前构建实际对应的提交，避免 tag 或 workflow
run 只包含 PR 的部分提交时，把后续未进入当前构建的 PR commit 一并展示出来。

### 本地 GitHub Local Actions / act 验证

本地可以用 GitHub Local
Actions 或 act 验证 action 能否在 runner 容器里启动、读取 inputs、生成成功/失败卡片并路由到个人群。由于本地没有真实的 GitHub
workflow run id，建议传入 `workflow-run-json` 跳过远端 run 查询。

```yaml
name: Local Notify Smoke Test

on:
  workflow_dispatch:

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - uses: ./
        with:
          token: ${{ github.token }}
          target-group: personal
          workflow-run-json: |
            {
              "id": 123,
              "event": "push",
              "head_branch": "master",
              "html_url": "https://github.com/NextSmartShip/wms-ui/actions/runs/123",
              "run_started_at": "2026-07-06T11:59:00Z",
              "head_commit": {
                "message": "feat: local notification smoke test",
                "author": {
                  "name": "Jiaqiang Wu",
                  "email": "jiaqiang.wu@nextsmartship.com"
                }
              },
              "repository": {
                "name": "wms-ui",
                "full_name": "NextSmartShip/wms-ui",
                "owner": {
                  "login": "NextSmartShip"
                }
              },
              "triggering_actor": {
                "login": "wujiaqiang",
                "html_url": "https://github.com/wujiaqiang"
              },
              "jobs": [
                {
                  "name": "build",
                  "status": "completed",
                  "conclusion": "failure",
                  "html_url": "https://github.com/NextSmartShip/wms-ui/actions/runs/123/job/456"
                }
              ]
            }
```

本地 act 只能做近似验证，不能证明远端真实 `run_id`、GitHub jobs
API 和 GitHub 调度行为。最终仍需要在远端 GitHub Action 中用
`target-group: personal` 分别验证成功和失败场景。

也可以直接使用 package scripts 触发本地 smoke test：

```bash
pnpm run test:notify:failure
pnpm run test:notify:success
```

以上命令会临时创建
`.github/workflows/local-notify-smoke.yml`，执行结束后自动删除。

```bash
# 创建test.yml
mkdir ./.github/workflows/test.yml

# 运行docker
docker

# 运行指定yml:
act --container-architecture linux/amd64 --workflows .github/workflows/test.yml -P ubuntu-latest=shivammathur/node:latest
```

## Create Your Own Action

To create your own action, you can use this repository as a template! Just
follow the below instructions:

1. Click the **Use this template** button at the top of the repository
1. Select **Create a new repository**
1. Select an owner and name for your new repository
1. Click **Create repository**
1. Clone your new repository

> [!IMPORTANT]
>
> Make sure to remove or update the [`CODEOWNERS`](./CODEOWNERS) file! For
> details on how to use this file, see
> [About code owners](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners).
