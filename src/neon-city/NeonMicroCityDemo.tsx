import type { ReactNode } from 'react';
import { Component, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stats } from '@react-three/drei';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { button, folder, useControls } from 'leva';
import { Hud } from './Hud';
import { NeonCity } from './NeonCity';
import { NeonLifeSimPass } from '../neon-sim/NeonLifeSimPass';
import { useNeonCityStore } from './store';
import { detectFloatRTSupport, shouldForceError, shouldForceUnsupported } from './capabilities';
import { RuntimeErrorOverlay } from './RuntimeErrorOverlay';
import { UnsupportedOverlay } from './UnsupportedOverlay';

const GRID_SIZE = 320;

class CanvasErrorBoundary extends Component<
  { onError: (error: unknown) => void; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

function AutoCamera({ cellSize, gridSize }: { cellSize: number; gridSize: number }) {
  const camera = useThree(s => s.camera);

  useEffect(() => {
    const cs = Math.max(0.1, cellSize);

    // Keep the camera framing consistent as the world scale changes.
    camera.position.set(200 * cs, 250 * cs, 200 * cs);

    // Default PerspectiveCamera far=2000, which clips the whole scene when cs is large.
    // Compute near/far relative to world extent to avoid a black screen.
    const extent = gridSize * cs;
    const near = Math.max(0.1, cs * 0.1);
    const far = Math.max(5000, 400 * cs + extent * 4);

    // `camera` is expected to be a PerspectiveCamera here, but keep it defensive.
    if ('near' in camera && 'far' in camera) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (camera as any).near = near;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (camera as any).far = far;
    }

    if ('updateProjectionMatrix' in camera) {
      camera.updateProjectionMatrix();
    }
  }, [camera, cellSize, gridSize]);

  return null;
}

