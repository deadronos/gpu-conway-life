# Design: add-neon-micro-city

## Implementation Notes

This change implements a "Neon Micro-City" visualization where each alive Conway cell is rendered as an instanced building. A simulation texture drives both occupancy and a per-cell age channel.

### Data Model (Simulation Texture)

- `R` (alive): 0/1
- `A` (age): 0..1 where 1 is a fresh birth and values decay toward 0 while alive

### Rendering

- One `InstancedMesh` (boxes) with `gridSize * gridSize` instances.
- Each instance has a configurable footprint (length and width); the **default is 10x10 world units**.
- Per-instance sampling uses `gl_InstanceID` to derive a UV into the simulation texture.
- **Aging Logic**: Age ($t$) is biased using a power curve (e.g., $t^{1.5}$) to avoid "plateaus." This ensures buildings spend more time in the mature red phase and less time at peak cyan brightness.
- **Color Mapping**: Fresh cells ($t=1.0$) are bright cyan-white; aging cells transition through magenta to a dark, deep red ($t=0.0$).
- Output is HDR-scaled via `emissiveGain`; scaling and height follow the non-linear curve.

### Postprocessing

- Bloom is implemented with `@react-three/postprocessing` and tunable via Leva.

### Interactive Controls (Leva)

- `ticksPerSecond` is the primary speed control; internally this is converted to `tickMs = 1000 / ticksPerSecond`.
- Additional tuning: `stepsPerTick`, `ageDecayPerStep`, `wrapEdges`, `emissiveGain`, `heightScale`, and bloom parameters.

### Runtime capability detection & fallback

- The simulation requires WebGL2 float render-target support (`EXT_color_buffer_float`). The client performs a runtime check and disables the demo with a friendly message if unsupported, toggling `floatRTSupported` in the store.

### Testing & Validation

- Unit tests cover pure logic (`math.*`, `Hud.*`).
- A Playwright integration test asserts the simulation advances by toggling store values via a test hook (`window.__neonSetPartial`) and comparing canvas screenshots before/after.
- Performance test: automated Playwright perf test was added to measure FPS at `gridSize = 320` (102,400 instances) and assert an average FPS >= 30. This test runs at headless CI and skips if the browser environment does not support float render targets.
