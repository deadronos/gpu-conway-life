# gpu-conway-life

GPU-accelerated Conway's Game of Life experiments using Three.js + @react-three/fiber.

The default demo is **Neon Micro-City**: it renders alive cells as instanced "buildings" whose height/glow/color are driven by a GPU simulation texture.

## Run it

- `npm install`
- `npm run dev`

## Demos

### Neon Micro-City (default)

- `/`

### Sim-on-mesh (project the sim onto an arbitrary mesh)

- `/?demo=mesh`

## Examples (multi-page)

- Rotating primitives (cube + sphere + dodecahedron): `/examples/rotating-primitives/`

## Reusable sim module (`src/neon-sim/`)

The goal is to make the simulation and sampling reusable for other R3F / Three apps.

For a step-by-step guide (including copying into another app), see:

- `docs/neon-sim/README.md`

### Rules (Life / HighLife / Custom)

Rule variants are supported by the **simulation** (runner/pass) and change what gets written into the state texture.
The **material** only visualizes `uState` and does not need to know the rule.

Supported presets:

- `rule: 'life'` (B3/S23)
- `rule: 'highlife'` (B36/S23)
- `rule: 'custom'` with `ruleString: 'B.../S...'`

## Notes

- The simulation requires float render targets (`EXT_color_buffer_float`). Unsupported environments show a full-screen fallback.
  This demo uses the reusable simulation module under `src/neon-sim/`.
