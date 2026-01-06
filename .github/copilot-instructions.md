# Copilot / Agent Instructions for gpu-conway-life 🔧

Short overview
- This repo is a minimal React + TypeScript + Vite app that renders a GPU-accelerated Game of Life using Three.js / @react-three/fiber and custom GLSL shaders.
- Key idea: the simulation runs in an off-screen FBO (ping-pong pair) and the result is shown via a second pass. See `src/components/GOLSimulation.tsx` and `src/shaders/*`.

Where to look first (quick map)
- `src/components/GOLSimulation.tsx` — central logic: FBO creation (`useFBO`), ping-pong swap, `useFrame` loop, `createPortal` for the simulation scene, and uniforms updates.
- `src/shaders/SimulationShader.ts` — simulation fragment/vertex shader (uses gl_FragCoord + `uResolution` to sample neighbors).
- `src/shaders/DisplayShader.ts` — display shader that maps state to color.
- `package.json` — developer scripts: `npm run dev` (vite), `npm run build`, `npm run preview`, `npm run lint`.

Architecture & data flow (important)
- Two render targets (FBOs) are created and swapped each frame (ping-pong). The simulation shader reads from a texture (previous state) and writes the next state into the other FBO.
- A small separate scene (created via `createPortal`) contains a full-screen quad with the simulation shader; a second mesh shows the result on the visible canvas.
- Initial state is a `THREE.DataTexture` (float texture) created in `GOLSimulation` and assigned to the simulation material on first frame.
- Shaders are stored as template strings in TypeScript files and exported; the code uses uniforms named with `u*` (e.g., `uTexture`, `uResolution`).

Project-specific conventions & patterns
- Shaders: keep GLSL as template strings exported from `src/shaders/*`. Name exports clearly, e.g., `simulationFragmentShader`, `simulationVertexShader`.
- Uniform naming: follow existing `u*` prefix convention. Update shader and `ShaderMaterial` uniforms together.
- Performance idioms: use `useMemo` for materials/textures and `useRef` for references you mutate (`currentRenderTarget`, `firstFrame`). Avoid recreating materials each render.
- Pixel-perfect rules: use `NearestFilter` for min/mag filters to avoid interpolation; `FloatType` is used so WebGL2 (or float texture support) is required.
- Resize behavior: `useFBO(width, height, ...)` reacts to `size`, and a `useEffect` resets initialization flags on resize.

How to add a runtime uniform (example)
- In the shader (e.g. `SimulationShader.ts`): add `uniform float uTime;` and use it.
- In `GOLSimulation.tsx`'s material: add `uTime: { value: 0 }` to `simMaterial.uniforms`.
- In `useFrame`: increment `simMaterial.uniforms.uTime.value += delta` before rendering to the FBO.

Debugging tips & gotchas
- Run dev server: `npm run dev` (Vite, supports HMR for TS files and shader strings).
- Floating textures require WebGL2 or the appropriate extensions; if the simulation appears blank, verify the context supports float textures.
- To debug shaders: simplify the fragment shader to output constant colors or `gl_FragColor = vec4(neighbors / 8.0, 0.0, 0.0, 1.0)` to visualize neighbor counts.
- If state doesn't update, verify the ping-pong swap logic and that render target is set/reset via `gl.setRenderTarget(...)`.
- `DataTexture` must set `texture.needsUpdate = true` after creation.

Testing & CI
- There are no test scripts included. Use `npm run lint` to validate style (`eslint` + `prettier` used via config files).

Editing & style notes for agents
- Keep changes minimal and focused: small PRs are preferred for shader or rendering changes because they are easy to validate in the browser.
- Follow project's ESLint and TypeScript conventions.
- When adjusting sizes/units, check how orthographic camera and plane sizes are used in `App.tsx` and `GOLSimulation.tsx` to avoid offscreen quads.

When opening a PR
- Include a short demo GIF or steps to reproduce if the change affects visuals or behavior.
- Mention browser/OS if the change exposes a WebGL capability limitation.

Memory Bank (`/memory`) — canonical project context
- This repo contains a `/memory` folder with curated, human-readable files that record project intent, decisions, and active tasks (see: `projectbrief.md`, `productContext.md`, `activeContext.md`, `systemPatterns.md`, `techContext.md`, `progress.md`, and `tasks/`).
- **Agents MUST** read `/memory` before making non-trivial changes and should keep it updated when implementing work that changes architecture or conventions.

How to create/update a task in `/memory/tasks` (recommended workflow):
1. Create `/memory/tasks/TASK###-shortname.md` describing the work (Original Request, Thought Process, Implementation Plan, Progress Log). Use `TASK001` as an example.
2. Add or update an entry in `/memory/tasks/_index.md` reflecting status (Pending/In Progress/Completed).
3. Update `/memory/progress.md` and `/memory/activeContext.md` with any high-level progress or decisions.
4. Include these `/memory` updates in the same PR that implements the code changes.

For design-level changes, add files under `/memory/designs/` describing the decision and trade-offs.

If anything is unclear
- Ask for clarification referencing the file(s) and the specific behavior you observed (e.g., "On resize the simulation texture resets — should it preserve state?").


