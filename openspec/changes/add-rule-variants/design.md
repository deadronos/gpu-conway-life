# Design: add-rule-variants

## Context

The sim shader currently implements classic Conway rules by counting 8 neighbors and applying:

- survive: 2 or 3 neighbors
- birth: 3 neighbors

The output state texture encodes alive in `R` and age in `A`.

## Goals

- Allow switching Life-like rules at runtime (e.g. Life vs HighLife) without rewriting app code.
- Keep it fast: avoid recompiling shaders per rule change.
- Keep the visualization/material separate from simulation; rule changes affect the sim runner/pass.

## Approach

Represent rules as two bitmasks over neighbor counts 0..8:

- `birthMask` where bit `n` indicates birth when the dead cell has `n` live neighbors
- `surviveMask` where bit `n` indicates survival when the live cell has `n` live neighbors

Add uniforms to the sim shader:

- `uBirthMask` (uint)
- `uSurviveMask` (uint)

The sim shader will compute `n` and then:

- `born = (1 - alive) * hasBit(uBirthMask, n)`
- `survive = alive * hasBit(uSurviveMask, n)`

This keeps rule changes as uniform updates only.

## API surface

`NeonLifeSimRunnerParams` and `NeonLifeSimPass` gain:

- `rule?: 'life' | 'highlife' | 'custom'` (primary)
- `ruleString?: string` (only used when `rule: 'custom'`, e.g. `B36/S23`)

Internal representation:

- `{ birthMask: number; surviveMask: number }` used to set shader uniforms.

Recommended: presets + `ruleString` for custom rules. Keep `{ birthMask, surviveMask }` internal unless there is a demonstrated need.

Validation rules:

- If `rule !== 'custom'`, `ruleString` is ignored.
- If `rule === 'custom'` and `ruleString` is missing or invalid, the runner SHOULD throw (or fall back to Life) based on a documented policy. Prefer throwing in dev and falling back in prod only if needed.

## Notes

- The material does not need rule information to render `uState`; it only visualizes the state texture. The rule should be a prop/param on `NeonLifeSimPass` and/or runner.
- Defaults should remain exactly current behavior (Life B3/S23).
