import axios from './request'
import { BASE_PARAMS, botUrls } from '../config'
import type {
  AssociatedPullRequestItem,
  JobType,
  CompareCommitsResponse,
  FetchCompareCommitsParams,
  FetchPullRequestCommitsParams,
  FetchRepositoryTagsParams,
  RepositoryTagItem,
  ReqFetchCommitParams_Type,
  ResApiFetchCommitsItem,
  TargetGroup,
  WorkFlowDuration
} from '../types'
import { isWeekend } from '../utils'

interface FetchFeishuWebhookOptions {
  targetGroup?: TargetGroup
  toBigGroup?: boolean
}

/**
 *
 * @param {object} msg 飞书接收到的消息内容
 * @returns {Promise}
 */
export async function fetchFeishuWebhook(
  body: any,
  webhookOptions: FetchFeishuWebhookOptions | boolean = {}
): Promise<any> {
  const normalizedOptions =
    typeof webhookOptions === 'boolean'
      ? { toBigGroup: webhookOptions }
      : webhookOptions
  const { targetGroup = 'auto', toBigGroup = false } = normalizedOptions
  // const baseUrl = botUrls.FrontEndOldManGroupBot
  const baseUrl =
    targetGroup === 'personal'
      ? botUrls.FrontEndOldManGroupBot
      : toBigGroup
        ? botUrls.TestEnvGroupBot
        : isWeekend()
          ? botUrls.FrontEndOldManGroupBot
          : botUrls.TestEnvGroupBot
  const requestOptions = {
    method: 'POST',
    url: baseUrl,
    // url: botUrls.FrontEndOldManGroupBot,
    data: body,
    json: true // Automatically stringifies the body to JSON
  }
  const result = await axios(requestOptions)
  return result
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
export async function fetchPullRequestsByCommit(
  body: ReqFetchCommitParams_Type
): Promise<AssociatedPullRequestItem[]> {
  return await axios({
    method: 'GET',
    url: `/repos/${body.owner}/${body.repo}/commits/${body.commit_sha}/pulls`,
    ...BASE_PARAMS
  })
}
export async function fetchPullRequestCommits({
  owner,
  repo,
  pullNumber,
  page,
  per_page
}: FetchPullRequestCommitsParams): Promise<ResApiFetchCommitsItem[]> {
  return await axios({
    method: 'GET',
    url: `/repos/${owner}/${repo}/pulls/${pullNumber}/commits`,
    params: {
      page,
      per_page
    },
    ...BASE_PARAMS
  })
}
export async function fetchRepositoryTags({
  owner,
  repo,
  page,
  per_page
}: FetchRepositoryTagsParams): Promise<RepositoryTagItem[]> {
  const url = `/repos/${owner}/${repo}/tags`
  return await axios({
    method: 'GET',
    url,
    params: {
      page,
      per_page
    },
    ...BASE_PARAMS
  })
}
export async function fetchCompareCommits({
  owner,
  repo,
  base,
  head
}: FetchCompareCommitsParams): Promise<CompareCommitsResponse> {
  const baseRef = encodeURIComponent(base)
  const headRef = encodeURIComponent(head)
  return await axios({
    method: 'GET',
    url: `/repos/${owner}/${repo}/compare/${baseRef}...${headRef}`,
    ...BASE_PARAMS
  })
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
export async function fetchWorkFlowDuration(params: {
  owner: string
  repo: string
  run_id: number
}): Promise<WorkFlowDuration> {
  return await axios.get(
    `/repos/${params.owner}/${params.repo}/actions/runs/${params.run_id}/timing`
  )
}
