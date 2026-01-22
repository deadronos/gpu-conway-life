# Rotating primitives example

This example renders:

- 1 rotating cube
- 1 rotating sphere
- 1 rotating dodecahedron

All three use `createNeonLifeStateMaterial()` driven by the GPU sim texture.

## Run

1. Install deps at the repo root
2. Start the dev server
3. Open:

- `/examples/rotating-primitives/`

## Notes

- Requires float render targets (`EXT_color_buffer_float`). If unsupported, a full-screen overlay is shown.
- Uses the reusable module in `src/neon-sim/`.
- Includes Leva controls for simulation rule (`life` / `highlife` / `custom` + `ruleString`) and material tuning.
