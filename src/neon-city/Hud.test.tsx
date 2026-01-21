import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useNeonCityStore } from './store'
import { Hud } from './Hud'

describe('Hud', () => {
  it('renders TPS from store', () => {
    useNeonCityStore.setState({ ticksPerSecond: 42 })
    render(<Hud gridSize={320} />)
    expect(screen.getByTestId('tps')).toHaveTextContent('TPS: 42')
    expect(screen.getByTestId('hud')).toHaveTextContent('Instances: 102,400')
  })
})
