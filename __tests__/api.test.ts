import axios from '../src/api/request'
import { fetchFeishuWebhook } from '../src/api'
import { botUrls } from '../src/config'

jest.mock('../src/api/request', () => ({
  __esModule: true,
  default: jest.fn()
}))

const mockAxios = axios as jest.MockedFunction<typeof axios>

describe('fetchFeishuWebhook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAxios.mockResolvedValue({})
  })

  it('routes personal test notifications to the FrontEndOldManGroupBot', async () => {
    const body = { msg_type: 'interactive' }

    await fetchFeishuWebhook(body, { targetGroup: 'personal' })

    expect(mockAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: botUrls.FrontEndOldManGroupBot,
        data: body
      })
    )
  })
})
