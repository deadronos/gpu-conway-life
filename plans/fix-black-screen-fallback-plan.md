## Plan: Fix Black Screen Fallback

The app can currently render as an all-black page when GPU feature detection disables the scene or when WebGL/shader init fails silently. This plan makes failure states explicit with a clear message-only fallback and adds tests to prevent regressions.

**Phases**

1. **Phase 1: Robust Capability Detection + Clear Full-Screen Message**
   - **Objective:** Avoid mystery black screens by detecting capabilities using the actual R3F WebGL context and rendering a prominent fallback message when rendering is disabled.
   - **Files/Functions to Modify/Create:**
     - `src/neon-city/NeonMicroCityDemo.tsx` (replace temp-canvas probe with `Canvas`-context-based detection; render fallback overlay when disabled)
     - `src/neon-city/Hud.tsx` (keep warning, but do not rely on it as the only signal)
     - `src/index.css` (styles for readable overlay)
   - **Tests to Write:**
     - Playwright e2e: forced-unsupported mode shows fallback overlay (`tests/e2e/*.spec.ts`)
     - Unit test: capability decision helper (`src/neon-city/*` + `src/neon-city/*.test.ts`)
   - **Steps:**
     1. Write failing tests for the fallback overlay and capability helper.
     2. Implement capability detection using the R3F-created `gl` and store the results.
     3. Render a full-screen message-only fallback when disabled.
     4. Re-run the tests to confirm they pass.
     5. Run build to ensure production bundle succeeds.

2. **Phase 2: Runtime Error Surface (No Silent WebGL Failures)**
   - **Objective:** If WebGL/shader initialization fails even when capability checks pass, show a simple error banner/overlay instead of leaving the page black.
   - **Files/Functions to Modify/Create:**
     - `src/neon-city/NeonMicroCityDemo.tsx` (capture init errors; optionally handle `webglcontextlost`)
   - **Tests to Write:**
     - Unit test: error state renders a visible message (`src/neon-city/*.test.ts`)
   - **Steps:**
     1. Write failing test for error-state rendering.
     2. Add minimal error state + UI.
     3. Re-run tests to confirm they pass.

3. **Phase 3: Regression Guardrail Smoke Test**
   - **Objective:** Ensure CI catches “black-only” regressions by asserting the page shows either the HUD, the fallback overlay, or an error message.
   - **Files/Functions to Modify/Create:**
     - `tests/e2e/*.spec.ts` (add a stable smoke assertion)
   - **Tests to Write:**
     - Playwright e2e smoke test for visible UI
   - **Steps:**
     1. Write the smoke test (initially failing if necessary).
     2. Ensure selectors are resilient and do not flake.
     3. Run e2e tests to confirm they pass.

**Open Questions**

1. Should the fallback message include a one-click “copy diagnostics” block (user agent + WebGL renderer string), or keep it minimal?
