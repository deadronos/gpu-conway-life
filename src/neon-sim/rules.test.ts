import { describe, expect, it } from 'vitest'
import { HIGHLIFE_MASKS, LIFE_MASKS, parseLifeLikeRuleString, resolveRuleMasks } from './rules'

describe('rules', () => {
  it('parses standard Life B3/S23', () => {
    expect(parseLifeLikeRuleString('B3/S23')).toEqual(LIFE_MASKS)
  })

  it('parses HighLife B36/S23', () => {
    expect(parseLifeLikeRuleString('B36/S23')).toEqual(HIGHLIFE_MASKS)
  })

  it('resolves presets', () => {
    expect(resolveRuleMasks({ rule: 'life' })).toEqual(LIFE_MASKS)
    expect(resolveRuleMasks({ rule: 'highlife' })).toEqual(HIGHLIFE_MASKS)
  })

  it('resolves custom rule', () => {
    expect(resolveRuleMasks({ rule: 'custom', ruleString: 'B36/S23' })).toEqual(HIGHLIFE_MASKS)
  })

  it('rejects invalid rules', () => {
    expect(() => parseLifeLikeRuleString('life')).toThrow()
    expect(() => parseLifeLikeRuleString('B9/S23')).toThrow()
    expect(() => resolveRuleMasks({ rule: 'custom' })).toThrow()
  })
})
