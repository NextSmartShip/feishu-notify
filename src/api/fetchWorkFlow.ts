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
  github_token?: string
}
const FetchWorkFlow = async ({
  owner = 'NextSmartShip',
  repo = '',
  run_id = -1,
  github_token,
  ...props
}: Props) => {
  console.log('请求前检查参数：', owner, repo, run_id, github_token)

  return await octokit.request(
    `GET /repos/{owner}/{repo}/actions/runs/{run_id}`,
    {
      owner,
      repo,
      run_id,
      headers: {
        ...headers,
        Authorization: `Bearer ${github_token}`
      }
    }
  )
}

export default FetchWorkFlow
