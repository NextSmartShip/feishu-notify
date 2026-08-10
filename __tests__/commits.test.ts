import {
  fetchCommit,
  fetchCompareCommits,
  fetchPullRequestCommits,
  fetchPullRequestsByCommit,
  fetchRepositoryTags
} from '../src/api'
import { formatCommitsMsg, getCommits } from '../src/utils'

jest.mock('../src/api', () => ({
  fetchCommit: jest.fn(),
  fetchCompareCommits: jest.fn(),
  fetchPullRequestCommits: jest.fn(),
  fetchPullRequestsByCommit: jest.fn(),
  fetchRepositoryTags: jest.fn()
}))

const mockFetchCommit = fetchCommit as jest.MockedFunction<typeof fetchCommit>
const mockFetchRepositoryTags = fetchRepositoryTags as jest.MockedFunction<
  typeof fetchRepositoryTags
>
const mockFetchCompareCommits = fetchCompareCommits as jest.MockedFunction<
  typeof fetchCompareCommits
>
const mockFetchPullRequestsByCommit =
  fetchPullRequestsByCommit as jest.MockedFunction<
    typeof fetchPullRequestsByCommit
  >
const mockFetchPullRequestCommits =
  fetchPullRequestCommits as jest.MockedFunction<typeof fetchPullRequestCommits>

const createApiCommit = ({
  message,
  parents = [{ sha: 'parent-sha' }],
  sha = message.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}: {
  message: string
  parents?: { sha: string }[]
  sha?: string
}) =>
  ({
    commit: {
      message,
      author: {
        name: 'Jiaqiang Wu',
        email: 'jiaqiang.wu@nextsmartship.com',
        date: '2026-07-06T11:59:00Z'
      }
    },
    html_url: `https://github.com/NextSmartShip/wms-ui/commit/${sha}`,
    author: {
      login: 'wujiaqiang',
      html_url: 'https://github.com/wujiaqiang'
    },
    parents
  }) as any

