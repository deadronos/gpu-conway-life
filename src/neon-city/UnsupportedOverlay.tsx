export function UnsupportedOverlay() {
  return (
    <div
      className="fullscreenFallback"
      data-testid="unsupportedOverlay"
      role="alert"
      aria-live="polite"
    >
      <div className="fullscreenFallbackInner">
        <div className="fullscreenFallbackTitle">Neon Micro-City Disabled</div>
        <div className="fullscreenFallbackBody">
          This demo requires WebGL float render targets via <code>EXT_color_buffer_float</code>.
          Your browser or GPU does not support it, so the simulation is disabled to avoid a black
          screen.
        </div>
        <div className="fullscreenFallbackBody">
          Try updating your browser, enabling hardware acceleration, or using a different device.
        </div>
      </div>
    </div>
  );
}
