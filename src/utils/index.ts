import * as core from '@actions/core'
import { networkInterfaces } from 'os'
import dayjs, { Dayjs, isDayjs } from 'dayjs'
import duration from 'dayjs/plugin/duration'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import type {
  FormatCommitsItem,
  PullCommitsByShaParams_keys_Type,
  ReqPullCommitsByShaParams_Type
} from '../type'
import {
  fetchCommit,
  fetchCommits,
  fetchCommitsByCurrentCommitSha
} from '../api'
import * as groupUrls from '../config'
const { extend } = dayjs
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
  const minutes = diffDuration.minutes()
  const seconds = diffDuration.seconds()
  return `🔧 ${minutes}分钟${seconds}秒`
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
  let msgs = ''
  for (const {
    message = '',
    html_url = '#',
    author = { login: '', html_url: '' }
  } of commits) {
    msgs += `\n* [${message?.replace?.(/^.*?\n\n/, '')}](${html_url}) ${author?.login ? `(by: [${author.login}](${author.html_url}))` : ''}`
  }
  return msgs
}

export const getCommits = async (
  _params: ReqPullCommitsByShaParams_Type
): Promise<FormatCommitsItem[]> => {
  try {
    const params = formatValue(_params)
    const result = await fetchCommitsByCurrentCommitSha(
      params as ReqPullCommitsByShaParams_Type
    )

    const commit_url = result[0]?.commits_url
    const commits = result?.length
      ? await fetchCommits(commit_url)
      : await fetchCommit(_params)
    if (!commits?.length) return []
    console.log('格式化commit author: ', JSON.stringify(commits))

    const formatCommits = commits.map(item => {
      return {
        message: item.commit.message,
        html_url: item.html_url,
        author: item?.author
      }
    })
    return formatCommits
  } catch (error) {
    return []
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
