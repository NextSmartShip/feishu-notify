import * as core from '@actions/core'
import getActionOptions from './action-options'
import getWorkFlow from './api/workflow'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const { owner, repo, run_id, targetGroup, workflowRunJson, ref, refType } =
      getActionOptions()
    const params = {
      owner,
      repo,
      run_id,
      targetGroup,
      workflowRunJson,
      ref,
      refType
    }
    await getWorkFlow(params)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
