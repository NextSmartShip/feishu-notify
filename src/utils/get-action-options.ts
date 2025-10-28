import * as core from '@actions/core'
import * as github from '@actions/github'
import type { PushEvent } from '@octokit/webhooks-definitions/schema'
// import type { UserDefinedOptions } from '../type'

const getActionOptions = () => {
  const token = core.getInput('token')
  const username = core.getInput('username')
  const environment = core.getInput('environment') || 'test'
  // getBooleanInput 其实本质上就是一种 parseBoolean(core.getInput('key'))
  const payload = github.context.payload as PushEvent
  const owner = payload.organization?.login
  const repo = payload.repository?.name
  const run_id = github.context.runId

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
