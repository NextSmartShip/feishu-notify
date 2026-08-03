import { fetchFeishuWebhook, fetchJobHtmlUrl } from '.'
import * as groupUrls from '../config'
import {
  formatCommitsMsg,
  getCommits,
  getCurrentDayjs,
  getPreviewUrl,
  handleDiffTime
} from '../utils'
import type {
  ActionRefContext,
  JobItemType,
  LogicalProject,
  TargetGroup
} from '../types'

interface PushOptions extends ActionRefContext {
  targetGroup?: TargetGroup
  project?: LogicalProject
}

const failureConclusions = [
  'failure',
  'cancelled',
  'timed_out',
  'action_required'
]

const getWorkflowRunSuccess = (content: any, jobs: JobItemType[]) => {
  const completedJobs = jobs.filter(job => job.status === 'completed')
  const hasFailedJob = completedJobs.some(job =>
    failureConclusions.includes(job.conclusion || '')
  )

  if (hasFailedJob) return false
  if (content?.conclusion === 'success') return true

  // 当通知 action 是唯一 job 的最后一步时，GitHub 仍会返回
  // status=in_progress、conclusion=null。此时 action 能执行到这里，说明前置步骤
  // 均已成功，不能因为 job 尚未完成而误报失败。多 job 工作流仍需等待其他
  // job 完成，避免提前报告成功。
  if (
    jobs.length === 1 &&
    completedJobs.length === 0 &&
    jobs[0]?.status === 'in_progress'
  ) {
    return true
  }

  return (
    completedJobs.length > 0 &&
    completedJobs.every(job => job.conclusion === 'success')
  )
}

const getNotifyUsers = () => groupUrls.notifyUserList

