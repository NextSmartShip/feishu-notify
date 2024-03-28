import axios from './request'
import Push from './Push'
import { stop } from '..//utils'

// import * as github from '@actions/github'
// 使用action的仓库名

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
  return axios(config)
  // if (res.data.status !== 'completed') {
  //   await stop(3000)
  //   return toFetchWorkFlow(config)
  // }
  // return res
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
  try {
    const config = {
      method: 'get',
      url: `https://api.github.com/repos/${owner}/${repo}/actions/runs/${run_id}`
    }
    console.log('请求前检查参数：', JSON.stringify(config))

    await stop(3000)
    const res = await toFetchWorkFlow(config)
    // if (res.data.status !== 'completed')
    // .then(response => {
    //   console.log(JSON.stringify(response.data))
    // })
    // .catch(error => {
    //   console.log(error)
    // })
    console.log('查看请求返回值.：', res)
    const payload = res.data
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
