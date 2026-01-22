import type { MutableRefObject } from 'react'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { createNeonLifeSimRunner } from './NeonLifeSimRunner'
import type { NeonLifeRulePreset } from './rules'

export type NeonLifeSimPassProps = {
  gridSize: number

  paused?: boolean
  ticksPerSecond?: number
  stepsPerTick?: number
  wrapEdges?: boolean

  useAgeDuration?: boolean
  ageDurationSeconds?: number
  ageDecayPerStep?: number

  rule?: NeonLifeRulePreset
  /** Only used when `rule === 'custom'` */
  ruleString?: string

  initialState?: 'random' | 'clear'
  initialSeed?: number

  /**
   * When `resetNonce` changes, a reset will be performed using `resetMode`.
   * This mirrors the existing Neon Micro-City store pattern.
   */
  resetNonce?: number
  resetMode?: 'random' | 'clear'
  resetSeed?: number

  brushDownRef?: MutableRefObject<boolean>
  brushUvRef?: MutableRefObject<THREE.Vector2>
  brushRadiusPx?: number

  onTexture?: (tex: THREE.Texture) => void
}

/**
 * R3F wrapper that runs the reusable sim runner in the render loop.
 * This component renders nothing.
 */
export function NeonLifeSimPass({
  gridSize,
  paused = false,
  ticksPerSecond = 30,
  stepsPerTick = 1,
  wrapEdges = true,
  useAgeDuration = true,
  ageDurationSeconds = 4.0,
  ageDecayPerStep = 0.03,
  rule = 'life',
  ruleString,
  initialState = 'random',
  initialSeed,
  resetNonce,
  resetMode = 'random',
  resetSeed,
  brushDownRef,
  brushUvRef,
  brushRadiusPx,
  onTexture,
}: NeonLifeSimPassProps) {
  const gl = useThree((s) => s.gl)

  const runner = useMemo(() => {
    return createNeonLifeSimRunner(gl, {
      gridSize,
      initialState,
      initialSeed,
    })
  }, [gl, gridSize, initialSeed, initialState])

  const lastTextureRef = useRef<THREE.Texture | null>(null)
  const lastResetNonceRef = useRef<number | null>(null)

  useEffect(() => {
    runner.setParams({
      ticksPerSecond,
      stepsPerTick,
      wrapEdges,
      useAgeDuration,
      ageDurationSeconds,
      ageDecayPerStep,
      rule,
      ruleString,
    })
  }, [
    runner,
    ticksPerSecond,
    stepsPerTick,
    wrapEdges,
    useAgeDuration,
    ageDurationSeconds,
    ageDecayPerStep,
    rule,
    ruleString,
  ])

  useEffect(() => {
    const tex = runner.texture
    lastTextureRef.current = tex
    onTexture?.(tex)
  }, [onTexture, runner])

  useEffect(() => {
    return () => {
      runner.dispose()
    }
  }, [runner])

  useEffect(() => {
    if (resetNonce == null) return
    if (lastResetNonceRef.current === resetNonce) return
    lastResetNonceRef.current = resetNonce

    runner.reset(resetMode, resetSeed)
    const tex = runner.texture
    lastTextureRef.current = tex
    onTexture?.(tex)
  }, [onTexture, resetMode, resetNonce, resetSeed, runner])

  useFrame((_, delta) => {
    // Update brush uniforms, even when paused, so users can paint then unpause.
    if (brushRadiusPx != null) runner.setBrush({ radiusPx: brushRadiusPx })

    if (brushDownRef && brushUvRef) {
      runner.setBrush({
        down: !!brushDownRef.current,
        uv: { x: brushUvRef.current.x, y: brushUvRef.current.y },
      })
    }

    if (paused) return

    const tex = runner.step(delta)
    if (lastTextureRef.current !== tex) {
      lastTextureRef.current = tex
      onTexture?.(tex)
    }
  })

  return null
}
