import type { MutableRefObject } from 'react'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { createPortal, useFrame, useThree } from '@react-three/fiber'
import { useFBO } from '@react-three/drei'
import { useNeonCityStore } from './store'
import { tpsToTickMs } from './math'
import { simFrag, simVert } from './shaders'

type NeonLifeSimProps = {
  gridSize: number
  onTexture: (tex: THREE.Texture) => void
  brushDownRef: MutableRefObject<boolean>
  brushUvRef: MutableRefObject<THREE.Vector2>
}

export function NeonLifeSim({ gridSize, onTexture, brushDownRef, brushUvRef }: NeonLifeSimProps) {
  const gl = useThree((s) => s.gl)
  const size = useMemo(() => new THREE.Vector2(gridSize, gridSize), [gridSize])

  const rtA = useFBO(gridSize, gridSize, {
    type: THREE.FloatType,
    format: THREE.RGBAFormat,
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    depthBuffer: false,
    stencilBuffer: false,
  })
  const rtB = useFBO(gridSize, gridSize, {
    type: THREE.FloatType,
    format: THREE.RGBAFormat,
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    depthBuffer: false,
    stencilBuffer: false,
  })

  const simScene = useMemo(() => new THREE.Scene(), [])
  const simCam = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), [])
  const simMat = useMemo(() => {
    const mat = new THREE.RawShaderMaterial({
      glslVersion: THREE.GLSL3,
      vertexShader: simVert,
      fragmentShader: simFrag,
      uniforms: {
        uPrev: { value: rtA.texture },
        uTexSize: { value: size },
        uAgeDecay: { value: 0.03 },
        uWrap: { value: 1 },
        uResetMode: { value: 2 },
        uResetSeed: { value: Math.random() * 1000 },
        uBrushDown: { value: 0 },
        uBrushUv: { value: new THREE.Vector2(0.5, 0.5) },
        uBrushRadiusPx: { value: 10 },
      },
    })
    return mat
  }, [rtA.texture, size])

  const quad = useMemo(() => {
    const geo = new THREE.PlaneGeometry(2, 2)
    const mesh = new THREE.Mesh(geo, simMat)
    return mesh
  }, [simMat])

  const ping = useRef<'A' | 'B'>('A')
  const accMs = useRef(0)
  const lastResetNonce = useRef<number | null>(null)

  const paused = useNeonCityStore((s) => s.paused)
  const ticksPerSecond = useNeonCityStore((s) => s.ticksPerSecond)
  const stepsPerTick = useNeonCityStore((s) => s.stepsPerTick)
  const ageDecayPerStep = useNeonCityStore((s) => s.ageDecayPerStep)
  const wrapEdges = useNeonCityStore((s) => s.wrapEdges)
  const brushRadius = useNeonCityStore((s) => s.brushRadius)
  const resetNonce = useNeonCityStore((s) => s.resetNonce)
  const resetMode = useNeonCityStore((s) => s.resetMode)

  useEffect(() => {
    return () => {
      quad.geometry.dispose()
      simMat.dispose()
    }
  }, [quad, simMat])

  useEffect(() => {
    // Expose current texture to consumers.
    onTexture((ping.current === 'A' ? rtA : rtB).texture)
  }, [onTexture, rtA, rtB])

  function stepOnce() {
    const src = ping.current === 'A' ? rtA : rtB
    const dst = ping.current === 'A' ? rtB : rtA

    simMat.uniforms.uPrev.value = src.texture
    simMat.uniforms.uAgeDecay.value = ageDecayPerStep
    simMat.uniforms.uWrap.value = wrapEdges ? 1 : 0

    gl.setRenderTarget(dst)
    gl.render(simScene, simCam)
    gl.setRenderTarget(null)

    ping.current = ping.current === 'A' ? 'B' : 'A'
    onTexture((ping.current === 'A' ? rtA : rtB).texture)
  }

  useFrame((_, delta) => {
    // Reset (random/clear)
    if (lastResetNonce.current !== resetNonce) {
      lastResetNonce.current = resetNonce
      simMat.uniforms.uResetSeed.value = Math.random() * 1000
      simMat.uniforms.uResetMode.value = resetMode === 'clear' ? 1 : 2
      stepOnce()
      simMat.uniforms.uResetMode.value = 0
      return
    }

    simMat.uniforms.uBrushRadiusPx.value = brushRadius
    simMat.uniforms.uBrushDown.value = brushDownRef.current ? 1 : 0
    simMat.uniforms.uBrushUv.value.copy(brushUvRef.current)

    if (paused) return

    const tickMs = tpsToTickMs(ticksPerSecond)
    accMs.current += delta * 1000

    while (accMs.current >= tickMs) {
      accMs.current -= tickMs
      for (let i = 0; i < stepsPerTick; i++) stepOnce()
    }
  })

  // Portal keeps the simulation pass isolated from the main scene.
  return createPortal(<primitive object={quad} />, simScene)
}
