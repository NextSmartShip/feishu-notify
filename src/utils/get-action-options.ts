import * as core from '@actions/core'
import * as github from '@actions/github'
import type { PushEvent } from '@octokit/webhooks-definitions/schema'
// import type { UserDefinedOptions } from '../type'

const getActionOptions = () => {
  const token = core.getInput('token')
  const token2 = core.getInput('token2')
  const username = core.getInput('username')
  // getBooleanInput 其实本质上就是一种 parseBoolean(core.getInput('key'))
  // const motto = core.getBooleanInput('motto')
  // const filepath = core.getInput('filepath')
  // const title = core.getInput('title')
  // const includeFork = core.getBooleanInput('includeFork')
  // const includeArchived = core.getBooleanInput('includeArchived')
  // const onlyPrivate = core.getBooleanInput('onlyPrivate')
  const payload = github.context.payload as PushEvent
  const owner = payload.organization?.login
  const repo = payload.repository?.name
  const run_id = github.context.runId

  core.info(`当前事件(token、token2)：${token}, ${token2}`)
  core.info(`当前事件：${github.context.eventName}`)
  core.info(`当前事件22：${JSON.stringify(github)}`)
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
