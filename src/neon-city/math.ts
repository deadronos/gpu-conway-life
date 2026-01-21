export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function tpsToTickMs(tps: number) {
  const safeTps = clamp(tps, 0.1, 240)
  return 1000 / safeTps
}
