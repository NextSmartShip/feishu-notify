import axios from 'axios'
import * as core from '@actions/core'
import Push from './Push'
import { stop } from '..//utils'

// import * as github from '@actions/github'
// 使用action的仓库名
const token = core.getInput('token')
console.log('auth之前查看abctok2en：', JSON.stringify(token))

// token 为 the repo PAT or GITHUB_TOKEN
// const octokit = new Octokit({
//   auth: token,
//   userAgent: 'https://api.github.com/repos'
//   // request: {
//   //   fetch: axios
//   // }
// })
// const octokit = github.getOctokit(webhookToken)

const toFetchWorkFlow = async (config: any): Promise<any> => {
  const res = await axios.request(config)
  // if (res.data.status !== 'completed') {
  //   await stop(3000)
  //   return toFetchWorkFlow(config)
  // }
  return res
}

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
  // const params = {
  //   owner,
  //   repo,
  //   run_id,
  //   headers: {
  //     ...headers,
  //     authorization: `token ${github_token}`
  //     // Authorization: `Bearer ${github_token}`
  //   }
  // }
  // try {
  //   console.log(
  //     '检查环境变量1：',
  //     process.env.TOKEN,
  //     JSON.stringify(process.env)
  //   )
  //   console.log('请求前检查参数：', JSON.stringify(params))
  // } catch (error) {
  //   console.log('error:', error)
  // }

  try {
    // const res = await octokit.request(
    //   `GET /repos/{owner}/{repo}/actions/runs/{run_id}`,
    //   {
    //     ...params
    //   }
    // )
    const config = {
      method: 'get',
      url: `https://api.github.com/repos/${owner}/${repo}/actions/runs/${run_id}`,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `token ${github_token}`,
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
    console.log('请求前检查参数：', JSON.stringify(config))

    const res = await toFetchWorkFlow(config)
    // if (res.data.status !== 'completed')
    // .then(response => {
    //   console.log(JSON.stringify(response.data))
    // })
    // .catch(error => {
    //   console.log(error)
    // })
    // console.log('查看请求返回值.：', res)
    const payload = res.data
    await stop(3000)
    // console.log('查看请求返回值2.：', payload)
    await Push({
      request: {
        body: {
          payload
        }
      }
    })
  } catch (error) {
    console.log('查看请求by错误时：', error)
  }
}

export default FetchWorkFlow
