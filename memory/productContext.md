# Product Context

**Problem being solved:** Provide a compact, GPU-based visual demo of Conway's Game of Life that highlights WebGL shader techniques and R3F integration.

**How it should work:**

- Initialization uses a `THREE.DataTexture` for starting state.
- Two FBOs (ping-pong) compute next state via a simulation shader; output is displayed on a second mesh.

**User experience:** Full-screen canvas with high frame-rate rendering; changes should be easy to preview via HMR.

**Non-goals:** Production-ready game-level features, complex UI, or cross-browser polyfills for very old browsers.
