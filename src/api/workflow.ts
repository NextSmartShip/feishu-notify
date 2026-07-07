import push from './push'
import { stop } from '../utils'
import { fetchWorkFlow } from '.'
import type { TargetGroup } from '../types'

interface Props {
  owner?: string
  repo?: string
  run_id?: number
  targetGroup?: TargetGroup
  workflowRunJson?: string
}

const parseWorkflowRunJson = (workflowRunJson?: string) => {
  if (!workflowRunJson?.trim()) return
  try {
    return JSON.parse(workflowRunJson)
  } catch (error) {
    throw new Error('workflow-run-json 不是合法 JSON')
  }
}

const getWorkFlow = async ({
  owner = 'NextSmartShip',
  repo = '',
  run_id = -1,
  targetGroup = 'auto',
  workflowRunJson = ''
}: Props) => {
  const workflowRunPayload = parseWorkflowRunJson(workflowRunJson)
  if (workflowRunPayload) {
    await push(workflowRunPayload, { targetGroup })
    return
  }

  if (!repo || run_id === -1)
    throw new Error('参数丢失，请检查repo和run_id是否同时传入')

  try {
    await stop(3000)
    const payload = await fetchWorkFlow({
      owner,
      repo,
      run_id
    })
    await push(payload, { targetGroup })
  } catch (error) {
    console.log('查看请求by错误时：', error)
  }
}

export default getWorkFlow
