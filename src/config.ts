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
