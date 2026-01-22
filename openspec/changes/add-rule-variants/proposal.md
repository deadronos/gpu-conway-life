# Change: add-rule-variants

## Why

Right now the simulation is hard-coded to standard Conway's Game of Life rules (B3/S23). Supporting other popular Life-like cellular automata (e.g., HighLife B36/S23) would let the same renderer/material show meaningfully different emergent behaviors without rewriting shaders.

## What Changes

- **ADD** simulation rule configuration support using Life-like rule notation (e.g., `B3/S23`, `B36/S23`).
- **ADD** a small set of named presets (at minimum: `life`, `highlife`) selected via a primary `rule` option.
- **ADD** optional `ruleString` support for `rule: 'custom'` (e.g., `B36/S23`).
- **ADD** a prop/parameter on the simulation runner + R3F pass to select the rule (`rule`) with optional `ruleString` when custom.
- **(Optional)** expose the chosen rule in the visualization layer for debugging/UX.

## Non-goals

- Adding non-Life-like rule families (e.g., 1D elementary CA, continuous reaction-diffusion) in this change.
- Making the material itself responsible for simulation (the material only visualizes a state texture).

## Impact

- **Affected areas**: `src/neon-sim/*` (runner params), shared sim shader (`src/neon-sim/simShaders.ts`), demos/tests/docs.
- **Compatibility**: Non-breaking; default remains standard Life (B3/S23).

## Open questions

- Should we support only `ruleString` for custom rules, or also allow advanced callers to provide explicit masks (e.g., `{ birthMask, surviveMask }`) for zero parsing overhead?
- Do we want additional presets beyond Life/HighLife (e.g., Seeds, Day & Night, Morley)?
