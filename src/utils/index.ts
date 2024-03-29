import * as core from '@actions/core'
import { networkInterfaces } from 'os'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
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

export function handleDiffTime(_start: string, _end: string) {
  const start = dayjs(_start)
  const end = dayjs(_end)
  const diffDuration = dayjs.duration(end.diff(start))
  const minutes = Math.floor(diffDuration.asMinutes())
  const seconds = diffDuration.asSeconds() % 60
  return `🔧 ${minutes}分钟${seconds}秒`
}
export function formatDisplayTime(milliseconds: number) {
  const dayjsDuration = dayjs(milliseconds)
  const result = dayjsDuration.format('mm分ss秒')
  return result
}
export const startWithHttpOrS = (str: string) =>
  str.startsWith('http') || str.startsWith('https')

export const getPreviewUrl = (workflow_run: any, project: any) => {
  if (workflow_run.name?.indexOf?.('production') !== -1)
    return groupUrls.PROJECT_URL_MAPS[project?.name]
  return groupUrls.PROJECT_TEST_URL_MAPS[project?.name]
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
  // `* [${buildDetailMsg}](${buildDetailPageUrl})`;
  for (const { message = '', html_url = '#' } of commits) {
    msgs += `\n* [${message.replace(/\n/g, '')}](${html_url})`
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
    const formatCommits = commits.map(item => {
      return {
        message: item.commit.message,
        html_url: item.html_url
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
