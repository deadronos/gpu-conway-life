# Tasks: add-sim-as-material

## 1. Implementation

- [ ] 1.1 Define the reusable module boundary under `src/neon-sim/` and decide what is considered public surface (factory, R3F wrapper, material, types/constants).
- [ ] 1.2 Implement a **core (Three-only)** sim runner (no Zustand dependency) that owns the ping-pong targets and exposes `{ texture, step(deltaSeconds), reset(), setBrush(), setParams(), dispose() }`.
- [ ] 1.3 Implement a **thin R3F wrapper** (`NeonLifeSimPass`) that drives `step()` with `useFrame`, accepts explicit params (paused/tps/steps/wrap/age controls), and emits `onTexture`.
- [ ] 1.4 Add `NeonLifeStateMaterial` that samples `uState` and exposes a UV-origin switch (e.g., `uFlipY`) plus documented defaults.
- [ ] 1.5 Add an in-app example component (e.g., `NeonSimOnMeshDemo`) that maps the sim onto an arbitrary mesh (sphere/torus) and can be selected via a simple toggle (since `App.tsx` currently has no routing).
- [ ] 1.6 Update existing demo(s) only as needed to prove compatibility (no breaking changes).
- [x] 1.7 Add unit/integration tests: lifecycle/disposal for the core runner, R3F wrapper calls `onTexture`, material compiles.
- [ ] 1.8 Add docs explaining:
  - state texture layout (R=alive, A=age)
  - float render target requirements
  - UV origin / flipY considerations and recommended defaults
  - ownership/disposal responsibilities

## 2. Validation

- [ ] 2.1 Run unit tests
- [ ] 2.2 Run the dev app and verify the sim renders correctly on:
  - the existing micro-city visualization
  - the new arbitrary-mesh example
- [x] 2.3 (Optional) Add a Playwright smoke/visual test ensuring the sim appears on the example mesh
- [ ] 2.4 Run `openspec validate add-sim-as-material --strict --no-interactive`

## 3. Follow-ups (non-blocking)

- [ ] 3.1 Add projector utilities for world-space projection or UV remapping if requested
- [ ] 3.2 Add built-in support for multiple color maps or LUTs