export function NeonMicroCityDemo() {
  const [stateTexture, setStateTexture] = useState<THREE.Texture | null>(null);
  const [forcedUnsupported] = useState(() => shouldForceUnsupported());
  const [forcedError] = useState(() => shouldForceError());
  const [runtimeError, setRuntimeError] = useState<string | null>(() =>
    forcedError ? 'A WebGL error was forced for testing.' : null,
  );
  const brushDownRef = useRef(false);
  const brushUvRef = useRef(new THREE.Vector2(0.5, 0.5));
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const contextLostHandlerRef = useRef<((e: Event) => void) | null>(null);

  const setPartial = useNeonCityStore(s => s.setPartial);
  const randomize = useNeonCityStore(s => s.randomize);
  const clear = useNeonCityStore(s => s.clear);

  const paused = useNeonCityStore(s => s.paused);
  const ticksPerSecond = useNeonCityStore(s => s.ticksPerSecond);
  const stepsPerTick = useNeonCityStore(s => s.stepsPerTick);
  const ageDecayPerStep = useNeonCityStore(s => s.ageDecayPerStep);
  const ageDurationSeconds = useNeonCityStore(s => s.ageDurationSeconds);
  const useAgeDuration = useNeonCityStore(s => s.useAgeDuration);
  const wrapEdges = useNeonCityStore(s => s.wrapEdges);
  const emissiveGain = useNeonCityStore(s => s.emissiveGain);
  const heightScale = useNeonCityStore(s => s.heightScale);
  const bloomIntensity = useNeonCityStore(s => s.bloomIntensity);
  const bloomThreshold = useNeonCityStore(s => s.bloomThreshold);
  const bloomSmoothing = useNeonCityStore(s => s.bloomSmoothing);
  const brushRadius = useNeonCityStore(s => s.brushRadius);
  const showStats = useNeonCityStore(s => s.showStats);
  const cellSize = useNeonCityStore(s => s.cellSize);
  const resetNonce = useNeonCityStore(s => s.resetNonce);
  const resetMode = useNeonCityStore(s => s.resetMode);

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
        cellSize: {
          value: cellSize,
          min: 1,
          max: 50,
          step: 1,
          onChange: (v: number) => setPartial({ cellSize: v }),
        },
        useAgeDuration: {
          value: useAgeDuration,
          onChange: (v: boolean) => setPartial({ useAgeDuration: v }),
        },
        ageDurationSeconds: {
          value: ageDurationSeconds,
          min: 0.5,
          max: 60,
          step: 0.5,
          onChange: (v: number) => setPartial({ ageDurationSeconds: v }),
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
          max: 50,
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
  });

  // Expose a test-only setter to allow e2e tests to toggle store values easily.
  // (Playwright will use `window.__neonSetPartial` to change `ticksPerSecond` or `paused`.)
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__neonSetPartial = setPartial;
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).__neonSetPartial;
    };
  }, [setPartial]);

  // Runtime feature detection for float render targets.
  // Must use the actual R3F WebGL context created by <Canvas>.
  const floatRTSupported = useNeonCityStore(s => s.floatRTSupported);

  useEffect(() => {
    if (!forcedUnsupported) return;
    setPartial({ floatRTSupported: false, paused: true });
  }, [forcedUnsupported, setPartial]);

  useEffect(() => {
    if (!runtimeError) return;
    setPartial({ paused: true });
  }, [runtimeError, setPartial]);

  useEffect(() => {
    return () => {
      if (canvasElRef.current && contextLostHandlerRef.current) {
        canvasElRef.current.removeEventListener('webglcontextlost', contextLostHandlerRef.current);
      }
    };
  }, []);

  return (
    <>
      <div className="canvasWrap" data-testid="canvasWrap">
        <CanvasErrorBoundary
          onError={() => {
            setRuntimeError('A WebGL error occurred while initializing the demo.');
          }}
        >
          <Canvas
            camera={{ position: [200 * cellSize, 250 * cellSize, 200 * cellSize], fov: 45 }}
            dpr={[1, 2]}
            onCreated={({ gl }) => {
              canvasElRef.current = gl.domElement;

              if (!contextLostHandlerRef.current) {
                contextLostHandlerRef.current = (e: Event) => {
                  if ('preventDefault' in e) (e as Event).preventDefault();
                  setRuntimeError('WebGL context lost. Reload to try again.');
                };
              }

              gl.domElement.addEventListener('webglcontextlost', contextLostHandlerRef.current);

              if (forcedUnsupported) return;
              if (forcedError) return;

              try {
                const supported = detectFloatRTSupport(gl);
                if (!supported) setPartial({ floatRTSupported: false, paused: true });
                else setPartial({ floatRTSupported: true });
              } catch {
                setRuntimeError('A WebGL error occurred while initializing the demo.');
                setPartial({ floatRTSupported: false, paused: true });
              }
            }}
          >
            <color attach="background" args={[0x050508]} />
            <ambientLight intensity={0.2} />
            <AutoCamera cellSize={cellSize} gridSize={GRID_SIZE} />
            <OrbitControls makeDefault enablePan={false} maxPolarAngle={Math.PI * 0.49} />
            {showStats ? <Stats /> : null}

            {floatRTSupported && !forcedUnsupported && !runtimeError ? (
              <>
                <NeonLifeSimPass
                  gridSize={GRID_SIZE}
                  paused={paused}
                  ticksPerSecond={ticksPerSecond}
                  stepsPerTick={stepsPerTick}
                  wrapEdges={wrapEdges}
                  useAgeDuration={useAgeDuration}
                  ageDurationSeconds={ageDurationSeconds}
                  ageDecayPerStep={ageDecayPerStep}
                  resetNonce={resetNonce}
                  resetMode={resetMode}
                  brushDownRef={brushDownRef}
                  brushUvRef={brushUvRef}
                  brushRadiusPx={brushRadius}
                  onTexture={tex => {
                    setStateTexture(tex);
                    setPartial({ hasStateTexture: !!tex });
                  }}
                />

                {stateTexture ? (
                  <NeonCity gridSize={GRID_SIZE} stateTexture={stateTexture} cellSize={cellSize} />
                ) : null}
              </>
            ) : null}

            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, 0, 0]}
              onPointerDown={e => {
                brushDownRef.current = true;
                // Invert Y because texture v-space (0..1) in shader assumes bottom-left origin
                // while pointer UV may use top-left depending on camera/geometry orientation.
                const ux = e.uv?.x ?? 0.5;
                const uy = e.uv?.y ?? 0.5;
                brushUvRef.current.set(ux, 1 - uy);
              }}
              onPointerUp={() => {
                brushDownRef.current = false;
              }}
              onPointerMove={e => {
                if (!brushDownRef.current) return;
                const ux = e.uv?.x ?? 0.5;
                const uy = e.uv?.y ?? 0.5;
                brushUvRef.current.set(ux, 1 - uy);
              }}
            >
              <planeGeometry args={[GRID_SIZE * cellSize, GRID_SIZE * cellSize]} />
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
        </CanvasErrorBoundary>
      </div>

      {runtimeError ? (
        <RuntimeErrorOverlay message={runtimeError} />
      ) : !floatRTSupported || forcedUnsupported ? (
        <UnsupportedOverlay />
      ) : null}

      <Hud gridSize={GRID_SIZE} />
    </>
  );
}
