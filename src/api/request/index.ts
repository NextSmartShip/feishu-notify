import * as _Axios from 'axios'
import { headers } from '../../config'
import { getToken, startWithHttpOrS } from '../../utils'

const Axios = _Axios.default

const PRE_URL = 'https://api.github.com'
const axios = Axios.create({
  // baseURL: PRE_URL,
})
axios.interceptors.request.use(
  _config => {
    if (!_config?.url) throw new Error('url不存在')
    let url = _config.url
    if (!startWithHttpOrS(url)) {
      url = PRE_URL + url
    }
    console.log(
      'check old url:',
      _config.url,
      'params: ',
      _config.params,
      _config.data,
      ',finally url: ',
      url
    )
    // @ts-ignore
    _config.headers = {
      // ..._config.headers,
      ...headers,
      Authorization: `token ${getToken()}`
    }
    _config.url = url
    return _config
  },
  _err => {
    console.log('emit by before request error: ', _err)

    return Promise.reject(_err)
  }
)
axios.interceptors.response.use(
  _res => {
    const { data } = _res
    console.log('check data by response: ', data)
    return data
  },
  _err => {
    const _errData = _err?.response?.data
    console.log('emit by after request error: ', _errData)
    return Promise.reject(_errData)
  }
)

export default axios
