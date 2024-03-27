import axios from 'axios'
import { headers, webhookToken } from '../config'

// import * as github from '@actions/github'
import { Octokit } from '@octokit/core'
// 使用action的仓库名
// token 为 the repo PAT or GITHUB_TOKEN
const octokit = new Octokit({
  auth: webhookToken,
  request: {
    fetch: axios
  }
})
// const octokit = github.getOctokit(webhookToken)

interface Props {
  owner?: string
  repo?: string
  run_id?: number
}
const FetchWorkFlow = async ({
  owner = 'NextSmartShip',
  repo = '',
  run_id = -1,
  ...props
}: Props) => {
  return await octokit.request(
    `GET /repos/{owner}/{repo}/actions/runs/{run_id}`,
    {
      owner,
      repo,
      run_id,
      headers
    }
  )
}

export default FetchWorkFlow
