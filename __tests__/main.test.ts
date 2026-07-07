import getActionOptions from '../src/action-options'
import getWorkFlow from '../src/api/workflow'
import { run } from '../src/main'

jest.mock('../src/action-options', () => ({
  __esModule: true,
  default: jest.fn()
}))

jest.mock('../src/api/workflow', () => ({
  __esModule: true,
  default: jest.fn()
}))

const mockGetActionOptions = getActionOptions as jest.MockedFunction<
  typeof getActionOptions
>
const mockGetWorkFlow = getWorkFlow as jest.MockedFunction<typeof getWorkFlow>

describe('run', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetActionOptions.mockReturnValue({
      token: 'github-token',
      username: '',
      payload: {} as any,
      owner: 'NextSmartShip',
      repo: 'wms-ui',
      run_id: 123,
      targetGroup: 'auto',
      workflowRunJson: '',
      github_token: 'github-token'
    })
  })

  it('waits for getWorkFlow to complete', async () => {
    let resolveGetWorkFlow: () => void = () => {}
    const getWorkFlowPromise = new Promise<void>(resolve => {
      resolveGetWorkFlow = resolve
    })
    mockGetWorkFlow.mockReturnValue(getWorkFlowPromise)

    const pendingMarker = Symbol('pending')
    const runPromise = run()
    const raceResult = await Promise.race([
      runPromise,
      Promise.resolve(pendingMarker)
    ])

    expect(raceResult).toBe(pendingMarker)

    resolveGetWorkFlow()
    await runPromise

    expect(mockGetWorkFlow).toHaveBeenCalledTimes(1)
  })
})
