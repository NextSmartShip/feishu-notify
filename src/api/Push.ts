import { fetchFeishuWebhook, fetchJobHtmlUrl } from '.'
import * as groupUrls from '../config'
import {
  formatCommitsMsg,
  getCommits,
  getPreviewUrl,
  handleDiffTime
} from '../utils'

type BodyType = { payload: Record<string, any> }

export default async function Push(ctx: any) {
  ctx.type = 'application/json'

  try {
    const body = ctx.request.body as BodyType
    const content =
      typeof body.payload === 'string' ? JSON.parse(body.payload) : body.payload
    // 事件钩子：
    const action = content.action
    // 代表是否能发feishu：
    const canSendMsg = action === 'completed'
    // 构建flow对象：
    const workflow_run = content.workflow_run
    // 否则，代表是手动触发（暂时使用）：
    console.log('by Push...: ', workflow_run, content)
    if (!canSendMsg || !workflow_run) return

    // 最新一条提交对象：
    const head_commit = workflow_run.head_commit
    // 最新一条提交id：
    const head_sha = workflow_run.head_sha
    // 构建的分支：
    const branch = workflow_run.head_branch
    // 构建的详情页 (当workflow_run不存在时，html_url无法找到)：
    const jobRes = await fetchJobHtmlUrl(workflow_run.jobs_url)
    const { jobs = [] } = jobRes

    const buildDetailPageUrl = jobs?.[0]?.html_url || workflow_run.html_url
    // 构建的title：
    const buildDetailMsg = head_commit?.message?.replace?.(/^.*?\n\n/, '')

    // 项目名称：
    const repository = content?.repository
    const cnName = groupUrls.projectNameMaps[repository?.name] || 'NSS-项目'
    // // 当前hook操作人
    const operator = content?.sender?.login
    // 代码推送人-姓名：
    const name = head_commit?.author?.name
    // 代码推送人-邮箱：
    const email = head_commit?.author?.email
    // 此次action是Prod还是Test:
    const isProd = workflow_run.event === 'release' || branch === 'master'
    // 构建环境：
    const buildEnv = isProd ? '生产环境' : '测试环境'

    // 代表整个构建成功执行到最后了，即可以发送status给feishu：
    if (canSendMsg) {
      const workflowRunSuccess = workflow_run.conclusion === 'success'
      const commits = workflowRunSuccess
        ? await getCommits({
            owner: repository?.owner?.login,
            repo: repository?.name,
            commit_sha: head_sha
          })
        : []
      const handleTime = handleDiffTime(
        workflow_run.run_started_at,
        workflow_run.updated_at
      )

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
      const previewUrl = getPreviewUrl(workflow_run, repository) || '#'
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
          content: `[[${repository?.full_name}]点击查看构建详情](${buildDetailPageUrl}) **#${workflow_run.id}**`
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
                  content: `**耗时：**${handleTime}`
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
                  img_key: Boolean(workflowRunSuccess)
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
      ctx.status = Boolean(workflowRunSuccess) ? 200 : 500
      ctx.body = content
      // ctx.json = { code: !!workflowRunSuccess ? 1 : -1 };
    }
    ctx.status = 200
    ctx.body = content
    // ctx.json = { code: 1 };
  } catch (error) {
    console.log('出错啦:', error)
  }
}
