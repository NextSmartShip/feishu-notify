import { fetchFeishuWebhook } from '../src/api'
import { notifyUserMap } from '../src/config'
import {
  assertFeishuWebhookSuccess,
  buildOpenIdSmokeCard,
  getOpenIdSmokeTargets,
  sendOpenIdSmoke
} from '../src/openid-smoke'

jest.mock('../src/api', () => ({
  __esModule: true,
  fetchFeishuWebhook: jest.fn()
}))

const mockFetchFeishuWebhook = fetchFeishuWebhook as jest.MockedFunction<
  typeof fetchFeishuWebhook
>

describe('openid smoke', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('supports selecting all configured users', () => {
    const targets = getOpenIdSmokeTargets()

    expect(targets).toHaveLength(4)
  })

  it('supports selecting a single configured user', () => {
    const [target] = getOpenIdSmokeTargets('jiaqiang_wu')

    expect(target.name).toBe('jiaqiang_wu')
    expect(target.email).toBe('jiaqiang.wu@nextsmartship.com')
  })

  it('ignores the pnpm separator argument', () => {
    const targets = getOpenIdSmokeTargets('--')

    expect(targets).toHaveLength(4)
  })

  it('builds a card that only mentions the target user', () => {
    const body = buildOpenIdSmokeCard(
      notifyUserMap.jiaqiang_wu,
      '2026-07-07T12:00:00.000Z'
    )

    expect(body.card.elements[0]).toEqual({
      tag: 'div',
      text: {
        tag: 'lark_md',
        content: `<at id=${notifyUserMap.jiaqiang_wu.feishu_open_id}></at>`
      }
    })
  })

  it('throws when feishu returns a non-zero code', () => {
    expect(() =>
      assertFeishuWebhookSuccess(
        {
          code: 11246,
          msg: 'invalid user resource'
        },
        notifyUserMap.jiaqiang_wu
      )
    ).toThrow('open_id 校验失败')
  })

  it('sends the smoke card to the personal group', async () => {
    mockFetchFeishuWebhook.mockResolvedValue({
      code: 0,
      msg: 'success'
    })

    await sendOpenIdSmoke(notifyUserMap.jiaqiang_wu, '2026-07-07T12:00:00.000Z')

    expect(mockFetchFeishuWebhook).toHaveBeenCalledWith(
      expect.objectContaining({
        msg_type: 'interactive'
      }),
      { targetGroup: 'personal' }
    )
  })
})
