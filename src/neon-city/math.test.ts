import { describe, expect, it } from 'vitest'
import { tpsToTickMs } from './math'

describe('tpsToTickMs', () => {
  it('converts 60 TPS to ~16.666ms', () => {
    expect(tpsToTickMs(60)).toBeCloseTo(16.666, 2)
  })

  it('clamps very small TPS', () => {
    expect(tpsToTickMs(0)).toBeCloseTo(10000, 0)
  })
})
