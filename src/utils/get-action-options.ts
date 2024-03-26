import * as core from '@actions/core'
import github from '@actions/github'
// import { PushEvent } from '@octokit/webhooks-definitions/schema';
// import type { UserDefinedOptions } from '../type'

const getActionOptions = () => {
  const token = core.getInput('token')
  const username = core.getInput('username')
  // getBooleanInput 其实本质上就是一种 parseBoolean(core.getInput('key'))
  // const motto = core.getBooleanInput('motto')
  // const filepath = core.getInput('filepath')
  // const title = core.getInput('title')
  // const includeFork = core.getBooleanInput('includeFork')
  // const includeArchived = core.getBooleanInput('includeArchived')
  // const onlyPrivate = core.getBooleanInput('onlyPrivate')

  core.info(`当前事件：${github.context.eventName}`)
  if (github.context.eventName === 'push') {
    const pushPayload = github.context.payload
    core.info(`The head commit is: ${pushPayload.head_commit}`)
  }
  return {
    token,
    username
    // motto,
    // filepath,
    // title,
    // includeFork,
    // includeArchived,
    // onlyPrivate
  }
}

export default getActionOptions
