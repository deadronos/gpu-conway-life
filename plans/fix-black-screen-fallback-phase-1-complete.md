## Phase 1 Complete: Robust Capability Detection + Clear Full-Screen Message

Moved float render-target capability detection onto the real R3F WebGL context and added a prominent full-screen fallback overlay (plus deterministic test hooks) so unsupported or failing environments no longer look like a black/blank page.

**Files created/changed:**

- `src/neon-city/NeonMicroCityDemo.tsx`
- `src/neon-city/capabilities.ts`
- `src/neon-city/UnsupportedOverlay.tsx`
- `src/index.css`
- `eslint.config.js`
- `src/neon-city/capabilities.test.ts`
- `src/neon-city/NeonMicroCityDemo.test.tsx`
- `tests/e2e/neon.unsupported.spec.ts`
- `tests/e2e/neon.fallback-overlay.spec.ts`
- `src/neon-city/__snapshots__/Hud.test.tsx.snap` (deleted)

**Functions created/changed:**

- `NeonMicroCityDemo`
- `AutoCamera`
- `shouldForceUnsupported`
- `detectFloatRTSupport`
- `UnsupportedOverlay`

**Tests created/changed:**

- `src/neon-city/capabilities.test.ts`
- `src/neon-city/NeonMicroCityDemo.test.tsx`
- `tests/e2e/neon.unsupported.spec.ts`
- `tests/e2e/neon.fallback-overlay.spec.ts`

**Review Status:** APPROVED with minor recommendations

**Git Commit Message:**
feat: add unsupported overlay fallback

- Detect float RT support via R3F WebGL context
- Show full-screen overlay instead of black screen
- Add unit and e2e tests for forced/non-forced fallback
