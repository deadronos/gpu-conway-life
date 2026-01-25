# Design: add-sim-as-material

## Context

The project already contains a simulation pass (`NeonLifeSim`) which runs in an isolated orthographic scene and produces a ping-pong `WebGLRenderTarget` whose `.texture` represents the per-cell simulation state (age, alive state, etc.). `NeonCity` demonstrates how to sample and map colors based on that texture. There is no dedicated, exported material or small factory to simplify re-use by other apps.

## Goals

- Provide a minimal, ergonomic API that consumers can easily plug into existing R3F or Three projects.
- Avoid breaking existing components and keep the change small and low-risk.
- Document and surface important caveats (float RT support, flipY, disposal).

## Non-goals

- Implement advanced projector systems, decals, or world-to-UV remapping. Keep it simple and focused on reusability.

## Decisions

- Provide two layers:
  - **Core (Three-only):** a simulation runner that owns the ping-pong render targets, simulation scene/camera/quad, and exposes a texture + `step()`.
  - **R3F wrapper:** a thin component/hook that drives the core runner in `useFrame` and exposes `texture` via callback/ref.
- Export a ready-to-use `NeonLifeStateMaterial` shader that wraps the sim sampling + a default color mapping (matching the existing aesthetic where feasible).
- Keep the core runner free of Zustand coupling; any UI/store integration lives in wrappers/adapters.
- Avoid attaching the simulation pass to the main scene graph by default; consumers opt into mounting/driving it.

## API surface (suggestion)

- `createNeonLifeSimRunner(gl, options)` (core)
  - Returns: `{ texture, step(deltaSeconds), reset(mode), setBrush({ down, uv, radiusPx }), setParams(params), dispose() }`
  - Notes:
    - `texture` is the current ping-pong target texture.
    - Texture channel layout matches current shaders: `R = alive (0/1)`, `A = age (0..1)`.
  - Construction-time options (examples):
    - `gridSize: number` (required)
    - `format/type/filtering` (optional; default matches current app: float RGBA, nearest)
    - `initialState?: 'random' | 'clear'` and/or `initialSeed?: number` (optional)
  - Runtime parameters via `setParams(params)` (examples):
    - `paused?: boolean` (optional; wrapper may handle)
    - `ticksPerSecond: number`
    - `stepsPerTick: number`
    - `wrapEdges: boolean`
    - Age decay control:
      - either `ageDecayPerStep: number`
      - or `useAgeDuration: true` + `ageDurationSeconds: number`
  - Brush input via `setBrush({ down, uv, radiusPx })`:
    - `uv` is expected in normalized $[0, 1]$ space.
    - Consumers MAY need to invert V depending on their mesh UV conventions; visuals SHOULD provide a `uFlipY` switch on the material.
  - Determinism:
    - Given identical params, initial seed/state, and step timing, the output SHOULD be stable.
    - `reset('random')` SHOULD accept an explicit seed for reproducible patterns.
  - Ownership:
    - The runner owns and MUST dispose the internal render targets, shader materials, and geometries in `dispose()`.

- `NeonLifeSimPass` (R3F wrapper)
  - Drives `step()` using `useFrame`.
  - Props are explicit (no store requirement): `gridSize`, `paused`, `ticksPerSecond`, `stepsPerTick`, `wrapEdges`, `ageDecayPerStep` or `ageDurationSeconds`.
  - Optional brush props: `brushDownRef`, `brushUvRef`, `brushRadiusPx`.
  - Emits `onTexture(texture)` when the current texture changes.
  - The wrapper SHOULD NOT create additional render targets; it delegates to the core runner.

- `NeonLifeStateMaterial`
  - Mesh-agnostic material that samples `uState` at `vUv`.
  - Includes a simple switch for UV origin differences (e.g., `uFlipY` or `#define FLIP_Y`).
  - Keeps uniform names stable: `uState` at minimum.
  - The material SHOULD document its expected texture layout and recommended `min/magFilter` (nearest) for crisp cell edges.

## Performance notes

- The sim uses float RT. Consumers must ensure their environment supports float textures (the UI already has a fallback path).
- Updates are per-frame; for expensive scenes, consider lowering sim step rate or running the sim to a separate offscreen renderer.

## Tests & Validation

- Unit tests for factory lifecycle and texture emission
- Shader compile tests for `NeonStateMaterial`
- A visual example to confirm mapping and UV orientation

## Risks and mitigations

- Risk: consumers misuse texture (flipY / origin mismatch). **Mitigation**: Document flipY behavior and provide `material.defines || uniform` to invert V if needed.
- Risk: memory leaks if consumers forget to `dispose()` the returned resources. **Mitigation**: provide `dispose()` and document ownership responsibilities.
