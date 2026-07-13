import { fetchFeishuWebhook, fetchJobHtmlUrl } from '../src/api'
import { getCommits } from '../src/utils'
import push from '../src/api/push'

jest.mock('../src/api', () => ({
  fetchFeishuWebhook: jest.fn(),
  fetchJobHtmlUrl: jest.fn()
}))

jest.mock('../src/utils', () => ({
  formatCommitsMsg: jest.fn(() => 'formatted commits'),
  getCommits: jest.fn(),
  getCurrentDayjs: jest.fn(() => '2026-07-06T12:00:00Z'),
  getPreviewUrl: jest.fn(() => '#'),
  handleDiffTime: jest.fn(() => '1分钟0秒')
}))

const mockFetchFeishuWebhook = fetchFeishuWebhook as jest.MockedFunction<
  typeof fetchFeishuWebhook
>
const mockFetchJobHtmlUrl = fetchJobHtmlUrl as jest.MockedFunction<
  typeof fetchJobHtmlUrl
>
const mockGetCommits = getCommits as jest.MockedFunction<typeof getCommits>

const baseWorkflowRun = {
  id: 123,
  event: 'push',
  head_branch: 'master',
  head_sha: 'abc123',
  html_url: 'https://github.com/NextSmartShip/wms-ui/actions/runs/123',
  jobs_url: 'https://api.github.com/jobs',
  run_started_at: '2026-07-06T11:59:00Z',
  head_commit: {
    message: 'feat: build notification',
    author: {
      name: 'Jiaqiang Wu',
      email: 'jiaqiang.wu@nextsmartship.com'
    }
  },
  repository: {
    name: 'wms-ui',
    full_name: 'NextSmartShip/wms-ui',
    owner: {
      login: 'NextSmartShip'
    }
  },
  triggering_actor: {
    login: 'wujiaqiang',
    html_url: 'https://github.com/wujiaqiang'
  }
}

describe('push', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetCommits.mockResolvedValue({
      commits: [],
      compareUrl: '',
      currentTag: '',
      previousTag: ''
    })
  })

  it('mentions only the push author when a workflow job fails', async () => {
    mockFetchJobHtmlUrl.mockResolvedValue({
      total_count: 1,
      jobs: [
        {
          name: 'build',
          status: 'completed',
          conclusion: 'failure',
          html_url: 'https://github.com/job/1'
        }
      ]
    })

    await push(baseWorkflowRun, { targetGroup: 'personal' })

    const body = mockFetchFeishuWebhook.mock.calls[0][0]
    const atContent = body.card.elements[0].text.content

    expect(body.card.header.template).toBe('red')
    expect(body.card.header.title.content).toContain('失败')
    expect(JSON.stringify(body)).toContain('img_v2_c6a3dadb')
    expect(atContent).toBe('<at id=ou_7e57f1df77cdadca33485693a5b941db></at>')
    expect(mockFetchFeishuWebhook).toHaveBeenCalledWith(
      body,
      expect.objectContaining({
        targetGroup: 'personal',
        toBigGroup: false
      })
    )
  })

  it('falls back to jiaqiang_wu when a failed workflow push author is not configured', async () => {
    mockFetchJobHtmlUrl.mockResolvedValue({
      total_count: 1,
      jobs: [
        {
          name: 'build',
          status: 'completed',
          conclusion: 'failure',
          html_url: 'https://github.com/job/1'
        }
      ]
    })

    await push(
      {
        ...baseWorkflowRun,
        head_commit: {
          ...baseWorkflowRun.head_commit,
          author: {
            name: 'Unknown User',
            email: 'unknown.user@nextsmartship.com'
          }
        }
      },
      { targetGroup: 'personal' }
    )

    const body = mockFetchFeishuWebhook.mock.calls[0][0]

    expect(body.card.elements[0].text.content).toBe(
      '<at id=ou_7e57f1df77cdadca33485693a5b941db></at>'
    )
  })

  it('sends a success card when workflow jobs completed successfully', async () => {
    mockFetchJobHtmlUrl.mockResolvedValue({
      total_count: 1,
      jobs: [
        {
          name: 'build',
          status: 'completed',
          conclusion: 'success',
          html_url: 'https://github.com/job/1'
        }
      ]
    })

    await push(baseWorkflowRun, { targetGroup: 'personal' })

    const body = mockFetchFeishuWebhook.mock.calls[0][0]

    expect(body.card.header.template).toBe('green')
    expect(body.card.header.title.content).toContain('成功')
    expect(JSON.stringify(body)).toContain('img_v2_8eba3fe2')
    expect(mockFetchFeishuWebhook).toHaveBeenCalledWith(
      body,
      expect.objectContaining({
        targetGroup: 'personal',
        toBigGroup: true
      })
    )
  })

  it('shows compare link and tag range commits for production tag notifications', async () => {
    mockGetCommits.mockResolvedValue({
      commits: [
        {
          date: '今天 19:59:00',
          message: 'feat: first release change',
          html_url: 'https://github.com/NextSmartShip/wms-ui/commit/first-sha',
          author: {
            login: 'wujiaqiang',
            html_url: 'https://github.com/wujiaqiang'
          }
        },
        {
          date: '今天 20:01:00',
          message: 'fix: second release change',
          html_url: 'https://github.com/NextSmartShip/wms-ui/commit/second-sha',
          author: {
            login: 'wujiaqiang',
            html_url: 'https://github.com/wujiaqiang'
          }
        }
      ],
      compareUrl: 'https://github.com/NextSmartShip/wms-ui/compare/v235...v236',
      currentTag: 'v236',
      previousTag: 'v235'
    })
    mockFetchJobHtmlUrl.mockResolvedValue({
      total_count: 1,
      jobs: [
        {
          name: 'build',
          status: 'completed',
          conclusion: 'success',
          html_url: 'https://github.com/job/1'
        }
      ]
    })

    await push(baseWorkflowRun, {
      targetGroup: 'personal',
      ref: 'refs/tags/v236',
      refType: 'tag'
    })

    const body = mockFetchFeishuWebhook.mock.calls[0][0]
    const bodyText = JSON.stringify(body)

    expect(mockGetCommits).toHaveBeenCalledWith(
      expect.objectContaining({
        ref: 'refs/tags/v236',
        refType: 'tag'
      })
    )
    expect(body.card.header.title.content).toContain('生产环境')
    expect(bodyText).toContain(
      '**Compare：** [v235...v236](https://github.com/NextSmartShip/wms-ui/compare/v235...v236)'
    )
    expect(bodyText).toContain('formatted commits')
  })

  it('does not show compare link for non-tag master notifications', async () => {
    mockFetchJobHtmlUrl.mockResolvedValue({
      total_count: 1,
      jobs: [
        {
          name: 'build',
          status: 'completed',
          conclusion: 'success',
          html_url: 'https://github.com/job/1'
        }
      ]
    })

    await push(baseWorkflowRun, { targetGroup: 'personal' })

    const body = mockFetchFeishuWebhook.mock.calls[0][0]

    expect(JSON.stringify(body)).not.toContain('**Compare：**')
  })
})
