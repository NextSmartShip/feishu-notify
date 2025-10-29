import axios from './request'
import { BASE_PARAMS, botUrls } from '../config'
import type {
  CommitKeysItemType,
  EnvironmentType,
  JobType,
  ReqFetchCommitParams_Type,
  ReqPullCommitsByShaParams_Type,
  ResApiFetchCommitsItem,
  ResApiFetchWorkFlowItem,
  WorkFlowDuration
} from '../type'
import { isWeekend } from '../utils'

/**
 * 获取目标飞书群组 URL
 * @param {string} environment 环境类型: 'local' | 'test' | 'production'
 * @param {boolean} workflowSuccess 工作流是否成功
 * @returns {object} 包含 url 和 description 的对象
 */
function getTargetBotUrl(
  environment: EnvironmentType,
  workflowSuccess: boolean
): { url: string; description: string } {
  // 环境策略映射
  const envStrategies: Record<
    EnvironmentType,
    { url: string; description: string }
  > = {
    local: {
      url: botUrls.FrontEndOldManGroupBot,
      description: '🧪 本地环境：消息将发送到前端老人群'
    },
    test: {
      url: botUrls.TestEnvGroupBot,
      description: '🔧 测试环境：消息将发送到测试群'
    },
    production: {
      url: workflowSuccess
        ? botUrls.ProdEnvGroupBot
        : isWeekend()
          ? botUrls.FrontEndOldManGroupBot
          : botUrls.TestEnvGroupBot,
      description: workflowSuccess
        ? '� 生产环境：消息将发送到生产构建通知群'
        : isWeekend()
          ? '📅 生产环境（周末）：消息将发送到前端老人群'
          : '🔧 生产环境（工作日）：消息将发送到测试群'
    }
  }

  return envStrategies[environment]
}

/**
 * 发送消息到飞书群组
 * @param {object} body 飞书接收到的消息内容（卡片消息体）
 * @param {string} environment 环境类型: 'local' | 'test' | 'production'
 * @param {boolean} workflowSuccess 工作流是否成功（默认 true）
 * @returns {Promise}
 */
export async function fetchFeishuWebhook(
  body: any,
  environment: EnvironmentType = 'production',
  workflowSuccess = true
): Promise<any> {
  const { url, description } = getTargetBotUrl(environment, workflowSuccess)

  console.log(description)

  const requestOptions = {
    method: 'POST',
    url,
    data: body,
    json: true
  }

  return await axios(requestOptions)
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
  run_id: number | string
}): Promise<ResApiFetchWorkFlowItem> {
  return await axios.get(
    `/repos/${params.owner}/${params.repo}/actions/runs/${params.run_id}`
  )
}
export async function fetchWorkFlowDuration(params: {
  owner: string
  repo: string
  run_id: number
}): Promise<WorkFlowDuration> {
  return await axios.get(
    `/repos/${params.owner}/${params.repo}/actions/runs/${params.run_id}/timing`
  )
}
