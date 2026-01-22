# neon-sim: reuse the Conway sim + material

This repo contains a small reusable module under `src/neon-sim/` that exposes:

- a GPU simulation runner that outputs a `THREE.Texture`
- a mesh-agnostic `ShaderMaterial` to visualize that texture
- an optional React Three Fiber pass component

The goal is to let other Three.js / R3F apps *import* the sim and project it onto arbitrary geometry.

> Note: this repository is not published to npm (by design). "Install" currently means vendoring the module (copying it in) or consuming it from a git checkout.

## Requirements

### Runtime requirements

- WebGL2 + float render targets (`EXT_color_buffer_float`)
- `NearestFilter` sampling (recommended) for crisp cell edges

### Package requirements

Depending on what you use:

- **Core runner + material only (plain Three.js):** `three`
- **R3F pass component:** `three`, `@react-three/fiber`
- **This repo's demos:** also use `@react-three/drei` and `leva` (not required for your app)

## Option A (recommended): copy `src/neon-sim/` into your app

1. Copy the folder:


- from: `gpu-conway-life/src/neon-sim/`
- to: `your-app/src/neon-sim/`

1. Import from your local path:

- `import { createNeonLifeSimRunner } from './neon-sim/NeonLifeSimRunner'`
- `import { createNeonLifeStateMaterial } from './neon-sim/NeonLifeStateMaterial'`
- `import { NeonLifeSimPass } from './neon-sim/NeonLifeSimPass'` (R3F only)

This is the lowest-friction approach and avoids bundler/monorepo setup.

## Option B: consume from a git checkout

If you want to track upstream changes without copying files, you can add this repo as a git submodule or subtree and import the source directly.

### Package manager (git dependency)

You can also add this repo directly as a dependency (pointing at a branch, tag, or commit).

Example `package.json` entry (this repo + `overhaul` branch):

- `"gpu-conway-life": "github:deadronos/gpu-conway-life#overhaul"`

Pin to an exact commit for reproducibility:

- `"gpu-conway-life": "github:deadronos/gpu-conway-life#<commit-sha>"`

Then import the source module from:

- `node_modules/gpu-conway-life/src/neon-sim/...`

