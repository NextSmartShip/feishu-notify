import * as core from '@actions/core';
import getWorkFlow from './api/getWorkFlow';
import getActionOptions from './utils/get-action-options';

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const { owner, repo, run_id, environment, status } =
      await getActionOptions();
    const params = { owner, repo, run_id, environment, status };
    await getWorkFlow(params);
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message);
  }
}
