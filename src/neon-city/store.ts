import { create } from 'zustand'

export type NeonCitySettings = {
  paused: boolean
  ticksPerSecond: number
  stepsPerTick: number

  // Simulation
  ageDecayPerStep: number
  ageDurationSeconds: number
  wrapEdges: boolean

  // Rendering
  emissiveGain: number
  heightScale: number

  // Bloom
  bloomIntensity: number
  bloomThreshold: number
  bloomSmoothing: number

  // Brush
  brushRadius: number

  // Debug
  showStats: boolean
  // Runtime feature detection
  floatRTSupported: boolean
  // Age configuration
  ageDurationSeconds: number
  useAgeDuration: boolean

  // Cell size (world units)
  cellSize: number

  // Actions
  resetNonce: number
  resetMode: 'random' | 'clear'
  randomize: () => void
  clear: () => void
  setPartial: (next: Partial<NeonCitySettings>) => void
}

export const useNeonCityStore = create<NeonCitySettings>((set) => ({
  paused: false,
  ticksPerSecond: 30,
  stepsPerTick: 1,

  ageDecayPerStep: 0.03,
  // Age duration in seconds (controls how long a cell ages from 1 -> 0)
  ageDurationSeconds: 4.0,
  useAgeDuration: true,
  cellSize: 10.0,
  wrapEdges: true,

  emissiveGain: 5.0,
  heightScale: 20.0,

  bloomIntensity: 1.2,
  bloomThreshold: 0.15,
  bloomSmoothing: 0.2,

  brushRadius: 10,

  showStats: false,

  // Runtime feature detection
  floatRTSupported: true,

  resetNonce: 0,
  resetMode: 'random',
  randomize: () => set((s) => ({ resetNonce: s.resetNonce + 1, resetMode: 'random' })),
  clear: () => set((s) => ({ resetNonce: s.resetNonce + 1, resetMode: 'clear' })),
  setPartial: (next) => set(next as Partial<NeonCitySettings>),
}))
