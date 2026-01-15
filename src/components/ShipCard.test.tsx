import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import ShipCard from './ShipCard'

const mockShipData = {
  size: 'Medium',
  points: 6,
  statline: {
    Hull: 6,
    Speed: 8,
    Shields: 3,
    Flak: 2
  }
}

const mockOnAddToArmy = vi.fn()

describe('ShipCard', () => {
  it('renders ship information correctly', () => {
    render(
      <ShipCard
        shipName="Destroyer"
        shipData={mockShipData}
        onAddToArmy={mockOnAddToArmy}
      />
    )

    expect(screen.getByText('Destroyer')).toBeInTheDocument()
    expect(screen.getByText('Size:')).toBeInTheDocument()
    expect(screen.getByText('Medium')).toBeInTheDocument()
    expect(screen.getByText('Points:')).toBeInTheDocument()
    expect(screen.getByText('Hull:')).toBeInTheDocument()
    expect(screen.getByText('Speed:')).toBeInTheDocument()
    expect(screen.getByText('8"')).toBeInTheDocument()
    expect(screen.getByText('Shields:')).toBeInTheDocument()
    expect(screen.getByText('Flak:')).toBeInTheDocument()

    // Check that the stats are displayed (using more specific queries)
    const shipCard = screen.getByRole('heading', { name: 'Destroyer' }).closest('.ship-card')
    expect(shipCard).toHaveTextContent('Size: Medium')
    expect(shipCard).toHaveTextContent('Points: 6')
    expect(shipCard).toHaveTextContent('Hull: 6')
    expect(shipCard).toHaveTextContent('Speed: 8"')
    expect(shipCard).toHaveTextContent('Shields: 3')
    expect(shipCard).toHaveTextContent('Flak: 2')
  })

  it('calls onAddToArmy when Add to Army button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <ShipCard
        shipName="Destroyer"
        shipData={mockShipData}
        onAddToArmy={mockOnAddToArmy}
      />
    )

    const addButton = screen.getByRole('button', { name: /add to army/i })
    await user.click(addButton)

    expect(mockOnAddToArmy).toHaveBeenCalledWith('Destroyer', mockShipData)
  })
})