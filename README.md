# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  # gpu-conway-life

  GPU-accelerated Conway's Game of Life experiments using Three.js + @react-three/fiber.

  The default demo is **Neon Micro-City**: it renders alive cells as instanced "buildings" whose height/glow/color are driven by a GPU simulation texture.

  ## Run it

  - `npm install`
  - `npm run dev`

  ## Demos

  ### Neon Micro-City (default)

  Open:

  - `/`

  ### Sim-on-mesh (project the sim onto an arbitrary mesh)

  Open:

  - `/?demo=mesh`

  This demo uses the reusable simulation module under `src/neon-sim/`.

  ## Reusable sim module (`src/neon-sim/`)

  The goal is to make the simulation and sampling reusable for other R3F / Three apps.

  ### Core runner (Three-only)

  - `createNeonLifeSimRunner(gl, { gridSize, ... })` returns a runner exposing `{ texture, step(), reset(), setParams(), setBrush(), dispose() }`.

  The state texture layout is:

  - `R = alive (0/1)`
  - `A = age (0..1)`

  ### R3F wrapper

  - `<NeonLifeSimPass ... onTexture={(tex) => ...} />` drives the core runner via `useFrame`.

  ### Material

  - `createNeonLifeStateMaterial({ stateTexture, flipY, ... })` creates a mesh-agnostic `ShaderMaterial` that samples `uState`.

  ## Notes

  - The simulation requires float render targets (`EXT_color_buffer_float`). Unsupported environments show a full-screen fallback.
  },
