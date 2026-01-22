export function RuntimeErrorOverlay({ message }: { message: string }) {
  return (
    <div
      className="fullscreenFallback"
      data-testid="runtimeErrorOverlay"
      role="alert"
      aria-live="polite"
    >
      <div className="fullscreenFallbackInner">
        <div className="fullscreenFallbackTitle">Neon Micro-City Error</div>
        <div className="fullscreenFallbackBody">
          {message || 'A WebGL error occurred while starting the demo.'}
        </div>
        <div className="fullscreenFallbackBody">
          Try reloading, or use a different browser/device.
        </div>
      </div>
    </div>
  );
}
