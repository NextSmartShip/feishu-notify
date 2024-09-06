export const botUrls = {
  // 生产构建通知群 (技术部)：
  ProdEnvGroupBot:
    'https://open.feishu.cn/open-apis/bot/v2/hook/955695b6-a83b-4335-a5a7-58068361d3bf',
  // test构建通知群
  TestEnvGroupBot:
    'https://open.feishu.cn/open-apis/bot/v2/hook/83f5973a-2f5d-4d6b-8721-dd917fd42291',
  // 前端群
  FrontEndOldManGroupBot:
    'https://open.feishu.cn/open-apis/bot/v2/hook/b0a6dd9b-2602-43bc-b6d8-59935f864362'
}

// eslint-disable-next-line no-shadow
export enum UsersEnum {
  jiaqiang_wu = 'jiaqiang_wu',
  henry_zheng = 'henry_zheng',
  shenglie_zuo = 'shenglie_zuo',
  gabby_zhou = 'gabby_zhou'
}
export interface NotifyUserItemType {
  name: UsersEnum
  github_login_id: string
  feishu_open_id: string
  feishu_union_id: string
  feishu_user_id: string
}

// 定义需要通知的人（open_id):
export const notifyUserList = [
  // jiaqiang.wu@nextsmartship.com
  {
    name: UsersEnum.jiaqiang_wu,
    email: 'jiaqiang.wu@nextsmartship.com',
    github_login_id: '24938685',
    feishu_open_id: 'ou_2b1b9f5f8f4e9d8d3b2a4f3b0b2d3d6d',
    feishu_union_id: 'on_bf7001b962845c5e09b9e1a9e096ee2f',
    feishu_user_id: '7bdc9d5b'
  },
  // henry.zheng@nextsmartship.com
  {
    name: UsersEnum.henry_zheng,
    email: 'henry.zheng@nextsmartship.com',
    github_login_id: '143984317',
    feishu_open_id: 'ou_8a15662f718827f0f9e7cc59618e9e7f',
    feishu_union_id: 'on_4a732d4de876c205084f2898f25e7f25',
    feishu_user_id: 'gd72gb22'
  },
  // shenglie.zuo@nextsmartship.com
  {
    name: UsersEnum.shenglie_zuo,
    email: 'shenglie.zuo@nextsmartship.com',
    github_login_id: '',
    feishu_open_id: 'ou_449abdd622eb240c517da84e566d174e',
    feishu_union_id: 'on_ff9d72150b3ea8e82f25589ae336056a',
    feishu_user_id: '3d3a4b36'
  },
  // gabby.zhou@nextsmartship.com
  {
    name: UsersEnum.gabby_zhou,
    email: 'gabby.zhou@nextsmartship.com',
    github_login_id: '',
    feishu_open_id: 'ou_9914b1620efd8188ec0a5b3e29576231',
    feishu_union_id: 'on_bfc13931199f04bd3a1bbd5c56f021f6',
    feishu_user_id: '2c3f6848'
  }
]
export const notifyUserMap = notifyUserList.reduce(
  (acc, cur) => {
    acc[cur.name] = cur
    return acc
  },
  {} as Record<UsersEnum, any>
) as Record<keyof typeof UsersEnum, NotifyUserItemType>

export const PROJECT_NAME_MAPS = {
  WMS_MOBILE_UI: 'wms-mobile-ui',
  WMS_UI: 'wms-ui',
  OMS_UI: 'oms-ui',
  NSS_WEBSITE: 'nss-website',
  NSS_UTILS: 'nss-utils'
}
export const projectNameMaps = {
  [PROJECT_NAME_MAPS.WMS_MOBILE_UI]: 'PDA（H5）',
  [PROJECT_NAME_MAPS.WMS_UI]: 'WMS',
  [PROJECT_NAME_MAPS.OMS_UI]: 'OMS',
  [PROJECT_NAME_MAPS.NSS_WEBSITE]: 'NSS-官网',
  [PROJECT_NAME_MAPS.NSS_UTILS]: 'NSS-公共方法'
}
const BASE_PORTOCOL = 'https'
const BASE_WEBSITE_URL = 'nextsmartship.com'

export const PROJECT_TEST_URL_MAPS = {
  [PROJECT_NAME_MAPS.WMS_MOBILE_UI]: `${BASE_PORTOCOL}://pdadev.${BASE_WEBSITE_URL}`,
  [PROJECT_NAME_MAPS.WMS_UI]: `${BASE_PORTOCOL}://wmsdev.${BASE_WEBSITE_URL}`,
  [PROJECT_NAME_MAPS.OMS_UI]: `${BASE_PORTOCOL}://omsdev.${BASE_WEBSITE_URL}`,
  [PROJECT_NAME_MAPS.NSS_WEBSITE]: `https://dev-nextsmartship.vercel.app/`
}
export const PROJECT_URL_MAPS = {
  [PROJECT_NAME_MAPS.WMS_MOBILE_UI]: `${BASE_PORTOCOL}://pda.${BASE_WEBSITE_URL}`,
  [PROJECT_NAME_MAPS.WMS_UI]: `${BASE_PORTOCOL}://wms.prod.${BASE_WEBSITE_URL}`,
  [PROJECT_NAME_MAPS.OMS_UI]: `${BASE_PORTOCOL}://fulfillship.${BASE_WEBSITE_URL}`,
  [PROJECT_NAME_MAPS.NSS_WEBSITE]: `${BASE_PORTOCOL}://nextsmartship.com/`
}

export const SuccessImgKey = 'img_v2_8eba3fe2-0e47-4ad0-85da-4db38899d25g'
export const FailImgKey = 'img_v2_c6a3dadb-0eaa-4e81-803a-eee3d4240ebg'
// export const webhookToken = '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'
// export const webhookToken = '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'

export const headers = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28'
}
export const BASE_PARAMS = {
  headers,
  json: true
}
export const NumberList = [
  '1️⃣',
  '2️⃣',
  '3️⃣',
  '4️⃣',
  '5️⃣',
  '6️⃣',
  '7️⃣',
  '8️⃣',
  '9️⃣',
  '🔟',
  '1️⃣1️⃣',
  '1️⃣2️⃣',
  '1️⃣3️⃣',
  '1️⃣4️⃣',
  '1️⃣5️⃣',
  '1️⃣6️⃣',
  '1️⃣7️⃣',
  '1️⃣8️⃣',
  '1️⃣9️⃣',
  '2️⃣0️⃣'
]
