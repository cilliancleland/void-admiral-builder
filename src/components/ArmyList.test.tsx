import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import ArmyList from './ArmyList'

const mockFactionData = {
  'Loyalists': {
    ships: {
      'Galleon': {
        size: 'Large',
        points: 9,
        statline: { Hull: 10, Speed: 6, Shields: 4, Flak: 3 }
      }
    }
  }
}

const mockArmyList = [
  {
    name: 'Galleon',
    count: 1,
    points: 9,
    prowWeapon: '',
    hullWeapons: ['', '', '']
  }
]

const mockOnRemoveShip = vi.fn()
const mockOnUpdateWeapons = vi.fn()

describe('ArmyList', () => {
  it('displays army total points', () => {
    render(
      <ArmyList
        armyList={mockArmyList}
        factionData={mockFactionData}
        selectedFaction="Loyalists"
        totalPoints={9}
        onRemoveShip={mockOnRemoveShip}
        onUpdateWeapons={mockOnUpdateWeapons}
      />
    )

    expect(screen.getByText('Total Points: 9')).toBeInTheDocument()
  })

  it('shows empty message when no ships in army', () => {
    render(
      <ArmyList
        armyList={[]}
        factionData={mockFactionData}
        selectedFaction="Loyalists"
        totalPoints={0}
        onRemoveShip={mockOnRemoveShip}
        onUpdateWeapons={mockOnUpdateWeapons}
      />
    )

    expect(screen.getByText('No ships added yet')).toBeInTheDocument()
  })

  it('displays ship cards with correct information', () => {
    render(
      <ArmyList
        armyList={mockArmyList}
        factionData={mockFactionData}
        selectedFaction="Loyalists"
        totalPoints={9}
        onRemoveShip={mockOnRemoveShip}
        onUpdateWeapons={mockOnUpdateWeapons}
      />
    )

    expect(screen.getByText('Galleon')).toBeInTheDocument()
    expect(screen.getByText('9 pts')).toBeInTheDocument()
    expect(screen.getByText('Hull: 10')).toBeInTheDocument()
    expect(screen.getByText('Speed: 6"')).toBeInTheDocument()
  })

  it('calls onRemoveShip when delete button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <ArmyList
        armyList={mockArmyList}
        factionData={mockFactionData}
        selectedFaction="Loyalists"
        totalPoints={9}
        onRemoveShip={mockOnRemoveShip}
        onUpdateWeapons={mockOnUpdateWeapons}
      />
    )

    const deleteButton = screen.getByRole('button', { name: /remove ship/i })
    await user.click(deleteButton)

    expect(mockOnRemoveShip).toHaveBeenCalledWith(0)
  })
})