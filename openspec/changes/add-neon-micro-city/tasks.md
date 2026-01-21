# Tasks: add-neon-micro-city

## 1. Implementation

- [x] 1.1 Create instanced rendering prototype that reads simulation texture
- [x] 1.2 Implement shader mapping of age (alpha) to color and intensity
- [x] 1.3 Integrate bloom via `@react-three/postprocessing` and fine-tune
- [x] 1.4 Add demo route / UI controls via Leva (ticksPerSecond, bloom, brush settings)
- [x] 1.5 Add unit tests and visual snapshot tests
- [x] 1.6 Add docs and update `idea.md` → `design.md` with implementation notes
- [x] 1.7 Add runtime feature detection & graceful fallback for unsupported browsers
- [x] 1.8 Update instance geometry to 1x1 footprint and adjust camera for new scale

## 2. Validation

- [x] 2.1 Performance test: validate 100k+ instances with acceptable frame rate (Playwright perf test added)
- [x] 2.2 Visual snapshot tests pass in CI
- [x] 2.3 Verify UI responsiveness: changing `ticksPerSecond` immediately updates simulation speed
- [x] 2.4 Add Playwright integration test to assert the simulation advances
