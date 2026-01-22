import * as THREE from 'three'
import { computeAgeDecayPerStep, tpsToTickMs } from './math'
import { simFrag, simVert } from './simShaders'

export type NeonLifeSimResetMode = 'none' | 'clear' | 'random'

export type NeonLifeSimRunnerOptions = {
  gridSize: number

  // Render target options (defaults match existing app)
  type?: THREE.TextureDataType
  format?: THREE.PixelFormat
  minFilter?: THREE.MinificationTextureFilter
  magFilter?: THREE.MagnificationTextureFilter

  // If provided, initializes by applying a reset before first step.
  initialState?: Exclude<NeonLifeSimResetMode, 'none'>
  initialSeed?: number
}

export type NeonLifeSimRunnerParams = {
  ticksPerSecond: number
  stepsPerTick: number
  wrapEdges: boolean

  // Age decay: either explicit per-step, or derived from a duration.
  useAgeDuration: boolean
  ageDurationSeconds: number
  ageDecayPerStep: number
}

export type NeonLifeSimBrush = {
  down: boolean
  uv: { x: number; y: number }
  radiusPx: number
}

export type NeonLifeSimRunner = {
  readonly gridSize: number
  readonly texture: THREE.Texture

  /**
   * Advance simulation based on `deltaSeconds` using the configured tick parameters.
   * Returns the current output texture after stepping.
   */
  step(deltaSeconds: number): THREE.Texture

  /**
   * Apply an immediate reset. `random` supports an explicit seed for reproducibility.
   */
  reset(mode: Exclude<NeonLifeSimResetMode, 'none'>, seed?: number): void

  setBrush(next: Partial<NeonLifeSimBrush>): void
  setParams(next: Partial<NeonLifeSimRunnerParams>): void
  dispose(): void
}

const DEFAULT_PARAMS: NeonLifeSimRunnerParams = {
  ticksPerSecond: 30,
  stepsPerTick: 1,
  wrapEdges: true,

  useAgeDuration: true,
  ageDurationSeconds: 4.0,
  ageDecayPerStep: 0.03,
}

const DEFAULT_BRUSH: NeonLifeSimBrush = {
  down: false,
  uv: { x: 0.5, y: 0.5 },
  radiusPx: 10,
}

export function createNeonLifeSimRunner(
  gl: Pick<THREE.WebGLRenderer, 'setRenderTarget' | 'render'>,
  options: NeonLifeSimRunnerOptions,
): NeonLifeSimRunner {
  const gridSize = options.gridSize
  const size = new THREE.Vector2(gridSize, gridSize)

  const rtOpts: THREE.RenderTargetOptions = {
    type: options.type ?? THREE.FloatType,
    format: options.format ?? THREE.RGBAFormat,
    minFilter: options.minFilter ?? THREE.NearestFilter,
    magFilter: options.magFilter ?? THREE.NearestFilter,
    depthBuffer: false,
    stencilBuffer: false,
  }

  const rtA = new THREE.WebGLRenderTarget(gridSize, gridSize, rtOpts)
  const rtB = new THREE.WebGLRenderTarget(gridSize, gridSize, rtOpts)

  // Simulation pass
  const simScene = new THREE.Scene()
  const simCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

  const simMat = new THREE.RawShaderMaterial({
    glslVersion: THREE.GLSL3,
    vertexShader: simVert,
    fragmentShader: simFrag,
    uniforms: {
      uPrev: { value: rtA.texture },
      uTexSize: { value: size },
      uAgeDecay: { value: DEFAULT_PARAMS.ageDecayPerStep },
      uWrap: { value: DEFAULT_PARAMS.wrapEdges ? 1 : 0 },
      uResetMode: { value: 0 },
      uResetSeed: { value: options.initialSeed ?? Math.random() * 1000 },
      uBrushDown: { value: 0 },
      uBrushUv: { value: new THREE.Vector2(DEFAULT_BRUSH.uv.x, DEFAULT_BRUSH.uv.y) },
      uBrushRadiusPx: { value: DEFAULT_BRUSH.radiusPx },
    },
  })

  const quadGeo = new THREE.PlaneGeometry(2, 2)
  const quad = new THREE.Mesh(quadGeo, simMat)
  simScene.add(quad)

  let ping: 'A' | 'B' = 'A'
  let accMs = 0

  let params: NeonLifeSimRunnerParams = { ...DEFAULT_PARAMS }
  let brush: NeonLifeSimBrush = { ...DEFAULT_BRUSH }

  function currentRT() {
    return ping === 'A' ? rtA : rtB
  }

  function otherRT() {
    return ping === 'A' ? rtB : rtA
  }

  function applyParamsToUniforms() {
    if (params.useAgeDuration) {
      const computed = computeAgeDecayPerStep(
        params.ageDurationSeconds,
        params.ticksPerSecond,
        params.stepsPerTick,
      )
      simMat.uniforms.uAgeDecay.value = computed
    } else {
      simMat.uniforms.uAgeDecay.value = params.ageDecayPerStep
    }

    simMat.uniforms.uWrap.value = params.wrapEdges ? 1 : 0
  }

  function applyBrushToUniforms() {
    simMat.uniforms.uBrushRadiusPx.value = brush.radiusPx
    simMat.uniforms.uBrushDown.value = brush.down ? 1 : 0
    simMat.uniforms.uBrushUv.value.set(brush.uv.x, brush.uv.y)
  }

  function stepOnce() {
    const src = currentRT()
    const dst = otherRT()

    simMat.uniforms.uPrev.value = src.texture

    applyParamsToUniforms()
    applyBrushToUniforms()

    gl.setRenderTarget(dst)
    gl.render(simScene, simCam)
    gl.setRenderTarget(null)

    ping = ping === 'A' ? 'B' : 'A'
  }

  // Initialize by forcing a reset if requested.
  if (options.initialState) {
    simMat.uniforms.uResetSeed.value = options.initialSeed ?? Math.random() * 1000
    simMat.uniforms.uResetMode.value = options.initialState === 'clear' ? 1 : 2
    stepOnce()
    simMat.uniforms.uResetMode.value = 0
  }

  return {
    gridSize,

    get texture() {
      return currentRT().texture
    },

    step(deltaSeconds) {
      const tickMs = tpsToTickMs(params.ticksPerSecond)
      accMs += deltaSeconds * 1000

      while (accMs >= tickMs) {
        accMs -= tickMs
        for (let i = 0; i < params.stepsPerTick; i++) stepOnce()
      }

      return currentRT().texture
    },

    reset(mode, seed) {
      simMat.uniforms.uResetSeed.value = seed ?? Math.random() * 1000
      simMat.uniforms.uResetMode.value = mode === 'clear' ? 1 : 2
      stepOnce()
      simMat.uniforms.uResetMode.value = 0
    },

    setBrush(next) {
      brush = {
        ...brush,
        ...next,
        uv: {
          x: next.uv?.x ?? brush.uv.x,
          y: next.uv?.y ?? brush.uv.y,
        },
      }
    },

    setParams(next) {
      params = { ...params, ...next }
    },

    dispose() {
      quadGeo.dispose()
      simMat.dispose()
      rtA.dispose()
      rtB.dispose()
    },
  }
}
