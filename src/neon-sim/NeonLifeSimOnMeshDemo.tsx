import { Component, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import * as THREE from 'three'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Stats } from '@react-three/drei'
import { folder, useControls } from 'leva'
import { detectFloatRTSupport, shouldForceError, shouldForceUnsupported } from '../neon-city/capabilities'
import { RuntimeErrorOverlay } from '../neon-city/RuntimeErrorOverlay'
import { UnsupportedOverlay } from '../neon-city/UnsupportedOverlay'
import { NeonLifeSimPass } from './NeonLifeSimPass'
import { createNeonLifeStateMaterial } from './NeonLifeStateMaterial'

const GRID_SIZE = 256

class CanvasErrorBoundary extends Component<
  { onError: (error: unknown) => void; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    this.props.onError(error)
  }

  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}

function AutoCamera() {
  const camera = useThree((s) => s.camera)

  useEffect(() => {
    camera.position.set(0, 1.6, 3.2)
    if ('updateProjectionMatrix' in camera) camera.updateProjectionMatrix()
  }, [camera])

  return null
}

function SimOnSphere({ stateTexture }: { stateTexture: THREE.Texture | null }) {
  const material = useMemo(() => {
    const mat = createNeonLifeStateMaterial({
      stateTexture: stateTexture ?? undefined,
      // Sphere UVs in Three are already bottom-left-ish, but keep a toggle in UI.
      flipY: false,
      backgroundAlpha: 1.0,
      agePower: 1.5,
      gain: 1.0,
    })
    return mat
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!stateTexture) return
    material.uniforms.uState.value = stateTexture
  }, [material, stateTexture])

  const [flipY, setFlipY] = useState(false)
  useControls({
    MeshDemo: folder(
      {
        flipY: {
          value: flipY,
          onChange: (v: boolean) => setFlipY(v),
        },
      },
      { collapsed: false },
    ),
  })

  useEffect(() => {
    material.uniforms.uFlipY.value = flipY ? 1.0 : 0.0
  }, [flipY, material])

  return (
    <mesh>
      <sphereGeometry args={[1.0, 128, 64]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}

export function NeonLifeSimOnMeshDemo() {
  const [stateTexture, setStateTexture] = useState<THREE.Texture | null>(null)
  const [forcedUnsupported] = useState(() => shouldForceUnsupported())
  const [forcedError] = useState(() => shouldForceError())
  const [runtimeError, setRuntimeError] = useState<string | null>(() =>
    forcedError ? 'A WebGL error was forced for testing.' : null,
  )

  const [floatRTSupported, setFloatRTSupported] = useState(true)

  const brushDownRef = useRef(false)
  const brushUvRef = useRef(new THREE.Vector2(0.5, 0.5))

  const [sim, setSim] = useState(() => ({
    paused: false,
    ticksPerSecond: 30,
    stepsPerTick: 1,
    wrapEdges: true,
    useAgeDuration: true,
    ageDurationSeconds: 4.0,
    ageDecayPerStep: 0.03,
    brushRadiusPx: 10,
  }))

  const [showStats, setShowStats] = useState(false)

  useControls({
    Simulation: folder(
      {
        paused: {
          value: sim.paused,
          onChange: (v: boolean) => {
            setSim((s) => ({ ...s, paused: v }))
          },
        },
        ticksPerSecond: {
          value: sim.ticksPerSecond,
          min: 1,
          max: 240,
          step: 1,
          onChange: (v: number) => setSim((s) => ({ ...s, ticksPerSecond: v })),
        },
        stepsPerTick: {
          value: sim.stepsPerTick,
          min: 1,
          max: 8,
          step: 1,
          onChange: (v: number) => setSim((s) => ({ ...s, stepsPerTick: v })),
        },
        wrapEdges: {
          value: sim.wrapEdges,
          onChange: (v: boolean) => setSim((s) => ({ ...s, wrapEdges: v })),
        },
        useAgeDuration: {
          value: sim.useAgeDuration,
          onChange: (v: boolean) => setSim((s) => ({ ...s, useAgeDuration: v })),
        },
        ageDurationSeconds: {
          value: sim.ageDurationSeconds,
          min: 0.5,
          max: 60,
          step: 0.5,
          onChange: (v: number) => setSim((s) => ({ ...s, ageDurationSeconds: v })),
        },
        ageDecayPerStep: {
          value: sim.ageDecayPerStep,
          min: 0.0,
          max: 0.25,
          step: 0.005,
          onChange: (v: number) => setSim((s) => ({ ...s, ageDecayPerStep: v })),
        },
        brushRadiusPx: {
          value: sim.brushRadiusPx,
          min: 1,
          max: 40,
          step: 1,
          onChange: (v: number) => setSim((s) => ({ ...s, brushRadiusPx: v })),
        },
      },
      { collapsed: false },
    ),

    Debug: folder(
      {
        showStats: {
          value: showStats,
          onChange: (v: boolean) => setShowStats(v),
        },
      },
      { collapsed: true },
    ),
  })

  return (
    <>
      <div className="canvasWrap" data-testid="canvasWrap">
        <CanvasErrorBoundary
          onError={() => {
            setRuntimeError('A WebGL error occurred while initializing the demo.')
          }}
        >
          <Canvas
            camera={{ position: [0, 1.6, 3.2], fov: 45 }}
            dpr={[1, 2]}
            onCreated={({ gl }) => {
              if (forcedUnsupported) {
                setFloatRTSupported(false)
                return
              }
              if (forcedError) return

              try {
                const supported = detectFloatRTSupport(gl)
                setFloatRTSupported(supported)
              } catch {
                setRuntimeError('A WebGL error occurred while initializing the demo.')
                setFloatRTSupported(false)
              }
            }}
          >
            <color attach="background" args={[0x050508]} />
            <ambientLight intensity={0.4} />
            <directionalLight position={[2, 4, 2]} intensity={1.4} />
            <AutoCamera />
            <OrbitControls makeDefault enablePan={false} />
            {showStats ? <Stats showPanel={0} /> : null}

            {floatRTSupported && !forcedUnsupported && !runtimeError ? (
              <>
                <NeonLifeSimPass
                  gridSize={GRID_SIZE}
                  paused={sim.paused}
                  ticksPerSecond={sim.ticksPerSecond}
                  stepsPerTick={sim.stepsPerTick}
                  wrapEdges={sim.wrapEdges}
                  useAgeDuration={sim.useAgeDuration}
                  ageDurationSeconds={sim.ageDurationSeconds}
                  ageDecayPerStep={sim.ageDecayPerStep}
                  brushDownRef={brushDownRef}
                  brushUvRef={brushUvRef}
                  brushRadiusPx={sim.brushRadiusPx}
                  onTexture={setStateTexture}
                />

                <SimOnSphere stateTexture={stateTexture} />
              </>
            ) : null}

            {/* invisible hit target for painting */}
            <mesh
              onPointerDown={(e) => {
                brushDownRef.current = true
                const ux = e.uv?.x ?? 0.5
                const uy = e.uv?.y ?? 0.5
                // The sim expects bottom-left uv origin; many pointer UV sources are top-left-ish.
                brushUvRef.current.set(ux, 1 - uy)
              }}
              onPointerUp={() => {
                brushDownRef.current = false
              }}
              onPointerMove={(e) => {
                if (!brushDownRef.current) return
                const ux = e.uv?.x ?? 0.5
                const uy = e.uv?.y ?? 0.5
                brushUvRef.current.set(ux, 1 - uy)
              }}
            >
              <sphereGeometry args={[1.02, 64, 32]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>
          </Canvas>
        </CanvasErrorBoundary>
      </div>

      {runtimeError ? (
        <RuntimeErrorOverlay message={runtimeError} />
      ) : !floatRTSupported || forcedUnsupported ? (
        <UnsupportedOverlay />
      ) : null}
    </>
  )
}
