# Tasks: add-rule-variants

## 1. Implementation

- [x] 1.1 Add rule types/utilities (parse `B.../S...` into bitmasks, validate input, provide presets).
- [x] 1.2 Update sim shader (`src/neon-sim/simShaders.ts`) to use `uBirthMask` / `uSurviveMask` uniforms instead of hard-coded Life rules.
- [x] 1.3 Extend `NeonLifeSimRunnerParams` and `NeonLifeSimPass` props to accept `rule` (preset) and optional `ruleString` for `rule='custom'`, and plumb it to shader uniforms.
- [x] 1.4 Update demos (`/?demo=mesh`, `/examples/rotating-primitives/`) to include a rule preset selector (Life/HighLife/Custom) and a text input for `ruleString` when custom.
- [x] 1.5 Add unit tests for rule parsing and for runner param → uniform updates.
- [x] 1.6 Update docs (`docs/neon-sim/README.md`) with examples for Life vs HighLife.

## 2. Validation

- [x] 2.1 Run `npm run test`
- [x] 2.2 Run `npm run build`
- [x] 2.3 (Optional) Run `npm run test:e2e`
- [x] 2.4 Run `openspec validate add-rule-variants --strict --no-interactive`
