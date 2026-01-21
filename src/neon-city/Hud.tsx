import { useNeonCityStore } from './store'

export function Hud({ gridSize }: { gridSize?: number }) {
  const paused = useNeonCityStore((s) => s.paused)
  const ticksPerSecond = useNeonCityStore((s) => s.ticksPerSecond)
  const stepsPerTick = useNeonCityStore((s) => s.stepsPerTick)
  const floatRTSupported = useNeonCityStore((s) => s.floatRTSupported)

  const instances = gridSize ? gridSize * gridSize : 0

  return (
    <div className="hud" data-testid="hud">
      <div>
        Neon Micro-City
        {paused ? ' (paused)' : ''}
      </div>
      <div data-testid="tps">TPS: {ticksPerSecond.toFixed(0)}</div>
      <div>Steps/tick: {stepsPerTick}</div>
      <div>Instances: {instances.toLocaleString()}</div>
      {!floatRTSupported ? (
        <div className="warning" data-testid="unsupported">
          Warning: Your browser does not support the required WebGL float render targets (EXT_color_buffer_float). The demo is disabled.
        </div>
      ) : null}
    </div>
  )
}
