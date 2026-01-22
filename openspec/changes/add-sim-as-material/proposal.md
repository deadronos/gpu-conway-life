# Change: add-sim-as-material

## Why

The existing simulation (`NeonLifeSim`) produces a `THREE.Texture` that is consumed by `NeonCity`, but there is no small, documented, reusable API or material for other apps to easily consume and project the sim onto arbitrary meshes. Making the sim available as a composable material/API will increase reuse and enable projects to map the simulation onto arbitrary geometry (spheres, planes, custom UVs, etc.) without duplicating integration code.

## What Changes

- **ADD** a small, minimal public API that lets consumers obtain the simulation's state `THREE.Texture` programmatically.
- **ADD** a reusable material (`NeonLifeStateMaterial`) that encapsulates sampling + color mapping of the sim state texture.
- **ADD** a demo/example that shows projecting/mapping the sim onto an arbitrary mesh in R3F.
- **ADD** docs and tests covering the API contract (texture layout, UV orientation, float RT requirements, and disposal).

## Non-goals

- Publishing this repository as an npm package.
- Building a full projector/decal system or world-space projection utilities.
- Replacing the existing `NeonLifeSim` / `NeonCity` demo; the change is additive.

## Deliverables (concrete)

- A Three.js-friendly simulation runner (no Zustand coupling) that can be used in non-R3F apps:
  - `createNeonLifeSimRunner(gl, options)`
  - returns a `NeonLifeSimRunner`
- A thin R3F wrapper component that drives the runner with `useFrame` and surfaces the output texture:
  - `<NeonLifeSimPass ... onTexture={(tex) => ...} />`
- A mesh-agnostic material (ShaderMaterial/RawShaderMaterial) for sampling `uState`:
  - `NeonLifeStateMaterial`

## Impact

- **Affected areas**: `src/neon-sim/*` (new reusable module), `src/neon-city/*` (adapters/demos), docs, tests.
- **Compatibility**: Non-breaking. Existing components (`NeonLifeSim`, `NeonCity`) will continue to work unchanged.

---

## Alternatives considered (brief)

- Adding only documentation showing how to re-use `NeonLifeSim` as-is. Rejected because a small helper and ready material reduce duplication and improve DX.
- Building a fully-featured projector system (world-space projectors, decals). Deferred as a follow-up if required.

---

## Acceptance criteria

- A consumer can obtain a `THREE.Texture` representing the current simulation state and use it to render on an arbitrary mesh in the same app.
- A provided `NeonLifeStateMaterial` can be applied to any UV-mapped mesh and produce a stable, documented mapping from sim state to color.
- The new API is usable without the app's Zustand store (caller supplies parameters explicitly).
- Docs and tests cover: state texture channel layout (R=alive, A=age), float RT requirements, UV origin expectations, and resource disposal.

