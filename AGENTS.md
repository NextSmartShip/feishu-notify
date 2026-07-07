# Repository Guidelines

## Project Structure & Module Organization

本仓库是用于发送飞书通知的 TypeScript GitHub Action。源码位于 `src/`：
`index.ts` 是 action 入口，`main.ts` 负责运行流程编排，`sendFeishu.ts`
负责通知发送，`src/api/` 放置 GitHub API 相关逻辑，`src/utils/`
放置共享工具。测试文件按行为放在 `__tests__/*.test.ts`。打包产物输出到
`dist/`，源码变更后需要保持同步。覆盖率输出在 `coverage/`，徽章文件在
`badges/coverage.svg`。本地 smoke test 脚本位于 `script/`。

## Build, Test, and Development Commands

统一使用 `pnpm` 执行包脚本。

- `pnpm run test`：通过 `ts-jest` 运行 Jest 单元测试。
- `pnpm run ci-test`：运行同一套 Jest 测试，用于 CI 风格检查。
- `pnpm run lint`：使用 `.github/linters/.eslintrc.yml` 运行 ESLint。
- `pnpm run format:check`：检查 Prettier 格式。
- `pnpm run format:write`：格式化整个仓库。
- `pnpm run package`：使用 `ncc` 将 `src/index.ts` 打包到 `dist/`。
- `pnpm run all`：格式化、lint、测试、更新覆盖率并重建 `dist/`。
- `pnpm run test:notify:failure` / `pnpm run test:notify:success`：通过
  `script/local-notify-smoke.sh` 运行本地通知 smoke test。

## Coding Style & Naming Conventions

目标运行环境为 Node 20，并启用严格 TypeScript（`strict`、`noImplicitAny`、
`NodeNext`）。Prettier 使用 2 空格缩进、单引号、无分号、LF 换行，行宽为 80。优先编写类型清晰的函数，并将 action 输入解析、API 调用、通知发送逻辑分离。文件名使用小写，遵循
`get-action-options.ts` 这类现有命名模式。

## Testing Guidelines

Jest 会发现 `__tests__/` 下匹配 `**/*.test.ts`
的测试文件。新增行为需要补充聚焦测试，并 mock 外部 GitHub 与飞书调用。覆盖率从
`src/**` 收集。常规修改运行 `pnpm run test`；影响运行行为或 `dist/`
的修改，在发布前运行 `pnpm run all`。

## Commit & Pull Request Guidelines

近期提交使用简短的 Conventional Commit 风格前缀并带 emoji，例如 `feat🎉: ...`、
`fix🐛: ...`、`test🧪: ...`。提交标题保持简洁、动词明确。PR 需要说明行为变化、列出已运行的验证命令、关联相关 issue；如果通知文案或卡片格式有变化，附上截图或 payload 示例。远端验证时使用
`target-group: personal`，避免测试通知发送到生产群。
