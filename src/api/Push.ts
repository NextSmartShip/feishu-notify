import { fetchFeishuWebhook, fetchJobHtmlUrl, fetchWorkFlowDuration } from '.'
import * as groupUrls from '../config'
import {
  formatCommitsMsg,
  formatDisplayTime,
  getCommits,
  getPreviewUrl
} from '../utils'

type BodyType = { payload: Record<string, any> }

const canSendMsgToFeishu = (content: any) => {
  if (!content || !content.repository || !content.jobs_url) return false
  return true
}

export default async function push(_content: any) {
  try {
    const content =
      (typeof _content === 'string' ? JSON.parse(_content) : _content) || {}
    const run_id = content.id
    // 事件钩子：
    const status = content?.status || ''
    // 代表是否能发feishu：
    const canSendMsg = status === 'completed'
    // 构建结果（成功or失败or手动取消）
    const conclusion = content.conclusion
    // 否则，代表是手动触发（暂时使用）：
    console.log('by Push...: ', content)

    // 最新一条提交对象：
    const head_commit = content.head_commit
    // 最新一条提交id：
    const head_sha = content.head_sha
    // 构建的分支：
    const branch = content.head_branch
    const repository = content?.repository
    const owner = repository?.owner?.login
    const workflowRunSuccess = canSendMsgToFeishu(content)
    // 构建的详情页 (当workflow_run不存在时，html_url无法找到)：
    const jobRes = await fetchJobHtmlUrl(content.jobs_url)
    const durationInfo = await fetchWorkFlowDuration({
      owner,
      repo: repository.name,
      run_id
    })
    const { jobs = [] } = jobRes

    const buildDetailPageUrl = jobs?.[0]?.html_url || content.html_url
    // 构建的title：
    const buildDetailMsg = head_commit?.message?.replace?.(/^.*?\n\n/, '')

    // 项目名称：
    const cnName = groupUrls.projectNameMaps[repository?.name] || 'NSS-项目'
    // // 当前hook操作人
    const operator = content?.triggering_actor?.login
    // 代码推送人-姓名：
    const name = head_commit?.author?.name
    // 代码推送人-邮箱：
    const email = head_commit?.author?.email
    // 此次action是Prod还是Test:
    const isProd = content.event === 'release' || branch === 'master'
    // 构建环境：
    const buildEnv = isProd ? '生产环境' : '测试环境'

    const commits = await getCommits({
      owner: repository?.owner?.login,
      repo: repository?.name,
      commit_sha: head_sha
    })
    const displayTime = formatDisplayTime(durationInfo.run_duration_ms)

    const config = {
      wide_screen_mode: true
    }
    const header = {
      template: workflowRunSuccess ? 'green' : 'red',
      title: {
        tag: 'plain_text',
        content: `${cnName} 构建情况（${buildEnv}）：${
          workflowRunSuccess ? '成功' : '失败'
        }`
      }
    }
    const previewUrl = getPreviewUrl(content, repository) || '#'
    const baseMsg = `\n* [${buildDetailMsg}](${buildDetailPageUrl})`
    const commitMsgs = commits?.length ? formatCommitsMsg(commits) : baseMsg
    const elements = [
      {
        tag: 'div',
        text: {
          tag: 'lark_md',
          content: '<at id=all></at>'
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
                content: `**构建分支：**${branch}`
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
                content: `**推送人：**${name}（${email}） `
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
                content: `**操作人：**${operator} `
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
                content: `**Message [(构建链接)](${buildDetailPageUrl})：** ${commitMsgs}`
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
    console.log('发送飞书请求前参数：', feishu_body)

    fetchFeishuWebhook(feishu_body, workflowRunSuccess ? isProd : false)
  } catch (error) {
    console.log('出错啦:', error)
  }
}
