import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useNeonCityStore } from './store'
import { Hud } from './Hud'

describe('Hud', () => {
  it('renders TPS from store', () => {
    useNeonCityStore.setState({ ticksPerSecond: 42 })
    const { container } = render(<Hud />)
    expect(screen.getByTestId('tps')).toHaveTextContent('TPS: 42')
    expect(container).toMatchSnapshot()
  })
})
