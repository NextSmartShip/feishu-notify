import { getOpenIdSmokeTargets, sendOpenIdSmoke } from '../src/openid-smoke'

const target = process.argv[2] || 'all'
const timestamp = new Date().toISOString()

const main = async () => {
  const targets = getOpenIdSmokeTargets(target)
  const failures: string[] = []

  for (const user of targets) {
    try {
      console.log(`开始校验 ${user.name} (${user.feishu_open_id})`)
      await sendOpenIdSmoke(user, timestamp)
      console.log(`校验通过 ${user.name}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      failures.push(message)
      console.error(`校验失败 ${user.name}: ${message}`)
    }
  }

  if (failures.length > 0) {
    throw new Error(failures.join('\n'))
  }

  console.log(`全部校验通过，共 ${targets.length} 人`)
}

const run = async () => {
  try {
    await main()
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  }
}

void run()
