export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function tpsToTickMs(tps: number) {
  const safeTps = clamp(tps, 0.1, 240)
  return 1000 / safeTps
}

/**
 * Compute the per-step age decay value so that age goes from 1 -> 0 over
 * approximately `ageDurationSeconds` seconds given ticksPerSecond and stepsPerTick.
 */
export function computeAgeDecayPerStep(
  ageDurationSeconds: number,
  ticksPerSecond: number,
  stepsPerTick: number,
) {
  const secs = Math.max(0.1, ageDurationSeconds)
  const tps = Math.max(0.1, ticksPerSecond)
  const spt = Math.max(1, Math.floor(stepsPerTick))
  const steps = secs * tps * spt
  // decay per step = 1 / steps, clamp to reasonable range
  return clamp(1 / steps, 1e-6, 1.0)
}
