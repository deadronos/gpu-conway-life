import { useNeonCityStore } from './store'

export function Hud() {
  const paused = useNeonCityStore((s) => s.paused)
  const ticksPerSecond = useNeonCityStore((s) => s.ticksPerSecond)
  const stepsPerTick = useNeonCityStore((s) => s.stepsPerTick)

  return (
    <div className="hud" data-testid="hud">
      <div>
        Neon Micro-City
        {paused ? ' (paused)' : ''}
      </div>
      <div data-testid="tps">TPS: {ticksPerSecond.toFixed(0)}</div>
      <div>Steps/tick: {stepsPerTick}</div>
      <div>Instances: 102400</div>
    </div>
  )
}
