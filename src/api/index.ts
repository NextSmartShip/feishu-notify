import axios from './request'
import { BASE_PARAMS, botUrls } from '../config'
import type {
  CommitKeysItemType,
  JobType,
  ReqFetchCommitParams_Type,
  ReqPullCommitsByShaParams_Type,
  ResApiFetchCommitsItem
} from '../type'
import { isProd, isWeekend } from '../utils'

/**
 *
 * @param {object} msg 飞书接收到的消息内容
 * @returns {Promise}
 */
export async function fetchFeishuWebhook(
  body: any,
  toBigGroup = false
): Promise<any> {
  const baseUrl = toBigGroup
    ? botUrls.ProdEnvGroupBot
    : isWeekend()
      ? botUrls.FrontEndOldManGroupBot
      : botUrls.TestEnvGroupBot
  const options = {
    method: 'POST',
    url: baseUrl,
    data: body,
    json: true // Automatically stringifies the body to JSON
  }
  const result = await axios(options)
  return result
}
/**
 *
 * @param {String} body.owner
 * @param {String} body.repo
 * @param {String} body.commit_sha
 *
 * @description 获取当前commit_sha的所有commit信息
 */
export async function fetchCommitsByCurrentCommitSha(
  body: ReqPullCommitsByShaParams_Type
): Promise<CommitKeysItemType[]> {
  try {
    const baseUrl = `/repos/${body.owner}/${body.repo}/commits/${body.commit_sha}/pulls`
    const url = baseUrl
    const params = {
      method: 'GET',
      url,
      ...BASE_PARAMS
    }

    // 将params.url转为json请求数据:
    return await axios(params)
  } catch (error) {
    console.log('emit by getCommitsByCurrentCommitSha error: ', error)
    return []
  }
}
export async function fetchCommits(
  url: string
): Promise<ResApiFetchCommitsItem[]> {
  return await axios({
    method: 'GET',
    url,
    ...BASE_PARAMS
  })
}
export async function fetchCommit(
  body: ReqFetchCommitParams_Type
): Promise<ResApiFetchCommitsItem[]> {
  const url = `/repos/${body.owner}/${body.repo}/commits/${body.commit_sha}`
  const result = await axios<any, Promise<ResApiFetchCommitsItem>>({
    method: 'GET',
    url,
    ...BASE_PARAMS
  })
  return [result]
}
export async function fetchJobHtmlUrl(url: string): Promise<JobType> {
  return await axios({
    method: 'GET',
    url,
    ...BASE_PARAMS
  })
}
export async function fetchWorkFlow(params: {
  owner: string
  repo: string
  run_id: number
}): Promise<ResApiFetchCommitsItem[]> {
  return await axios.get(
    `/repos/${params.owner}/${params.repo}/actions/runs/${params.run_id}`
  )
}
