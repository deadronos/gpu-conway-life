export type NeonLifeRulePreset = 'life' | 'highlife' | 'custom'

export type NeonLifeRuleSpec = {
  rule: NeonLifeRulePreset
  /** Only used when `rule === 'custom'` */
  ruleString?: string
}

export type NeonLifeRuleMasks = {
  birthMask: number
  surviveMask: number
}

export const LIFE_MASKS: NeonLifeRuleMasks = {
  // B3
  birthMask: 1 << 3,
  // S23
  surviveMask: (1 << 2) | (1 << 3),
}

export const HIGHLIFE_MASKS: NeonLifeRuleMasks = {
  // B36
  birthMask: (1 << 3) | (1 << 6),
  // S23
  surviveMask: (1 << 2) | (1 << 3),
}

function assertValidNeighborDigit(n: number) {
  if (!Number.isInteger(n) || n < 0 || n > 8) {
    throw new Error(`Invalid neighbor count '${n}'. Expected an integer 0..8.`)
  }
}

function digitsToMask(digits: number[]): number {
  let mask = 0
  for (const d of digits) {
    assertValidNeighborDigit(d)
    mask |= 1 << d
  }
  return mask
}

/**
 * Parse Life-like rule notation like `B3/S23` or `B36/S23`.
 *
 * - Birth digits after 'B' define counts that cause birth for dead cells.
 * - Survive digits after 'S' define counts that keep alive cells alive.
 */
export function parseLifeLikeRuleString(ruleString: string): NeonLifeRuleMasks {
  const raw = (ruleString ?? '').trim().toUpperCase()
  const m = /^B([0-8]*)\s*\/\s*S([0-8]*)$/.exec(raw)
  if (!m) {
    throw new Error(`Invalid ruleString '${ruleString}'. Expected format like 'B3/S23' or 'B36/S23'.`)
  }

  const birthDigits = m[1].split('').filter(Boolean).map((c) => Number(c))
  const surviveDigits = m[2].split('').filter(Boolean).map((c) => Number(c))

  return {
    birthMask: digitsToMask(birthDigits),
    surviveMask: digitsToMask(surviveDigits),
  }
}

export function resolveRuleMasks(spec?: Partial<NeonLifeRuleSpec>): NeonLifeRuleMasks {
  const rule = spec?.rule ?? 'life'

  if (rule === 'life') return LIFE_MASKS
  if (rule === 'highlife') return HIGHLIFE_MASKS

  // custom
  const rs = spec?.ruleString
  if (!rs) {
    throw new Error("Missing ruleString for rule='custom'.")
  }
  return parseLifeLikeRuleString(rs)
}
