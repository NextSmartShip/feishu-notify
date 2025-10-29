import { EnvironmentEnum } from 'src/config';
import { stop } from '../utils';
import { fetchJobs, fetchWorkFlow } from './index';
import push from './push';

interface Props {
  owner: string;
  repo: string;
  run_id: string | number;
  environment: string;
  status?: string;
}

const getWorkFlow = async ({
  owner,
  repo,
  run_id,
  environment,
  status,
  ...props
}: Props) => {
  if (!repo || run_id === '-1')
    throw new Error('参数丢失，请检查repo和run_id是否同时传入');

  try {
    let buildJobCompleted = false;
    while (!buildJobCompleted) {
      const jobsResponse = await fetchJobs({
        owner,
        repo,
        run_id
      });
      const buildJob = jobsResponse.jobs.find(job => {
        console.log('获取每个job的状态：', job.name, JSON.stringify(job));

        return job.name === 'build';
      });

      if (buildJob && buildJob.status === 'completed') {
        buildJobCompleted = true;
      } else {
        await stop(3000);
      }
    }

    const payload = await fetchWorkFlow({
      owner,
      repo,
      run_id
    });

    await push(payload, environment as EnvironmentEnum, status);
  } catch (error) {
    console.log('查看请求by错误时：', error);
  }
};

export default getWorkFlow;
