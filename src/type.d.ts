// * @param {String} body.owner
// * @param {String} body.repo
// * @param {String} body.commit_sha
export interface CommitsType {
  owner: string
  repo: string
  commit_sha: string
}
export type CommitKeysType = keyof CommitsType
export type ReqPullCommitsByShaParams_Type = CommitsType
export type ReqFetchCommitParams_Type = CommitsType
export type PullCommitsByShaParams_keys_Type = CommitKeysType

export interface ResApiFetchCommitsItem {
  commit: { message: string }
  html_url: string
}
export interface FormatCommitsItem {
  message: string
  html_url: string
}
export type CommitKeysItemType = {
  // 分支名
  title: string
  commits_url: string
}

// Jobs:
export interface JobItemType {
  head_sha: string
  html_url: string
  created_at: string
  completed_at: string
}

export interface JobType {
  total_count: number
  jobs: JobItemType[]
}
export interface WorkFlowDuration {
  run_duration_ms: number
}
