# [TASK001] - Add `uTime` uniform example and docs

**Status:** Pending  
**Added:** 2026-01-06  
**Updated:** 2026-01-06

## Original Request
Add a small, concrete example that shows how to add a runtime `uTime` uniform to the simulation shader, update the `simMaterial` uniforms, and increment it in `useFrame`. Include a short PR checklist and a demo GIF in the PR.

## Thought Process
Having a concrete, small example helps new contributors (and automated agents) understand how to change shader uniforms and validate behavior visually.

## Implementation Plan
- Edit `src/shaders/SimulationShader.ts` to add `uniform float uTime;` and optionally use it in the shader (e.g., perturb rule or color).
- Update `GOLSimulation.tsx`: add `uTime` to `simMaterial.uniforms` and increment it in `useFrame` before rendering to FBO.
- Update `.github/copilot-instructions.md` to include the exact mini-example.
- Open a small PR with a screenshot / GIF showing the effect and a short checklist.

## Progress Log
### 2026-01-06
- Task created and added to the Memory Bank (`/memory/tasks/TASK001-add-utime.md`).
