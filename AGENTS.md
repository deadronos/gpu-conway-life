# AGENTS — Quick start for automated contributors 🤖

This repository delegates agent guidance to the canonical instructions in `.github/copilot-instructions.md`.
If you're an AI agent or automated tool, start by reading that file before making changes.

## Quick checklist

- Read: `.github/copilot-instructions.md` (primary guidance and examples)
- Read: `/memory` for current project context, tasks, and decisions
- Start dev server: `npm run dev` (Vite + HMR)
- Lint code: `npm run lint` (ESLint + Prettier)

## Memory Bank (short)

- Check `/memory` before starting work. If you make a change that affects architecture, conventions, or long-term decisions, update the relevant `/memory` file(s) (tasks, progress, activeContext).
- Create or update `/memory/tasks/TASK###-*.md` for work you start and add an entry to `/memory/tasks/_index.md`.

## Where to look first

- `src/components/GOLSimulation.tsx` — central simulation logic: `useFBO`, ping-pong swap, `useFrame`, `createPortal`.
- `src/shaders/SimulationShader.ts` & `src/shaders/DisplayShader.ts` — GLSL shaders are TypeScript template strings and are the main behavior surface.
- `src/App.tsx` — how the `Canvas` and orthographic camera are set up.

## Project-specific notes for agents

- Shaders are exported string constants; edit both shader and `ShaderMaterial` uniform sets together.
- Uses `FloatType` textures + `NearestFilter` — ensure WebGL2 / float textures are available when testing.
- Keep changes small for visual/GL work; attach a short demo GIF or steps to reproduce when opening a PR.

## When you change architecture or conventions

- Update `.github/copilot-instructions.md` to reflect new patterns and add a short note in this `AGENTS.md` pointing to any new docs.

If anything's unclear, open an issue or ask a human maintainer with references to the specific file(s) you inspected.
