import { fetchWorkFlow } from '../src/api'
import push from '../src/api/push'
import getWorkFlow from '../src/api/workflow'

jest.mock('../src/api', () => ({
  fetchWorkFlow: jest.fn()
}))

jest.mock('../src/api/push', () => ({
  __esModule: true,
  default: jest.fn()
}))

const mockFetchWorkFlow = fetchWorkFlow as jest.MockedFunction<
  typeof fetchWorkFlow
>
const mockPush = push as jest.MockedFunction<typeof push>

describe('getWorkFlow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('uses workflow-run-json instead of fetching the workflow run', async () => {
    const workflowRun = {
      id: 123,
      repository: {
        name: 'wms-ui'
      }
    }

    await getWorkFlow({
      owner: 'NextSmartShip',
      repo: 'wms-ui',
      run_id: 123,
      targetGroup: 'personal',
      project: 'wms',
      workflowRunJson: JSON.stringify(workflowRun),
      ref: 'refs/tags/v236',
      refType: 'tag'
    })

    expect(mockFetchWorkFlow).not.toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith(workflowRun, {
      targetGroup: 'personal',
      project: 'wms',
      ref: 'refs/tags/v236',
      refType: 'tag'
    })
  })
})
