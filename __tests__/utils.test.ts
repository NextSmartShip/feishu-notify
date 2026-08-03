import dayjs from 'dayjs'
import { handleDiffTime } from '../src/utils'

describe('handleDiffTime', () => {
  it('includes hours instead of truncating a cross-hour workflow duration', () => {
    expect(
      handleDiffTime('2026-08-03T08:35:36Z', dayjs('2026-08-03T10:00:54Z'))
    ).toBe('🔧 1小时25分钟18秒')
  })

  it('does not add an hour unit for durations under one hour', () => {
    expect(
      handleDiffTime('2026-08-03T08:35:36Z', dayjs('2026-08-03T08:59:54Z'))
    ).toBe('🔧 24分钟18秒')
  })
})
