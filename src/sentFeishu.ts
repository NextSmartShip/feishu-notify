interface Props {
  build_url: string
}

export default (props: Props) => {
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
              img_key: !!workflowRunSuccess
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
  const feishu_body = {
    msg_type: 'interactive',
    card: {
      config,
      header,
      elements
    }
  }
}