export default async function push(
  _content: any,
  { targetGroup = 'auto', project = 'auto', ref, refType }: PushOptions = {}
) {
  try {
    const content =
      (typeof _content === 'string' ? JSON.parse(_content) : _content) || {}
    const run_id = content.id
    // 事件钩子：
    // 最新一条提交对象：
    const head_commit = content.head_commit
    // 最新一条提交id：
    const head_sha = content.head_sha
    // 构建的分支：
    const branch = content.head_branch
    const actionRef = ref || content.ref
    const actionRefType = refType || content.ref_type || content.refType
    const isTagRef =
      actionRefType === 'tag' || actionRef?.startsWith?.('refs/tags/')
    const repository = content?.repository
    const projectKey = project === 'auto' ? repository?.name : project
    // 此次action是Prod还是Test:
    const isProd = isTagRef || content.event === 'release' || branch === 'main'
    console.log('by Push...: ', content)
    // 构建的详情页 (当workflow_run不存在时，html_url无法找到)：
    const jobRes = Array.isArray(content.jobs)
      ? { jobs: content.jobs }
      : await fetchJobHtmlUrl(content.jobs_url)
    const { jobs = [] } = jobRes
    const workflowRunSuccess = getWorkflowRunSuccess(content, jobs)

    const buildDetailPageUrl = jobs?.[0]?.html_url || content.html_url
    // 构建的title：
    const buildDetailMsg = head_commit?.message?.replace?.(/^.*?\n\n/, '')

    // 项目名称：
    const cnName = groupUrls.projectNameMaps[projectKey] || 'NSS-项目'
    // // 当前hook操作人
    const operator = content?.triggering_actor?.login
    // // 当前hook操作人
    const operatorHtmlUrl = content?.triggering_actor?.html_url
    // 代码推送人-姓名：
    const name = head_commit?.author?.name
    // 代码推送人-邮箱：
    const email = head_commit?.author?.email
    // 构建环境：
    const buildEnv = isProd ? '生产环境' : '测试环境'

    const commits = head_sha
      ? await getCommits({
          owner: repository?.owner?.login,
          repo: repository?.name,
          commit_sha: head_sha,
          head_commit,
          ref: isTagRef ? actionRef : undefined,
          refType: isTagRef ? actionRefType : undefined
        })
      : {
          commits: [],
          compareUrl: '',
          currentTag: '',
          previousTag: ''
        }

    const config = {
      wide_screen_mode: true
    }
    const header = {
      template: workflowRunSuccess ? (isProd ? 'green' : 'orange') : 'red',
      title: {
        tag: 'plain_text',
        content: `${cnName} 构建情况（${buildEnv}）：${
          workflowRunSuccess ? '成功' : '失败'
        }`
      }
    }
    const previewUrl = getPreviewUrl(isProd, projectKey) || '#'
    const baseMsg = `\n* [${buildDetailMsg}](${buildDetailPageUrl})`
    const compareMsg = commits.compareUrl
      ? `**Compare：** [${commits.previousTag}...${commits.currentTag}](${commits.compareUrl})\n`
      : ''
    const commitMsgs = commits.commits.length
      ? formatCommitsMsg(commits.commits)
      : baseMsg
    console.log('commitMsgs: ', commitMsgs)

    // duration:
    // const durationInfo = await fetchWorkFlowDuration({
    //   owner,
    //   repo: repository.name,
    //   run_id
    // })
    const currentDayjsTime = getCurrentDayjs(true)
    const displayTime = handleDiffTime(content.run_started_at, currentDayjsTime)
    const notifyUsers = getNotifyUsers()
    for (const b of notifyUsers) {
      console.log('baseNotifyUsers: ', b)
    }

    const elements = [
      {
        tag: 'div',
        text: {
          tag: 'lark_md',
          // content: '<at id=all></at>'
          content: notifyUsers
            .map(b => `<at id=${b.feishu_open_id}></at>`)
            .join(' ')
        }
      },
      {
        tag: 'markdown',
        content: `[[${repository?.full_name}]点击查看构建详情](${buildDetailPageUrl}) **#${run_id}**`
      },
      // 耗时
      {
        tag: 'column_set',
        flex_mode: 'none',
        background_style: 'default',
        columns: [
          {
            tag: 'column',
            width: 'weighted',
            weight: 1,
            vertical_align: 'top',
            elements: [
              {
                tag: 'markdown',
                content: `**构建分支：**${branch || actionRef || '-'}`
              }
            ]
          },
          {
            tag: 'column',
            width: 'weighted',
            weight: 1,
            vertical_align: 'top',
            elements: [
              {
                tag: 'markdown',
                content: `**耗时：**${displayTime}`
              }
            ]
          }
        ]
      },
      {
        tag: 'column_set',
        flex_mode: 'none',
        background_style: 'default',
        columns: [
          {
            tag: 'column',
            width: 'weighted',
            weight: 1,
            vertical_align: 'top',
            elements: [
              {
                tag: 'markdown',
                // "content": "**操作人：** \at所有人<at id=all></at> "
                content: `**推送人：**[${name}](${email}) `
              }
            ]
          },
          {
            tag: 'column',
            width: 'weighted',
            weight: 1,
            vertical_align: 'bottom',
            elements: [
              {
                tag: 'markdown',
                content: `**操作人：**[${operator}](${operatorHtmlUrl})`
              }
            ]
          }
        ]
      },
      {
        tag: 'column_set',
        flex_mode: 'none',
        background_style: 'default',
        columns: [
          {
            tag: 'column',
            width: 'weighted',
            weight: 1,
            vertical_align: 'top',
            elements: [
              {
                tag: 'img',
                mode: 'medium',
                alt: {
                  content: '',
                  tag: 'plain_text'
                },
                img_key: workflowRunSuccess
                  ? groupUrls.SuccessImgKey
                  : groupUrls.FailImgKey,
                custom_width: 100,
                compact_width: true
              }
            ]
          }
        ]
      },
      {
        tag: 'column_set',
        flex_mode: 'none',
        background_style: 'grey',
        columns: [
          {
            tag: 'column',
            width: 'weighted',
            weight: 1,
            vertical_align: 'top',
            elements: [
              {
                tag: 'markdown',
                text_align: 'left',
                content: `**Message [(构建链接)](${buildDetailPageUrl})：** \n${compareMsg}${commitMsgs}`
              }
            ]
          }
        ]
      }
    ]
    if (previewUrl && previewUrl !== '#') {
      elements.push({
        tag: 'column_set',
        flex_mode: 'none',
        background_style: 'grey',
        columns: [
          {
            tag: 'column',
            width: 'weighted',
            weight: 1,
            vertical_align: 'top',
            elements: [
              {
                tag: 'markdown',
                text_align: 'left',
                content: `**预览地址：** [${previewUrl}](${previewUrl})`
              }
            ]
          }
        ]
      })
    }
    const feishu_body = {
      msg_type: 'interactive',
      card: {
        config,
        header,
        elements
      }
    }
    console.log('发送飞书请求前参数：', JSON.stringify(feishu_body))

    await fetchFeishuWebhook(feishu_body, {
      targetGroup,
      toBigGroup: workflowRunSuccess ? isProd : false
    })
  } catch (error) {
    console.log('出错啦:', error)
  }
}
