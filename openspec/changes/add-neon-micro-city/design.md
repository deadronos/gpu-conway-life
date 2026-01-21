# Design: add-neon-micro-city

## Implementation Notes

This change implements a "Neon Micro-City" visualization where each alive Conway cell is rendered as an instanced building. A simulation texture drives both occupancy and a per-cell age channel.

### Data Model (Simulation Texture)

- `R` (alive): 0/1
- `A` (age): 0..1 where 1 is a fresh birth and values decay toward 0 while alive

### Rendering

- One `InstancedMesh` (boxes) with `gridSize * gridSize` instances.
- Per-instance sampling uses `gl_InstanceID` to derive a UV into the simulation texture.
- Age drives building height and a neon color ramp; output is HDR-scaled via `emissiveGain` so the bloom pass can pick it up.

### Postprocessing

- Bloom is implemented with `@react-three/postprocessing` and tunable via Leva.

### Interactive Controls (Leva)

- `ticksPerSecond` is the primary speed control; internally this is converted to `tickMs = 1000 / ticksPerSecond`.
- Additional tuning: `stepsPerTick`, `ageDecayPerStep`, `wrapEdges`, `emissiveGain`, `heightScale`, and bloom parameters.
