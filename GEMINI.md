# GEMINI — Guidance for Gemini-based agents 🤖

This repo prefers agents to follow the human-friendly agent docs and the Memory Bank.

Quick checklist

- Read: `AGENTS.md` (project quick-start for automated contributors)
- Read: `.github/copilot-instructions.md` (canonical agent instructions)
- Read: `/memory` (project context, decisions, and tasks)
- Start dev server: `npm run dev` (Vite + HMR)
- Lint code: `npm run lint` (ESLint + Prettier)

How to work here

- Before making non-trivial changes, consult `/memory` and update it when your work affects architecture, conventions, or tasks.
- Create `/memory/tasks/TASK###-shortname.md` for new work and add it to `/memory/tasks/_index.md`.
- Include any `/memory` updates in the same PR as your code changes.

Project-specific notes (short)

- Shaders are TypeScript template strings under `src/shaders/` — update both shader strings and corresponding `ShaderMaterial` uniforms.
- The simulation uses `FloatType` textures + `NearestFilter` (WebGL2 required). Visual diffs (GIFs/screenshots) are essential for validating changes.

If anything is unclear

- Open an issue or a draft PR and reference `AGENTS.md`, `.github/copilot-instructions.md`, and the relevant `/memory` file(s) for context.

See also: `/memory/tasks/TASK001-add-utime.md` for a small example task you can implement to get started.