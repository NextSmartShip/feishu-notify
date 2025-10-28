# 变更日志

### 新增功能

- **环境参数支持**: 新增 `environment` 输入参数，支持区分本地、测试和生产环境
  - `local`: 本地开发环境，消息发送到前端老人群
  - `test`: 测试环境，消息发送到测试群
  - `production`: 生产环境（默认），根据构建状态智能路由

#### 在其他项目的 workflow 中使用

```yaml
# 生产环境
- uses: NextSmartShip/feishu-notify@master
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    environment: 'production'

# 测试环境
- uses: NextSmartShip/feishu-notify@master
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    environment: 'test'

# 本地开发
- uses: NextSmartShip/feishu-notify@master
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    environment: 'local'
```

### 技术细节

#### 消息路由逻辑

1. **本地环境** (`environment: 'local'`):
   - 强制发送到前端老人群
   - 控制台显示: `🔍 检测到本地环境参数，消息将发送到前端老人群`

2. **测试环境** (`environment: 'test'`):
   - 强制发送到测试群
   - 控制台显示: `🧪 检测到测试环境参数，消息将发送到测试群`

3. **生产环境** (`environment: 'production'`):
   - 根据构建状态和时间智能路由
   - 控制台显示: `🚀 生产环境，消息将根据实际情况发送`

#### 参数传递链路

```
action.yml (environment input)
    ↓
get-action-options.ts (读取 environment)
    ↓
main.ts (传递 environment)
    ↓
getWorkFlow.ts (转发 environment)
    ↓
push.ts (使用 environment 判断群组)
    ↓
fetchFeishuWebhook (最终发送到对应群组)
```
