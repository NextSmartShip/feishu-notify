import * as core from '@actions/core'
import * as github from '@actions/github'
import type { PushEvent } from '@octokit/webhooks-definitions/schema'
import { Environment } from '../config'
import { fetchWorkFlow } from '../api'

const getActionOptions = async () => {
  const token = core.getInput('token')
  const username = core.getInput('username')
  const environment = core.getInput('environment') || Environment.Test

  // 判断是否在 GitHub Actions 环境中
  const isGitHubActions = !!github.context.payload.repository
  let payload = isGitHubActions ? (github.context.payload as PushEvent) : null

  // 获取 owner、repo、run_id（优先使用 GitHub 自动注入的值）
  let owner =
    payload?.organization?.login ||
    payload?.repository?.owner?.login ||
    core.getInput('owner') ||
    github.context.repo.owner
  let repo =
    payload?.repository?.name ||
    core.getInput('repo') ||
    github.context.repo.repo
  const run_id = github.context.runId || core.getInput('run_id') || Date.now()

  console.log(`运行环境: ${isGitHubActions ? 'GitHub Actions' : '本地环境'}`)
  console.log(
    `参数信息 - owner: ${owner}, repo: ${repo}, run_id: ${run_id}, environment: ${environment}`
  )

  // 本地环境：通过 API 获取 workflow 数据
  if (!isGitHubActions && owner && repo && typeof run_id === 'string') {
    try {
      core.info('正在通过 GitHub API 获取 workflow 数据...')
      const workflowData = (await fetchWorkFlow({ owner, repo, run_id })) as any

      if (workflowData) {
        owner = workflowData.repository?.owner?.login || owner
        repo = workflowData.repository?.name || repo

        // 构造 payload 对象
        payload = {
          repository: workflowData.repository,
          organization:
            workflowData.repository?.owner?.type === 'Organization'
              ? { login: workflowData.repository.owner.login }
              : undefined,
          head_commit: workflowData.head_commit,
          sender: workflowData.triggering_actor
        } as any

        core.info(
          `✓ 成功获取 workflow: ${workflowData.name} (${workflowData.status})`
        )
      }
    } catch (error) {
      core.warning(`获取 workflow 数据失败: ${error}`)
    }
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
  }
}

export default getActionOptions
