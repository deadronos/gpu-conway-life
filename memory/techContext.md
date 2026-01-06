# Tech Context

**Languages & frameworks:** TypeScript, React, Vite, Three.js, @react-three/fiber, @react-three/drei.

**Key packages:** See `package.json` — `three`, `@react-three/fiber`, `@react-three/drei`, `vite`.

**Build & dev commands:**

- `npm run dev` — start Vite dev server (HMR for TS and shader strings).
- `npm run build` — `tsc -b && vite build`.
- `npm run preview` — serve built app locally.
- `npm run lint` — ESLint + Prettier checks.

**Runtime constraints:** The simulation uses `THREE.FloatType` textures. Ensure the environment supports WebGL2 or the float texture extensions when testing.

**Testing:** No unit tests currently. Visual verification and linting are primary checks.
