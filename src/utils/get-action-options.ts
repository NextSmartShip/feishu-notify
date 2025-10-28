import * as core from '@actions/core'
import * as github from '@actions/github'
import type { PushEvent } from '@octokit/webhooks-definitions/schema'
import { Environment } from '../config'
// import type { UserDefinedOptions } from '../type'

const getActionOptions = () => {
  const token = core.getInput('token')
  const username = core.getInput('username')
  const environment = core.getInput('environment') || Environment.Test
  // getBooleanInput 其实本质上就是一种 parseBoolean(core.getInput('key'))
  const payload = github.context.payload as PushEvent

  // 优先使用 GitHub Actions 自动注入的值，如果没有则使用手动传入的值（用于本地测试）
  const owner =
    payload.organization?.login ||
    core.getInput('owner') ||
    github.context.repo.owner
  const repo =
    payload.repository?.name ||
    core.getInput('repo') ||
    github.context.repo.repo
  const run_id = github.context.runId || core.getInput('run_id') || Date.now()

  console.log(`当前事件(eventName、token、run_id)：${token},run_id: ${run_id}`)
  console.log(`环境参数(environment): ${environment}`)
  if (github.context.eventName === 'push') {
    const pushPayload = github.context.payload
    core.info(`The head commit is: ${pushPayload.head_commit}`)
  }
  return {
    token,
    username,
    environment,
    payload,
    owner,
    repo,
    run_id,
    github_token: token
    // motto,
    // filepath,
    // title,
    // includeFork,
    // includeArchived,
    // onlyPrivate
  }
}

export default getActionOptions
