import { fetchCommit } from '../src/api'
import { getCommits } from '../src/utils'

jest.mock('../src/api', () => ({
  fetchCommit: jest.fn()
}))

const mockFetchCommit = fetchCommit as jest.MockedFunction<typeof fetchCommit>

describe('getCommits', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('formats the workflow run head commit without loading associated PR commits', async () => {
    const commits = await getCommits({
      owner: 'NextSmartShip',
      repo: 'wms-ui',
      commit_sha: 'c005b38b',
      head_commit: {
        message: 'fix: only show current build commit',
        author: {
          name: 'Jiaqiang Wu',
          email: 'jiaqiang.wu@nextsmartship.com',
          date: '2026-07-06T11:59:00Z'
        }
      }
    })

    expect(fetchCommit).not.toHaveBeenCalled()
    expect(commits).toEqual([
      expect.objectContaining({
        message: 'fix: only show current build commit',
        html_url: 'https://github.com/NextSmartShip/wms-ui/commit/c005b38b',
        author: {
          login: 'Jiaqiang Wu',
          html_url: ''
        }
      })
    ])
  })

  it('falls back to the single head SHA when workflow run head commit is missing', async () => {
    mockFetchCommit.mockResolvedValue([
      {
        commit: {
          message: 'fix: fallback to exact head sha',
          author: {
            name: 'Jiaqiang Wu',
            email: 'jiaqiang.wu@nextsmartship.com',
            date: '2026-07-06T11:59:00Z'
          }
        },
        html_url: 'https://github.com/NextSmartShip/wms-ui/commit/c005b38b',
        author: {
          login: 'wujiaqiang',
          html_url: 'https://github.com/wujiaqiang'
        }
      }
    ])

    const commits = await getCommits({
      owner: 'NextSmartShip',
      repo: 'wms-ui',
      commit_sha: 'c005b38b'
    })

    expect(mockFetchCommit).toHaveBeenCalledWith({
      owner: 'NextSmartShip',
      repo: 'wms-ui',
      commit_sha: 'c005b38b'
    })
    expect(commits).toHaveLength(1)
    expect(commits[0].message).toBe('fix: fallback to exact head sha')
  })
})
