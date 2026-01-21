# Project Context

## Purpose

GPU-accelerated visualization and exploration of Conway's Game of Life. The project produces an interactive browser-based WebGL app that simulates large grids on the GPU and renders millions of cells efficiently using instanced rendering and shader-driven visual styles.

## Tech Stack

- **Language & Tooling:** TypeScript, Vite, ESLint, Prettier
- **UI / 3D:** React (v19), three.js, @react-three/fiber, @react-three/postprocessing
- **Shaders & GPU:** GLSL (WebGL2); render-to-texture / ping-pong textures for simulation
- **Testing:** Vitest (unit), Playwright (E2E / visual regression) — optional/expanded as needed
- **Build & Dev:** Vite dev server, modern browsers (WebGL2 required)

## Project Conventions

### Code Style

- TypeScript-first with strict typing where feasible.
- Use the repository ESLint rules; format with Prettier for consistent style.
- Keep shader code under `src/shaders/` as standalone GLSL files or template strings.
- Small, focused React components; prefer composition over inheritance.

### Architecture Patterns

- Single-page app using React + react-three/fiber for the 3D scene.
- GPU simulation runs in a compute/pass shader pipeline (ping-pong textures).
- Rendering is decoupled from simulation; visual materials read the simulation texture and instance attributes.
- Keep rendering logic in `src/scene/` or `src/three/`, components in `src/components/`, and hooks in `src/hooks/`.

### Testing Strategy

- Unit tests for pure logic with Vitest and Testing Library when relevant.
- Visual snapshot / smoke tests for scenes with Playwright (or a comparable visual regression tool).
- Shader correctness validated via deterministic snapshotting where practical.

### Git Workflow

- Protected `main` branch. Use feature branches: `feature/<short-name>` or verb-led `add-...`.
- Pull requests must include a short description, screenshots/demos for visual changes, and reference any `openspec` change-id for non-trivial features.
- Commit messages follow Conventional Commits.

## Domain Context

- Core domain: cellular automata (Conway's Game of Life) represented as textures with age stored in channels (alpha or extra channels).
- Focus on interactivity, high instance counts (100k+), and deterministic behavior for reproducibility and testing.

## Important Constraints

- Target modern desktop browsers with WebGL2 support; mobile/low-end devices are best-effort.
- Minimize additional bundle size and external dependencies for a small payload.
- Visual determinism and testability are priorities.

## External Dependencies

- three, @react-three/fiber, @react-three/postprocessing, Vite, and standard WebGL2 browser APIs.