**Important:** your bundler/TS config must allow importing TypeScript source from `node_modules` (or from outside your app's `src/`).

### Submodule approach

- Add as a submodule under something like `vendor/gpu-conway-life/`
- Import from `vendor/gpu-conway-life/src/neon-sim/...`

**Important:** your bundler/TS config must allow importing TS from outside your app's `src/`.

For Vite, a common pattern is adding an alias and allowing file access (exact settings vary by project).

## API overview

### State texture layout

The simulation outputs an RGBA float texture:

- `R = alive` (0 or 1)
- `A = age` (0..1)
- `G/B` unused

### Rule variants (Life / HighLife / Custom)

Rules are configured on the **simulation** (runner/pass) and change what gets written into the state texture.
The **material** only visualizes the state texture (`uState`) and does not depend on the rule.

Supported rule presets:

- `rule: 'life'` (classic Life: `B3/S23`) — default
- `rule: 'highlife'` (HighLife: `B36/S23`)
- `rule: 'custom'` with `ruleString: 'B.../S...'`

Custom rule format:

- Must be Life-like notation: `B<digits>/S<digits>` where digits are neighbor counts in `0..8`.
- Example: `B36/S23`
- If `rule` is not `'custom'`, `ruleString` is ignored.
- If `rule` is `'custom'` and `ruleString` is missing or invalid, the simulation runner will throw.

### Core runner (Three-only)

Create a runner:

```ts
import * as THREE from 'three'
import { createNeonLifeSimRunner } from './neon-sim/NeonLifeSimRunner'

const runner = createNeonLifeSimRunner(renderer, {
  gridSize: 256,
  initialState: 'random',
  initialSeed: 123,
})

runner.setParams({
  ticksPerSecond: 30,
  stepsPerTick: 1,
  wrapEdges: true,
  rule: 'life',
  useAgeDuration: true,
  ageDurationSeconds: 4.0,
  // OR: useAgeDuration: false, ageDecayPerStep: 0.03,
})
```

Drive it each frame:

```ts
const clock = new THREE.Clock()

function animate() {
  requestAnimationFrame(animate)
  const dt = clock.getDelta()

  runner.step(dt)
  // runner.texture is always the latest state texture

  renderer.render(scene, camera)
}

animate()
```

Reset (clear or random):

```ts
runner.reset('clear')
runner.reset('random', 42) // reproducible random

// Switch rules at runtime:
runner.setParams({ rule: 'highlife' })

// Custom rule (Life-like notation):
runner.setParams({ rule: 'custom', ruleString: 'B36/S23' })
```

Brush input (optional):

```ts
runner.setBrush({
  down: true,
  uv: { x: 0.5, y: 0.5 },
  radiusPx: 12,
})
```

> UV convention: the sim assumes normalized UVs. Depending on your geometry/picking, you may need `uv.y = 1 - uv.y`.

Dispose when done:

```ts
runner.dispose()
```

### Material (mesh-agnostic)

Use the provided shader material to visualize the state on **any UV-mapped mesh**:

```ts
import { createNeonLifeStateMaterial } from './neon-sim/NeonLifeStateMaterial'

const mat = createNeonLifeStateMaterial({
  stateTexture: runner.texture,
  flipY: false,
  agePower: 1.5,
  gain: 1.0,
  backgroundAlpha: 1.0,
})

// later, if the texture reference changes (ping-pong swap):
mat.uniforms.uState.value = runner.texture
```

`flipY` is provided for UV origin differences.

### R3F usage (recommended for React apps)

In React Three Fiber, mount the sim pass and use its `onTexture` callback:

```tsx
import { useMemo, useState } from 'react'
import * as THREE from 'three'
import { NeonLifeSimPass } from './neon-sim/NeonLifeSimPass'
import { createNeonLifeStateMaterial } from './neon-sim/NeonLifeStateMaterial'

export function MySimOnMesh() {
  const [stateTexture, setStateTexture] = useState<THREE.Texture | null>(null)

  const material = useMemo(
    () => createNeonLifeStateMaterial({ flipY: false, backgroundAlpha: 1.0 }),
    [],
  )

  // Update shader uniform when the ping-pong texture changes
  if (stateTexture) material.uniforms.uState.value = stateTexture

  return (
    <>
      <NeonLifeSimPass gridSize={256} ticksPerSecond={30} onTexture={setStateTexture} />

      {/* Switch rules */}
      {/* <NeonLifeSimPass gridSize={256} rule="highlife" onTexture={setStateTexture} /> */}

      {/* Custom rule */}
      {/* <NeonLifeSimPass gridSize={256} rule="custom" ruleString="B36/S23" onTexture={setStateTexture} /> */}

      <mesh>
        <sphereGeometry args={[1, 128, 64]} />
        <primitive object={material} attach="material" />
      </mesh>
    </>
  )
}
```

If you want store-like resets:

```tsx
<NeonLifeSimPass
  gridSize={256}
  resetNonce={resetNonce}
  resetMode={resetMode} // 'random' | 'clear'
  resetSeed={123}
  onTexture={setStateTexture}
/>
```

## Troubleshooting

### "Unsupported" overlay / black texture

Your environment likely lacks float render targets. Ensure:

- WebGL2 is available
- `EXT_color_buffer_float` is supported
- you are not running in a headless/virtualized GPU environment that reports the extension but fails to render to float targets

This repo performs a small render+readback smoke test in `src/neon-city/capabilities.ts` to catch false positives.

### Upside-down mapping

Use either:

- `flipY: true` in `createNeonLifeStateMaterial`, or
- invert your UVs before passing to the brush (`uv.y = 1 - uv.y`).

### Performance

- Prefer `NearestFilter` on the state texture
- Reduce `gridSize`, `ticksPerSecond`, or `stepsPerTick` if needed
