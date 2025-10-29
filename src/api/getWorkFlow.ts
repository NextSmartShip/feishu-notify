import push from './push'
import { stop } from '../utils'
import { fetchWorkFlow } from '.'
import { Environment } from '../config'

interface Props {
  owner?: string
  repo?: string
  run_id?: number | string
  environment?: string
  status?: string
}
const getWorkFlow = async ({
  owner = 'NextSmartShip',
  repo = '',
  run_id = '-1',
  environment = Environment.Production,
  status,
  ...props
}: Props) => {
  if (!repo || run_id === '-1')
    throw new Error('参数丢失，请检查repo和run_id是否同时传入')

  try {
    let payload = await fetchWorkFlow({
      owner,
      repo,
      run_id
    })

    console.log('当前状态：', payload.status, payload.conclusion)
    while (payload.status !== 'completed') {
      await stop(3000)
      payload = await fetchWorkFlow({
        owner,
        repo,
        run_id
      })
    }

    await push(payload, environment as Environment, status)
  } catch (error) {
    console.log('查看请求by错误时：', error)
  }
}

export default getWorkFlow
