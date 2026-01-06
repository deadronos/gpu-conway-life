# System Patterns

**Rendering pattern:** A simulation pass runs in a separate scene (created with `createPortal`) that renders a full-screen quad into an off-screen FBO; a visible mesh reads that FBO for display.

**Ping-pong FBOs:** Two FBOs are swapped each frame; shaders read from the previous texture and write to the other.

**Initialization pattern:** Initial state is a `THREE.DataTexture` created on first render and assigned to `simMaterial.uniforms.uTexture`.

**Shader patterns and naming:** Shaders are stored as template strings in `src/shaders/*`. Uniforms use `u*` prefix (e.g., `uTexture`, `uResolution`).

**Performance & correctness idioms:**

- Use `NearestFilter` to avoid interpolation artifacts.
- Use `FloatType` so values are stored precisely (requires WebGL2 or extensions).
- Use `useMemo` for materials and textures, and `useRef` for mutable refs.

**Resize behavior:** `useFBO(width, height, ...)` reacts to `size` and the code resets `firstFrame` on resize to re-initialize state.
