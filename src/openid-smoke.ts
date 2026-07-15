import { fetchFeishuWebhook } from './api'
import { notifyUserList, type NotifyUserItemType, UsersEnum } from './config'

export type OpenIdSmokeTarget = UsersEnum | 'all'

const SUCCESS_CODE = 0

export const getOpenIdSmokeTargets = (target = 'all'): NotifyUserItemType[] => {
  const normalizedTarget = target.trim().toLowerCase()

  if (
    !normalizedTarget ||
    normalizedTarget === 'all' ||
    normalizedTarget === '--'
  )
    return notifyUserList

  const matchedUser = notifyUserList.find(user => {
    return (
      user.name === normalizedTarget ||
      user.email.toLowerCase() === normalizedTarget ||
      user.feishu_open_id.toLowerCase() === normalizedTarget
    )
  })

  if (!matchedUser) {
    throw new Error(
      `未找到目标用户：${target}。可选值：all、${notifyUserList
        .map(user => user.name)
        .join('、')}`
    )
  }

  return [matchedUser]
}

export const buildOpenIdSmokeCard = (
  user: NotifyUserItemType,
  timestamp: string
) => {
  return {
    msg_type: 'interactive',
    card: {
      config: {
        wide_screen_mode: true
      },
      header: {
        template: 'blue',
        title: {
          tag: 'plain_text',
          content: `open_id 本地校验：${user.name}`
        }
      },
      elements: [
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content: `<at id=${user.feishu_open_id}></at>`
          }
        },
        {
          tag: 'markdown',
          content: [
            `**目标用户：** ${user.name}`,
            `**邮箱：** ${user.email}`,
            `**open_id：** \`${user.feishu_open_id}\``,
            `**时间：** ${timestamp}`,
            '',
            '这是一条用于校验飞书 open_id 是否有效的本地测试消息。'
          ].join('\n')
        }
      ]
    }
  }
}

export const assertFeishuWebhookSuccess = (
  result: unknown,
  user: NotifyUserItemType
) => {
  const response = result as { code?: number; msg?: string } | undefined

  if (response?.code === SUCCESS_CODE) return

  throw new Error(
    `open_id 校验失败：${user.name} (${user.feishu_open_id})，飞书返回：${
      response?.msg || JSON.stringify(response)
    }`
  )
}

export const sendOpenIdSmoke = async (
  user: NotifyUserItemType,
  timestamp: string
) => {
  const body = buildOpenIdSmokeCard(user, timestamp)
  const response = await fetchFeishuWebhook(body, {
    targetGroup: 'personal'
  })

  assertFeishuWebhookSuccess(response, user)

  return response
}
