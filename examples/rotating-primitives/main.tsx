import { StrictMode, useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Leva, folder, useControls } from 'leva'

import '../../src/index.css'

import { detectFloatRTSupport, shouldForceError, shouldForceUnsupported } from '../../src/neon-city/capabilities'
import { RuntimeErrorOverlay } from '../../src/neon-city/RuntimeErrorOverlay'
import { UnsupportedOverlay } from '../../src/neon-city/UnsupportedOverlay'

import { NeonLifeSimPass } from '../../src/neon-sim/NeonLifeSimPass'
import { createNeonLifeStateMaterial } from '../../src/neon-sim/NeonLifeStateMaterial'
import type { NeonLifeRulePreset } from '../../src/neon-sim/rules'

function Rotating({ children, speed = 0.5 }: { children: React.ReactNode; speed?: number }) {
  const ref = useRef<THREE.Object3D>(null)
  useFrame((_, dt) => {
    const o = ref.current
    if (!o) return
    o.rotation.y += dt * speed
    o.rotation.x += dt * (speed * 0.6)
  })
  return <group ref={ref}>{children}</group>
}

export function Scene() {
  const [stateTexture, setStateTexture] = useState<THREE.Texture | null>(null)
  const [floatRTSupported, setFloatRTSupported] = useState(true)
  const [forcedUnsupported] = useState(() => shouldForceUnsupported())
  const [forcedError] = useState(() => shouldForceError())
  const [runtimeError, setRuntimeError] = useState<string | null>(() =>
    forcedError ? 'A WebGL error was forced for testing.' : null,
  )

  const [materialControls, setMaterialControls] = useState(() => ({
    flipY: false,
    agePower: 1.5,
    gain: 1.0,
    backgroundAlpha: 1.0,
  }))

  const [ruleControls, setRuleControls] = useState(() => ({
    rule: 'life' as NeonLifeRulePreset,
    ruleString: 'B36/S23',
  }))

  useControls({
    Simulation: folder(
      {
        rule: {
          value: ruleControls.rule,
          options: { life: 'life', highlife: 'highlife', custom: 'custom' },
          onChange: (v: NeonLifeRulePreset) => setRuleControls((s) => ({ ...s, rule: v })),
        },
        ruleString: {
          value: ruleControls.ruleString,
          render: () => ruleControls.rule === 'custom',
          onChange: (v: string) => setRuleControls((s) => ({ ...s, ruleString: v })),
        },
      },
      { collapsed: false },
    ),

    Material: folder(
      {
        flipY: {
          value: materialControls.flipY,
          onChange: (v: boolean) => setMaterialControls((s) => ({ ...s, flipY: v })),
        },
        agePower: {
          value: materialControls.agePower,
          min: 0.25,
          max: 4.0,
          step: 0.05,
          onChange: (v: number) => setMaterialControls((s) => ({ ...s, agePower: v })),
        },
        gain: {
          value: materialControls.gain,
          min: 0.1,
          max: 4.0,
          step: 0.05,
          onChange: (v: number) => setMaterialControls((s) => ({ ...s, gain: v })),
        },
        backgroundAlpha: {
          value: materialControls.backgroundAlpha,
          min: 0.0,
          max: 1.0,
          step: 0.05,
          onChange: (v: number) => setMaterialControls((s) => ({ ...s, backgroundAlpha: v })),
        },
      },
      { collapsed: false },
    ),
  })

  // One shared material instance for all meshes.
  const material = useMemo(() => {
    return createNeonLifeStateMaterial({
      flipY: materialControls.flipY,
      backgroundAlpha: materialControls.backgroundAlpha,
      agePower: materialControls.agePower,
      gain: materialControls.gain,
    })
    // We keep a single material instance for all meshes and update uniforms via effects.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!stateTexture) return
    material.uniforms.uState.value = stateTexture
  }, [material, stateTexture])

  useEffect(() => {
    material.uniforms.uFlipY.value = materialControls.flipY ? 1.0 : 0.0
    material.uniforms.uAgePower.value = materialControls.agePower
    material.uniforms.uGain.value = materialControls.gain
    material.uniforms.uBackgroundAlpha.value = materialControls.backgroundAlpha
  }, [material, materialControls])

  return (
    <>
      <Leva collapsed />
      <Canvas
        className="canvasWrap"
        camera={{ position: [0, 1.6, 5.5], fov: 45 }}
        dpr={[1, 2]}
        onCreated={({ gl }) => {
          if (forcedUnsupported) {
            setFloatRTSupported(false)
            return
          }
          if (forcedError) return
          try {
            setFloatRTSupported(detectFloatRTSupport(gl))
          } catch {
            setRuntimeError('A WebGL error occurred while initializing the example.')
            setFloatRTSupported(false)
          }
        }}
      >
        <color attach="background" args={[0x050508]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[3, 5, 2]} intensity={1.3} />

        <OrbitControls makeDefault enablePan={false} />

        {floatRTSupported && !forcedUnsupported && !runtimeError ? (
          <NeonLifeSimPass
            gridSize={1024}
            ticksPerSecond={30}
            stepsPerTick={1}
            wrapEdges
            rule={ruleControls.rule}
            ruleString={ruleControls.rule === 'custom' ? ruleControls.ruleString : undefined}
            onTexture={setStateTexture}
          />
        ) : null}

        <group position={[0, 0.6, 0]}>
          <Rotating speed={0.55}>
            <mesh position={[-2.2, 0, 0]}>
              <boxGeometry args={[1.2, 1.2, 1.2]} />
              <primitive object={material} attach="material" />
            </mesh>
          </Rotating>

          <Rotating speed={0.7}>
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.9, 96, 48]} />
              <primitive object={material} attach="material" />
            </mesh>
          </Rotating>

          <Rotating speed={0.9}>
            <mesh position={[2.2, 0, 0]}>
              <dodecahedronGeometry args={[0.95, 0]} />
              <primitive object={material} attach="material" />
            </mesh>
          </Rotating>
        </group>
      </Canvas>

      {runtimeError ? (
        <RuntimeErrorOverlay message={runtimeError} />
      ) : !floatRTSupported || forcedUnsupported ? (
        <UnsupportedOverlay />
      ) : null}
    </>
  )
}

export function App() {
  return <Scene />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
