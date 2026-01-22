import type { MutableRefObject } from 'react'
import * as THREE from 'three'
import { NeonLifeSimPass } from '../neon-sim/NeonLifeSimPass'
import { useNeonCityStore } from './store'

/**
 * Compatibility wrapper.
 *
 * The project originally exposed a store-coupled `NeonLifeSim` component.
 * It now delegates to the reusable `NeonLifeSimPass` while preserving the
 * original prop surface so external imports keep working.
 */
type NeonLifeSimProps = {
  gridSize: number
  onTexture: (tex: THREE.Texture) => void
  brushDownRef: MutableRefObject<boolean>
  brushUvRef: MutableRefObject<THREE.Vector2>
}

export function NeonLifeSim({ gridSize, onTexture, brushDownRef, brushUvRef }: NeonLifeSimProps) {
  const paused = useNeonCityStore((s) => s.paused)
  const ticksPerSecond = useNeonCityStore((s) => s.ticksPerSecond)
  const stepsPerTick = useNeonCityStore((s) => s.stepsPerTick)
  const ageDecayPerStep = useNeonCityStore((s) => s.ageDecayPerStep)
  const ageDurationSeconds = useNeonCityStore((s) => s.ageDurationSeconds)
  const useAgeDuration = useNeonCityStore((s) => s.useAgeDuration)
  const wrapEdges = useNeonCityStore((s) => s.wrapEdges)
  const brushRadius = useNeonCityStore((s) => s.brushRadius)
  const resetNonce = useNeonCityStore((s) => s.resetNonce)
  const resetMode = useNeonCityStore((s) => s.resetMode)

  return (
    <NeonLifeSimPass
      gridSize={gridSize}
      paused={paused}
      ticksPerSecond={ticksPerSecond}
      stepsPerTick={stepsPerTick}
      wrapEdges={wrapEdges}
      useAgeDuration={useAgeDuration}
      ageDurationSeconds={ageDurationSeconds}
      ageDecayPerStep={ageDecayPerStep}
      resetNonce={resetNonce}
      resetMode={resetMode}
      initialState={resetMode}
      brushDownRef={brushDownRef}
      brushUvRef={brushUvRef}
      brushRadiusPx={brushRadius}
      onTexture={onTexture}
    />
  )
}
