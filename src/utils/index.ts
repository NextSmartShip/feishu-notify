import * as core from '@actions/core'
import { networkInterfaces } from 'os'
import dayjs, { Dayjs, isDayjs } from 'dayjs'
import duration from 'dayjs/plugin/duration'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import isToday from 'dayjs/plugin/isToday'
import type {
  AssociatedPullRequestItem,
  FormatCommitsItem,
  FormatCommitsResult,
  PullCommitsByShaParams_keys_Type,
  ReqPullCommitsByShaParams_Type,
  RepositoryTagItem,
  ResApiFetchCommitsItem,
  WorkflowRunHeadCommit
} from '../types'
import {
  fetchCommit,
  fetchCompareCommits,
  fetchPullRequestCommits,
  fetchPullRequestsByCommit,
  fetchRepositoryTags
} from '../api'
import * as groupUrls from '../config'

const { extend } = dayjs
extend(isToday)
extend(utc)
extend(timezone)
extend(duration)

export function getPublicIP() {
  const ifaces = networkInterfaces()
  let en0

  for (const ifname of Object.keys(ifaces)) {
    let alias = 0
    const ifacesIfname = ifaces?.[ifname]
    if (ifacesIfname) {
      for (const iface of ifacesIfname) {
        if ('IPv4' !== iface.family || iface.internal !== false) {
          // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
          return
        }

        if (alias >= 1) {
          // this single interface has multiple ipv4 addresses
          en0 = iface.address
          console.log(`${ifname}:${alias}${iface.address}`)
        } else {
          // this interface has only one ipv4 adress
          console.log(ifname, iface.address)
          en0 = iface.address
        }
        ++alias
      }
    }
    return en0
  }
}

export const getCurrentDayjs = (isUtc?: boolean) => {
  const currentTime = isUtc ? dayjs() : dayjs().utc()
  return currentTime
}

export function handleDiffTime(_start: string, _end: Dayjs) {
  const start = dayjs(_start)
  const end = isDayjs(_end) ? _end : dayjs(_end)
  const diffDuration = dayjs.duration(end.diff(start))
  const hours = diffDuration.hours()
  const minutes = diffDuration.minutes()
  const seconds = diffDuration.seconds()
  return `🔧 ${hours ? `${hours}小时` : ''}${minutes}分钟${seconds}秒`
}

export function formatDisplayTime(milliseconds: number) {
  const dayjsDuration = dayjs(milliseconds)
  const result = dayjsDuration.format('mm分ss秒')
  return result
}

export const startWithHttpOrS = (str: string) =>
  str.startsWith('http') || str.startsWith('https')

export const getPreviewUrl = (isProd: boolean, projectName: string) => {
  if (isProd) return groupUrls.PROJECT_URL_MAPS[projectName]
  return groupUrls.PROJECT_TEST_URL_MAPS[projectName]
}

export const formatValue = (value: any) => {
  const params: Partial<ReqPullCommitsByShaParams_Type> = {}
  const keys = Object.keys(value)
  if (keys.length === 0) return []
  for (const key of keys) {
    params[key as PullCommitsByShaParams_keys_Type] = value[
      key as PullCommitsByShaParams_keys_Type
    ].replace(/\n/g, '')
  }
  return params
}

export const formatCommitsMsg = (commits: FormatCommitsItem[]) => {
  if (!commits?.length) return ''
  const nums = groupUrls.NumberList
  const msgsArr = commits.map((c, i) => {
    const {
      date: _date,
      message = '',
      html_url = '#',
      author = { login: '', html_url: '' }
    } = c
    // eslint-disable-next-line prefer-template
    const countNum = commits?.length > 1 ? `${nums[i] || `${i + 1}.`} ` : ''
    const link = html_url
    const text = message?.replace?.(/\n\n/g, ' ')
    const authorText = `${author?.login ? `(by: [${author.login}](${author.html_url}))` : ''}`
    const date = ` - 📅 <font color="grey">${_date}</font>`
    return `${countNum}[${text}](${link})${authorText}${date}`
  })
  return msgsArr.join('\n')
}

export const FORMAT_TIME_RULE = 'HH:mm:ss'
export const BASE_FORMAT_RULE = 'YYYY-MM-DD HH:mm:ss'
export const BASE_FORMAT_ZONE_RULE = 'YYYY-MM-DD HH:mm:ss[Z]'

export const formatDate = (t: string, rule: string = BASE_FORMAT_RULE) => {
  const mineZone = 'Asia/Shanghai'
  console.log('当前时区：', mineZone)
  const formatD = dayjs(t).tz(mineZone)
  const _isToday = formatD.isToday()
  return _isToday
    ? `今天 ${formatD.format(FORMAT_TIME_RULE)}`
    : formatD.format(rule)
}

const getCommitHtmlUrl = ({
  owner,
  repo,
  commit_sha
}: ReqPullCommitsByShaParams_Type) =>
  `https://github.com/${owner}/${repo}/commit/${commit_sha}`

const formatHeadCommit = (
  headCommit: WorkflowRunHeadCommit,
  params: ReqPullCommitsByShaParams_Type
): FormatCommitsItem => {
  const authorName =
    headCommit.author?.username || headCommit.author?.name || ''
  const commitDate = headCommit.author?.date || headCommit.timestamp || ''

  return {
    date: commitDate ? formatDate(commitDate) : '',
    message: headCommit.message || '',
    html_url: getCommitHtmlUrl(params),
    author: {
      login: authorName,
      html_url: ''
    }
  }
}

