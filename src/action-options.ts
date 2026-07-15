import * as core from '@actions/core'
import * as github from '@actions/github'
import type { PushEvent } from '@octokit/webhooks-definitions/schema'
import type { LogicalProject, TargetGroup } from './types'

const normalizeTargetGroup = (value: string): TargetGroup => {
  if (!value || value === 'auto') return 'auto'
  if (value === 'personal') return 'personal'
  throw new Error('target-group 仅支持 auto 或 personal')
}

const normalizeProject = (value: string): LogicalProject => {
  if (!value || value === 'auto') return 'auto'
  if (value === 'oms' || value === 'wms' || value === 'pda') return value
  throw new Error('project 仅支持 auto、oms、wms 或 pda')
}

const getActionOptions = () => {
  const token = core.getInput('token')
  const username = core.getInput('username')
  const targetGroup = normalizeTargetGroup(core.getInput('target-group'))
  const project = normalizeProject(core.getInput('project'))
  const workflowRunJson = core.getInput('workflow-run-json')
  const ref = github.context.ref
  const refType = ref.startsWith('refs/tags/')
    ? 'tag'
    : ref.startsWith('refs/heads/')
      ? 'branch'
      : ''
  // getBooleanInput 其实本质上就是一种 parseBoolean(core.getInput('key'))
  const payload = github.context.payload as PushEvent
  const owner = payload.organization?.login
  const repo = payload.repository?.name
  const run_id = github.context.runId

  console.log(
    `当前事件(eventName、run_id)：${github.context.eventName},run_id: ${run_id}`
  )
  if (github.context.eventName === 'push') {
    const pushPayload = github.context.payload
    core.info(`The head commit is: ${pushPayload.head_commit}`)
  }
  return {
    token,
    username,
    payload,
    owner,
    repo,
    run_id,
    targetGroup,
    project,
    workflowRunJson,
    ref,
    refType,
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
