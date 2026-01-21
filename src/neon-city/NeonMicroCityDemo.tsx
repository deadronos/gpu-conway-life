import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stats } from '@react-three/drei'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { button, folder, useControls } from 'leva'
import { Hud } from './Hud'
import { NeonCity } from './NeonCity'
import { NeonLifeSim } from './NeonLifeSim'
import { useNeonCityStore } from './store'

const GRID_SIZE = 320

export function NeonMicroCityDemo() {
  const [stateTexture, setStateTexture] = useState<THREE.Texture | null>(null)
  const brushDownRef = useRef(false)
  const brushUvRef = useRef(new THREE.Vector2(0.5, 0.5))

  const setPartial = useNeonCityStore((s) => s.setPartial)
  const randomize = useNeonCityStore((s) => s.randomize)
  const clear = useNeonCityStore((s) => s.clear)

  const paused = useNeonCityStore((s) => s.paused)
  const ticksPerSecond = useNeonCityStore((s) => s.ticksPerSecond)
  const stepsPerTick = useNeonCityStore((s) => s.stepsPerTick)
  const ageDecayPerStep = useNeonCityStore((s) => s.ageDecayPerStep)
  const wrapEdges = useNeonCityStore((s) => s.wrapEdges)
  const emissiveGain = useNeonCityStore((s) => s.emissiveGain)
  const heightScale = useNeonCityStore((s) => s.heightScale)
  const bloomIntensity = useNeonCityStore((s) => s.bloomIntensity)
  const bloomThreshold = useNeonCityStore((s) => s.bloomThreshold)
  const bloomSmoothing = useNeonCityStore((s) => s.bloomSmoothing)
  const brushRadius = useNeonCityStore((s) => s.brushRadius)
  const showStats = useNeonCityStore((s) => s.showStats)

  useControls({
    Simulation: folder(
      {
        paused: {
          value: paused,
          onChange: (v: boolean) => setPartial({ paused: v }),
        },
        ticksPerSecond: {
          value: ticksPerSecond,
          min: 1,
          max: 240,
          step: 1,
          onChange: (v: number) => setPartial({ ticksPerSecond: v }),
        },
        stepsPerTick: {
          value: stepsPerTick,
          min: 1,
          max: 8,
          step: 1,
          onChange: (v: number) => setPartial({ stepsPerTick: v }),
        },
        ageDecayPerStep: {
          value: ageDecayPerStep,
          min: 0.0,
          max: 0.25,
          step: 0.005,
          onChange: (v: number) => setPartial({ ageDecayPerStep: v }),
        },
        wrapEdges: {
          value: wrapEdges,
          onChange: (v: boolean) => setPartial({ wrapEdges: v }),
        },
        randomize: button(() => randomize()),
        clear: button(() => clear()),
      },
      { collapsed: false },
    ),

    Visuals: folder(
      {
        emissiveGain: {
          value: emissiveGain,
          min: 0,
          max: 12,
          step: 0.1,
          onChange: (v: number) => setPartial({ emissiveGain: v }),
        },
        heightScale: {
          value: heightScale,
          min: 0.5,
          max: 10,
          step: 0.1,
          onChange: (v: number) => setPartial({ heightScale: v }),
        },
        bloomIntensity: {
          value: bloomIntensity,
          min: 0,
          max: 5,
          step: 0.05,
          onChange: (v: number) => setPartial({ bloomIntensity: v }),
        },
        bloomThreshold: {
          value: bloomThreshold,
          min: 0,
          max: 2,
          step: 0.01,
          onChange: (v: number) => setPartial({ bloomThreshold: v }),
        },
        bloomSmoothing: {
          value: bloomSmoothing,
          min: 0,
          max: 1,
          step: 0.01,
          onChange: (v: number) => setPartial({ bloomSmoothing: v }),
        },
      },
      { collapsed: false },
    ),

    Brush: folder(
      {
        brushRadius: {
          value: brushRadius,
          min: 1,
          max: 40,
          step: 1,
          onChange: (v: number) => setPartial({ brushRadius: v }),
        },
      },
      { collapsed: true },
    ),

    Debug: folder(
      {
        showStats: {
          value: showStats,
          onChange: (v: boolean) => setPartial({ showStats: v }),
        },
      },
      { collapsed: true },
    ),
  })

  // Expose a test-only setter to allow e2e tests to toggle store values easily
  // (Playwright will use `window.__neonSetPartial` to change `ticksPerSecond` or `paused`)
  // This is intentionally simple and test-scoped.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any).__neonSetPartial = setPartial

  // Runtime feature detection for float render targets using a temporary WebGL2 context
  const floatRTSupported = useNeonCityStore((s) => s.floatRTSupported)
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const c = document.createElement('canvas')
      const gl = c.getContext('webgl2') as WebGL2RenderingContext | null
      const supported = !!(gl && gl.getExtension && gl.getExtension('EXT_color_buffer_float'))
      if (!supported) setPartial({ floatRTSupported: false, paused: true })
    } catch (e) {
      setPartial({ floatRTSupported: false, paused: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <div className="canvasWrap" data-testid="canvasWrap">
        <Canvas camera={{ position: [200, 250, 200], fov: 45 }} dpr={[1, 2]}>
          <color attach="background" args={[0x050508]} />
          <ambientLight intensity={0.2} />
          <OrbitControls makeDefault enablePan={false} maxPolarAngle={Math.PI * 0.49} />
          {showStats ? <Stats /> : null}

          {floatRTSupported ? (
            <>
              <NeonLifeSim
                gridSize={GRID_SIZE}
                onTexture={setStateTexture}
                brushDownRef={brushDownRef}
                brushUvRef={brushUvRef}
              />

              {stateTexture ? <NeonCity gridSize={GRID_SIZE} stateTexture={stateTexture} /> : null}
            </>
          ) : null}

          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0, 0]}
            onPointerDown={(e) => {
              brushDownRef.current = true
              brushUvRef.current.set(e.uv?.x ?? 0.5, e.uv?.y ?? 0.5)
            }}
            onPointerUp={() => {
              brushDownRef.current = false
            }}
            onPointerMove={(e) => {
              if (!brushDownRef.current) return
              brushUvRef.current.set(e.uv?.x ?? 0.5, e.uv?.y ?? 0.5)
            }}
          >
            <planeGeometry args={[GRID_SIZE, GRID_SIZE]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>

          <EffectComposer multisampling={0}>
            <Bloom
              intensity={bloomIntensity}
              threshold={bloomThreshold}
              smoothing={bloomSmoothing}
              mipmapBlur
            />
          </EffectComposer>
        </Canvas>
      </div>

      <Hud gridSize={GRID_SIZE} />
    </>
  )
}
