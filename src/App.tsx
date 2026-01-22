import { Leva } from 'leva'
import { NeonMicroCityDemo } from './neon-city/NeonMicroCityDemo'
import { NeonLifeSimOnMeshDemo } from './neon-sim/NeonLifeSimOnMeshDemo'

function getDemoMode(): 'micro-city' | 'mesh' {
  if (typeof window === 'undefined') return 'micro-city'
  try {
    const demo = new URLSearchParams(window.location.search).get('demo')
    return demo === 'mesh' ? 'mesh' : 'micro-city'
  } catch {
    return 'micro-city'
  }
}

export default function App() {
  const mode = getDemoMode()
  return (
    <div className="app">
      <Leva collapsed />
      {mode === 'mesh' ? <NeonLifeSimOnMeshDemo /> : <NeonMicroCityDemo />}
    </div>
  )
}
