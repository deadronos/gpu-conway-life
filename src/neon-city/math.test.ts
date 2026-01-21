import { describe, expect, it } from 'vitest'
import { tpsToTickMs, computeAgeDecayPerStep } from './math'

describe('tpsToTickMs', () => {
  it('converts 60 TPS to ~16.666ms', () => {
    expect(tpsToTickMs(60)).toBeCloseTo(16.666, 2)
  })

  it('clamps very small TPS', () => {
    expect(tpsToTickMs(0)).toBeCloseTo(10000, 0)
  })
})

describe('computeAgeDecayPerStep', () => {
  it('computes decay for 4s at 30 TPS, 1 step/tick', () => {
    const decay = computeAgeDecayPerStep(4, 30, 1)
    expect(decay).toBeCloseTo(1 / (4 * 30 * 1), 8)
  })

  it('clamps very small durations', () => {
    const decay = computeAgeDecayPerStep(0, 60, 1)
    expect(decay).toBeGreaterThan(0)
  })
})