const formatApiCommit = (item: any): FormatCommitsItem => {
  return {
    date: item.commit?.author?.date
      ? formatDate(item.commit.author.date)
      : item.commit.author.date,
    message: item.commit.message,
    html_url: item.html_url,
    author: item?.author
  }
}

const isMergePullRequestCommit = (item: ResApiFetchCommitsItem) => {
  return (
    /^Merge pull request #\d+ from /.test(item.commit.message) &&
    (item.parents?.length || 0) > 1
  )
}

const getDisplayCompareCommits = (commits: ResApiFetchCommitsItem[]) => {
  const filteredCommits = commits.filter(
    item => !isMergePullRequestCommit(item)
  )
  return filteredCommits.length ? filteredCommits : commits
}

const emptyCommitsResult = (): FormatCommitsResult => ({
  commits: [],
  compareUrl: '',
  currentTag: '',
  previousTag: ''
})

const getTagNameFromRef = (ref?: string, refType?: string) => {
  if (refType !== 'tag' && !ref?.startsWith('refs/tags/')) return ''
  return ref?.replace(/^refs\/tags\//, '') || ''
}

const getPreviousTag = async (
  params: ReqPullCommitsByShaParams_Type,
  currentTag: string
) => {
  const per_page = 100
  let page = 1
  let foundCurrentTag = false
  let shouldFetchNextPage = true

  while (shouldFetchNextPage) {
    const tags: RepositoryTagItem[] = await fetchRepositoryTags({
      owner: params.owner,
      repo: params.repo,
      page,
      per_page
    })

    if (!tags.length) return ''

    if (foundCurrentTag) return tags[0]?.name || ''

    const currentIndex = tags.findIndex(tag => tag.name === currentTag)
    if (currentIndex !== -1) {
      const previousTag = tags[currentIndex + 1]?.name
      if (previousTag) return previousTag
      foundCurrentTag = true
    }

    if (tags.length < per_page) {
      shouldFetchNextPage = false
    } else {
      page += 1
    }
  }

  return ''
}

const getCompareCommits = async (
  params: ReqPullCommitsByShaParams_Type
): Promise<FormatCommitsResult> => {
  const currentTag = getTagNameFromRef(params.ref, params.refType)
  if (!currentTag) return emptyCommitsResult()

  const previousTag = await getPreviousTag(params, currentTag)
  if (!previousTag) return emptyCommitsResult()

  const compareResult = await fetchCompareCommits({
    owner: params.owner,
    repo: params.repo,
    base: previousTag,
    head: currentTag
  })
  const displayCommits = getDisplayCompareCommits(compareResult.commits)

  return {
    commits: displayCommits.map(formatApiCommit),
    compareUrl: compareResult.html_url,
    currentTag,
    previousTag
  }
}

const getPullRequestCommits = async (
  params: ReqPullCommitsByShaParams_Type
): Promise<FormatCommitsResult> => {
  const pullRequests: AssociatedPullRequestItem[] =
    await fetchPullRequestsByCommit(params)
  const pullRequest =
    pullRequests.find(item => item.merge_commit_sha === params.commit_sha) ||
    pullRequests.find(item => item.merged_at) ||
    pullRequests[0]
  if (!pullRequest) return emptyCommitsResult()

  const per_page = 100
  let page = 1
  const commits: ResApiFetchCommitsItem[] = []
  let shouldFetchNextPage = true

  while (shouldFetchNextPage) {
    const pageCommits = await fetchPullRequestCommits({
      owner: params.owner,
      repo: params.repo,
      pullNumber: pullRequest.number,
      page,
      per_page
    })
    commits.push(...pageCommits)
    shouldFetchNextPage = pageCommits.length === per_page
    page += 1
  }

  return {
    ...emptyCommitsResult(),
    commits: commits.map(formatApiCommit)
  }
}

const getSingleCommit = async (
  params: ReqPullCommitsByShaParams_Type
): Promise<FormatCommitsResult> => {
  if (params.head_commit?.message) {
    return {
      ...emptyCommitsResult(),
      commits: [formatHeadCommit(params.head_commit, params)]
    }
  }

  const commits = await fetchCommit(params)
  if (!commits?.length) return emptyCommitsResult()
  console.log('格式化commit author: ', JSON.stringify(commits))

  return {
    ...emptyCommitsResult(),
    commits: commits.map(formatApiCommit)
  }
}

export const getCommits = async (
  _params: ReqPullCommitsByShaParams_Type
): Promise<FormatCommitsResult> => {
  try {
    let compareCommits = emptyCommitsResult()
    try {
      compareCommits = await getCompareCommits(_params)
    } catch (error) {
      compareCommits = emptyCommitsResult()
    }
    if (compareCommits.commits.length) return compareCommits

    if (!getTagNameFromRef(_params.ref, _params.refType)) {
      try {
        const pullRequestCommits = await getPullRequestCommits(_params)
        if (pullRequestCommits.commits.length) return pullRequestCommits
      } catch (error) {
        // 关联 PR 查询失败时继续使用当前 head commit，保证通知仍可发送
      }
    }

    return await getSingleCommit(_params)
  } catch (error) {
    return emptyCommitsResult()
  }
}

export const isProd = process.env.NODE_ENV === 'production'

// 返回是否是周末
export const isWeekend = () => {
  const day = new Date().getDay()
  return day === 6 || day === 0
}

/**
 * @description 模拟等待时间
 * @param time 等待时间
 * @returns void
 */
export const stop = (time: number) => {
  return new Promise<void>(res => {
    const timer = setTimeout(() => {
      clearTimeout(timer)
      res()
    }, time)
  })
}

export const getToken = () => {
  const token = core.getInput('token')
  return token
}
