// * @param {String} body.owner
// * @param {String} body.repo
// * @param {String} body.commit_sha
export interface CommitsType {
  owner: string
  repo: string
  commit_sha: string
  head_commit?: WorkflowRunHeadCommit
  ref?: string
  refType?: string
}
export type CommitKeysType = keyof CommitsType
export type ReqPullCommitsByShaParams_Type = CommitsType
export type ReqFetchCommitParams_Type = CommitsType
export type PullCommitsByShaParams_keys_Type = CommitKeysType

export interface ResApiFetchCommitsItem {
  commit: {
    message: string
    author: { name: string; email: string; date: string }
  }
  html_url: string
  author: { login: string; html_url: string } | null
  parents?: { sha: string }[]
}
export interface FormatCommitsItem {
  date: string
  message: string
  html_url: string
  author: { login: string; html_url: string } | null
}

export interface FormatCommitsResult {
  commits: FormatCommitsItem[]
  compareUrl: string
  currentTag: string
  previousTag: string
}

export interface RepositoryTagItem {
  name: string
  commit: {
    sha: string
    url: string
  }
}

export interface FetchRepositoryTagsParams {
  owner: string
  repo: string
  page: number
  per_page: number
}

export interface FetchCompareCommitsParams {
  owner: string
  repo: string
  base: string
  head: string
}

export interface CompareCommitsResponse {
  html_url: string
  commits: ResApiFetchCommitsItem[]
}

export interface ActionRefContext {
  ref?: string
  refType?: string
}

export interface WorkflowRunHeadCommit {
  message?: string
  timestamp?: string
  author?: {
    name?: string
    email?: string
    date?: string
    username?: string
  }
}

export type TargetGroup = 'auto' | 'personal'
export type LogicalProject = 'auto' | 'oms' | 'wms' | 'pda'

// Jobs:
export interface JobItemType {
  name?: string
  status?: string
  conclusion?: string | null
  head_sha?: string
  html_url: string
  created_at?: string
  completed_at?: string
}

export interface JobType {
  total_count: number
  jobs: JobItemType[]
}
export interface WorkFlowDuration {
  run_duration_ms: number
  [key: string]:
    | number
    | {
        total_ms: number
        jsbs: number // job数量
      }
}
