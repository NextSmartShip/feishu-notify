import * as core from '@actions/core'
import getActionOptions from './utils/get-action-options'
import getWorkFlow from './api/getWorkFlow'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const { owner, repo, run_id } = getActionOptions()
    const params = { owner, repo, run_id }
    getWorkFlow(params)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
