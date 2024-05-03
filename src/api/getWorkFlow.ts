import push from './push'
import { stop } from '../utils'
import { fetchWorkFlow } from '.'

interface Props {
  owner?: string
  repo?: string
  run_id?: number
}
const getWorkFlow = async ({
  owner = 'NextSmartShip',
  repo = '',
  run_id = -1,
  ...props
}: Props) => {
  if (!repo || run_id === -1)
    throw new Error('参数丢失，请检查repo和run_id是否同时传入')

  try {
    await stop(3000)
    const payload = await fetchWorkFlow({
      owner,
      repo,
      run_id
    })
    await push(payload)
  } catch (error) {
    console.log('查看请求by错误时：', error)
  }
}

export default getWorkFlow
