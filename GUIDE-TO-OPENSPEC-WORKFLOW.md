# GUIDE TO OpenSpec WORKFLOW

## 🎯 Purpose
This guide is a concise, practical manual for using OpenSpec in this repository and for working effectively with the AI assistant during spec-driven development.

---

## 🚀 Quick TL;DR
- Use OpenSpec for feature proposals, breaking changes, and architecture decisions.
- Workflow: **Create a proposal → Implement → Validate → Archive**.
- Use verb-led change IDs (kebab-case), e.g., `add-neon-micro-city`.

---

## 🔍 When to create a change (proposal)
Create a change when you need to:
- Add new features or capabilities
- Make breaking changes (APIs, public schemas)
- Change architecture or introduce new patterns
- Fix ambiguous requirements or update spec behavior

Skip proposals for trivial fixes (typos, small bug fixes, styling) and configuration-only updates unless they change behavior.

---

## 🧾 How to create a change (scaffold)
1. Choose a unique, verb-led change id (kebab-case): `add-<feature>` or `refactor-<area>`.
2. Create directory: `openspec/changes/<change-id>/` with:
   - `proposal.md` — Why, What, Impact
   - `tasks.md` — Implementation checklist, sequential steps
   - `specs/<capability>/spec.md` — Delta(s) using `## ADDED|MODIFIED|REMOVED Requirements`
   - Optional `design.md` when the change is cross-cutting or complex
3. Write clear `#### Scenario:` blocks under each requirement — every requirement must have at least one scenario.

---

## ✍️ Spec authoring rules (quick)
- Use normative language: **SHALL** / **MUST** for requirements.
- Scenarios must use this heading format: `#### Scenario: Name` and then `- **WHEN** ...` / `- **THEN** ...`.
- Use `## ADDED Requirements` for new capabilities. Use `## MODIFIED Requirements` when editing existing requirements — paste the full requirement block.
- Use `## RENAMED Requirements` only when the name changes.

---

## ✅ Validation & CLI
Run validation often and fix issues early:
- `openspec validate <change-id> --strict --no-interactive` — validate a change before implementation
- `openspec list` / `openspec spec list --long` — inspect active changes and specs
- `openspec show <change-id> --json --deltas-only` — debug delta parsing

---

## ⚙️ Implementation guidelines
- Follow `tasks.md` sequentially. Mark tasks done as you finish them.
- Keep changes small and well-tested (unit + visual tests for UI/visual features).
- Reference the change-id in PR titles and descriptions.
- Run `openspec validate` after editing spec deltas.

---

## 🗄️ Archiving
After the change is merged and deployed:
- Move `changes/<change-id>/` → `changes/archive/YYYY-MM-DD-<change-id>/` or run `openspec archive <change-id> --yes`
- Update `openspec/specs/` if the capability has changed
- Re-run validation: `openspec validate --strict --no-interactive`

---

## 🤝 Working with the AI assistant (best practices)
- Tell the assistant the **change-id** and brief scope (e.g., "scaffold `add-neon-micro-city` and a spec delta").
- Ask the assistant to run `openspec validate` after scaffolding or edits; it can fix formatting issues and lint failures.
- For implementation, request small, focused tasks (one feature or test per request). Example prompts:
  - "Scaffold change `add-widget` with proposal.md, tasks.md, and a spec delta"
  - "Implement the instanced renderer prototype for `add-neon-micro-city` and add a visual test"
- Use iterative review: request a PR diff or run tests locally, then ask for follow-ups.

---

## 🧰 Useful examples
- Example change id: `add-neon-micro-city`
- Example validation: `openspec validate add-neon-micro-city --strict --no-interactive`
- Example spec header:

```
## ADDED Requirements

### Requirement: Neon Micro-City Visualization
The system SHALL render active cells as instanced meshes...

#### Scenario: Birth uses bloom and hot color
- **WHEN** a cell becomes alive
- **THEN** the corresponding instance is rendered with a bright color and bloom contribution
```

---

## 🗒️ Quick checklist before opening a PR
- [ ] `openspec validate <change-id> --strict` passes
- [ ] `tasks.md` is complete with checkboxes reflecting work done
- [ ] Tests (unit + visual) are added and pass locally
- [ ] PR description references the change-id and includes screenshots for visual changes

---

## 📞 Support
If you need me to scaffold, validate, or implement any part of the workflow, ask a single focused request, include the change-id (if applicable), and I’ll take one actionable step at a time.

---

*This file is a concise companion to `openspec/AGENTS.md` and the OpenSpec CLI documentation.*
