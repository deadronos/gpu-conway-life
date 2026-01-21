# Change: add-neon-micro-city

## Why

Create a high-performance, visually compelling instanced visualization of Conway's Game of Life that treats each active cell as a building in a neon micro-city. This enables dramatic demos and verifies the simulation texture's age channel and instance-driven rendering.

## What Changes

- **ADD** a new visualization feature: *Neon Micro-City* (instanced mesh + bloom + age-based color mapping)
- **ADD** shader material that reads a simulation texture and maps age (alpha channel) to color and intensity
- **ADD** UI controls and demo scene to interactively seed and run the simulation
- **ADD** automated visual tests and documentation

## Impact

- Affected specs: `visualization`
- Affected code: `src/scene/`, `src/shaders/`, new components and demo pages