describe('getCommits', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFetchPullRequestsByCommit.mockResolvedValue([])
    mockFetchPullRequestCommits.mockResolvedValue([])
  })

  it('loads commits between the current tag and previous repository tag', async () => {
    mockFetchRepositoryTags.mockResolvedValue([
      {
        name: 'v236',
        commit: {
          sha: 'new-sha',
          url: 'https://api.github.com/repos/NextSmartShip/wms-ui/commits/new-sha'
        }
      },
      {
        name: 'v235',
        commit: {
          sha: 'old-sha',
          url: 'https://api.github.com/repos/NextSmartShip/wms-ui/commits/old-sha'
        }
      }
    ])
    mockFetchCompareCommits.mockResolvedValue({
      html_url: 'https://github.com/NextSmartShip/wms-ui/compare/v235...v236',
      commits: [
        {
          commit: {
            message: 'feat: first release change',
            author: {
              name: 'Jiaqiang Wu',
              email: 'jiaqiang.wu@nextsmartship.com',
              date: '2026-07-06T11:59:00Z'
            }
          },
          html_url: 'https://github.com/NextSmartShip/wms-ui/commit/first-sha',
          author: {
            login: 'wujiaqiang',
            html_url: 'https://github.com/wujiaqiang'
          }
        },
        {
          commit: {
            message: 'fix: second release change',
            author: {
              name: 'Jiaqiang Wu',
              email: 'jiaqiang.wu@nextsmartship.com',
              date: '2026-07-06T12:01:00Z'
            }
          },
          html_url: 'https://github.com/NextSmartShip/wms-ui/commit/second-sha',
          author: {
            login: 'wujiaqiang',
            html_url: 'https://github.com/wujiaqiang'
          }
        }
      ]
    })

    const result = await getCommits({
      owner: 'NextSmartShip',
      repo: 'wms-ui',
      commit_sha: 'new-sha',
      head_commit: {
        message: 'fix: only show current build commit'
      },
      ref: 'refs/tags/v236',
      refType: 'tag'
    })

    expect(mockFetchRepositoryTags).toHaveBeenCalledWith({
      owner: 'NextSmartShip',
      repo: 'wms-ui',
      page: 1,
      per_page: 100
    })
    expect(mockFetchCompareCommits).toHaveBeenCalledWith({
      owner: 'NextSmartShip',
      repo: 'wms-ui',
      base: 'v235',
      head: 'v236'
    })
    expect(fetchCommit).not.toHaveBeenCalled()
    expect(result).toEqual(
      expect.objectContaining({
        currentTag: 'v236',
        previousTag: 'v235',
        compareUrl:
          'https://github.com/NextSmartShip/wms-ui/compare/v235...v236',
        commits: [
          expect.objectContaining({
            message: 'feat: first release change'
          }),
          expect.objectContaining({
            message: 'fix: second release change'
          })
        ]
      })
    )
  })

  it('falls back to the workflow run head commit when previous tag is missing', async () => {
    mockFetchRepositoryTags.mockResolvedValue([
      {
        name: 'v236',
        commit: {
          sha: 'new-sha',
          url: 'https://api.github.com/repos/NextSmartShip/wms-ui/commits/new-sha'
        }
      }
    ])

    const result = await getCommits({
      owner: 'NextSmartShip',
      repo: 'wms-ui',
      commit_sha: 'new-sha',
      head_commit: {
        message: 'fix: only show current build commit',
        author: {
          name: 'Jiaqiang Wu',
          email: 'jiaqiang.wu@nextsmartship.com',
          date: '2026-07-06T11:59:00Z'
        }
      },
      ref: 'refs/tags/v236',
      refType: 'tag'
    })

    expect(mockFetchCompareCommits).not.toHaveBeenCalled()
    expect(result).toEqual(
      expect.objectContaining({
        compareUrl: '',
        commits: [
          expect.objectContaining({
            message: 'fix: only show current build commit'
          })
        ]
      })
    )
  })

  it('falls back to the workflow run head commit when tag lookup fails', async () => {
    mockFetchRepositoryTags.mockRejectedValue(new Error('tag api failed'))

    const result = await getCommits({
      owner: 'NextSmartShip',
      repo: 'wms-ui',
      commit_sha: 'new-sha',
      head_commit: {
        message: 'fix: keep notification useful when tag api fails',
        author: {
          name: 'Jiaqiang Wu',
          email: 'jiaqiang.wu@nextsmartship.com',
          date: '2026-07-06T11:59:00Z'
        }
      },
      ref: 'refs/tags/v236',
      refType: 'tag'
    })

    expect(result).toEqual(
      expect.objectContaining({
        compareUrl: '',
        commits: [
          expect.objectContaining({
            message: 'fix: keep notification useful when tag api fails'
          })
        ]
      })
    )
  })

  it('filters GitHub merge pull request commits from compare display commits', async () => {
    mockFetchRepositoryTags.mockResolvedValue([
      {
        name: 'v236',
        commit: {
          sha: 'new-sha',
          url: 'https://api.github.com/repos/NextSmartShip/wms-ui/commits/new-sha'
        }
      },
      {
        name: 'v235',
        commit: {
          sha: 'old-sha',
          url: 'https://api.github.com/repos/NextSmartShip/wms-ui/commits/old-sha'
        }
      }
    ])
    mockFetchCompareCommits.mockResolvedValue({
      html_url: 'https://github.com/NextSmartShip/wms-ui/compare/v235...v236',
      commits: [
        createApiCommit({
          message: 'feat: release change',
          parents: [{ sha: 'base-sha' }],
          sha: 'feature-sha'
        }),
        createApiCommit({
          message:
            'Merge pull request #3358 from NextSmartShip/B0457-ticket-phase-iv\n\nfeat: release change',
          parents: [{ sha: 'base-sha' }, { sha: 'feature-sha' }],
          sha: 'merge-sha'
        })
      ]
    })

    const result = await getCommits({
      owner: 'NextSmartShip',
      repo: 'wms-ui',
      commit_sha: 'new-sha',
      ref: 'refs/tags/v236',
      refType: 'tag'
    })

    expect(result.commits).toHaveLength(1)
    expect(result.commits[0].message).toBe('feat: release change')
  })

  it('keeps merge pull request message when it is not a multi-parent merge commit', async () => {
    mockFetchRepositoryTags.mockResolvedValue([
      {
        name: 'v236',
        commit: {
          sha: 'new-sha',
          url: 'https://api.github.com/repos/NextSmartShip/wms-ui/commits/new-sha'
        }
      },
      {
        name: 'v235',
        commit: {
          sha: 'old-sha',
          url: 'https://api.github.com/repos/NextSmartShip/wms-ui/commits/old-sha'
        }
      }
    ])
    mockFetchCompareCommits.mockResolvedValue({
      html_url: 'https://github.com/NextSmartShip/wms-ui/compare/v235...v236',
      commits: [
        createApiCommit({
          message:
            'Merge pull request #3358 from NextSmartShip/B0457-ticket-phase-iv',
          parents: [{ sha: 'base-sha' }],
          sha: 'single-parent-sha'
        })
      ]
    })

    const result = await getCommits({
      owner: 'NextSmartShip',
      repo: 'wms-ui',
      commit_sha: 'new-sha',
      ref: 'refs/tags/v236',
      refType: 'tag'
    })

    expect(result.commits).toHaveLength(1)
    expect(result.commits[0].message).toBe(
      'Merge pull request #3358 from NextSmartShip/B0457-ticket-phase-iv'
    )
  })

  it('keeps original compare commits when every commit is a merge pull request commit', async () => {
    mockFetchRepositoryTags.mockResolvedValue([
      {
        name: 'v236',
        commit: {
          sha: 'new-sha',
          url: 'https://api.github.com/repos/NextSmartShip/wms-ui/commits/new-sha'
        }
      },
      {
        name: 'v235',
        commit: {
          sha: 'old-sha',
          url: 'https://api.github.com/repos/NextSmartShip/wms-ui/commits/old-sha'
        }
      }
    ])
    mockFetchCompareCommits.mockResolvedValue({
      html_url: 'https://github.com/NextSmartShip/wms-ui/compare/v235...v236',
      commits: [
        createApiCommit({
          message:
            'Merge pull request #3358 from NextSmartShip/B0457-ticket-phase-iv',
          parents: [{ sha: 'base-sha' }, { sha: 'feature-sha' }],
          sha: 'merge-sha'
        })
      ]
    })

    const result = await getCommits({
      owner: 'NextSmartShip',
      repo: 'wms-ui',
      commit_sha: 'new-sha',
      ref: 'refs/tags/v236',
      refType: 'tag'
    })

    expect(result.commits).toHaveLength(1)
    expect(result.commits[0].message).toBe(
      'Merge pull request #3358 from NextSmartShip/B0457-ticket-phase-iv'
    )
  })

  it('uses numeric commit list labels after the emoji labels run out', () => {
    const commits = Array.from({ length: 21 }, (_, index) => ({
      date: '今天 19:59:00',
      message: `test: commit ${index + 1}`,
      html_url: `https://github.com/NextSmartShip/wms-ui/commit/${index + 1}`,
      author: null
    }))

    const message = formatCommitsMsg(commits)

    expect(message).toContain(
      '21. [test: commit 21](https://github.com/NextSmartShip/wms-ui/commit/21)'
    )
    expect(message).not.toContain('undefined [test: commit 21]')
  })

  it('loads all commits from the pull request associated with the head SHA', async () => {
    mockFetchPullRequestsByCommit.mockResolvedValue([
      {
        number: 379,
        commits_url:
          'https://api.github.com/repos/NextSmartShip/workspace/pulls/379/commits',
        merged_at: '2026-08-10T06:44:20Z',
        merge_commit_sha: 'd2d92403'
      }
    ])
    mockFetchPullRequestCommits.mockResolvedValue([
      createApiCommit({
        message:
          '🐛 fix(chat): 优化 LiveChat 加载失败提示的生命周期管理，避免异步误报',
        sha: '33593a64'
      }),
      createApiCommit({
        message: '⚡ perf(chat): 调整 LiveChat 加载超时时间，提升初始化成功率',
        sha: '9cc16b75'
      })
    ])

    const result = await getCommits({
      owner: 'NextSmartShip',
      repo: 'workspace',
      commit_sha: 'd2d92403',
      head_commit: {
        message: '⚡ perf(chat): 调整 LiveChat 加载超时时间，提升初始化成功率'
      }
    })

    expect(mockFetchPullRequestsByCommit).toHaveBeenCalledWith(
      expect.objectContaining({
        owner: 'NextSmartShip',
        repo: 'workspace',
        commit_sha: 'd2d92403'
      })
    )
    expect(mockFetchPullRequestCommits).toHaveBeenCalledWith({
      owner: 'NextSmartShip',
      repo: 'workspace',
      pullNumber: 379,
      page: 1,
      per_page: 100
    })
    expect(result.commits.map(commit => commit.message)).toEqual([
      '🐛 fix(chat): 优化 LiveChat 加载失败提示的生命周期管理，避免异步误报',
      '⚡ perf(chat): 调整 LiveChat 加载超时时间，提升初始化成功率'
    ])
  })

  it('falls back to the workflow run head commit when no PR is associated', async () => {
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

    expect(mockFetchPullRequestsByCommit).toHaveBeenCalled()
    expect(fetchCommit).not.toHaveBeenCalled()
    expect(commits.commits).toEqual([
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
    expect(commits.commits).toHaveLength(1)
    expect(commits.commits[0].message).toBe('fix: fallback to exact head sha')
  })
})
