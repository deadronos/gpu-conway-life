# Progress

**What works:**

- App boots with `npm run dev` and displays the simulation using `GOLSimulation`.
- Basic shader-driven Game of Life runs and updates frame-to-frame.

**What's left / Known issues:**

- No automated tests or CI for visual changes.
- Float textures require WebGL2 — blank output may indicate missing support.
- Resize resets the simulation state; consider a preserve-state option.

**Next milestones:**

- TASK001: Add `uTime` runtime uniform example and documentation.
- Add a small debug shader to visualize neighbor count for easier debugging.
- Add a simple smoke test (dev script) to check for WebGL2 / float texture support.
