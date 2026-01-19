import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import ArmyShipCard from './ArmyShipCard'
import type { ShipData, ArmyShip } from '../types'

const mockShipData: ShipData = {
  size: 'Medium',
  points: 6,
  statline: { Hull: 6, Speed: 8, Shields: 3, Flak: 2 },
  prow: {
    select: 1,
    options: [
      { name: 'Laser Cannon', targets: 'Hull', attacks: 2, range: '12"' },
      { name: 'Plasma Gun', targets: 'Shields', attacks: 1, range: '6"' }
    ]
  },
  hull: {
    select: 2,
    options: [
      { name: 'Torpedo', targets: 'Hull', attacks: 3, range: '18"' },
      { name: 'Missile', targets: 'Hull', attacks: 2, range: '24"' }
    ]
  }
}

const mockShipDataSquadron: ShipData = {
  ...mockShipData,
  size: 'Small',
  points: 9, // 3 points per ship
  squadron: true
}

const mockArmyShip: ArmyShip = {
  name: 'Destroyer',
  count: 1,
  points: 6,
  prowWeapon: 'Laser Cannon',
  hullWeapons: ['Torpedo', 'Missile'],
  isSquadron: false
}

const mockProps = {
  ship: mockArmyShip,
  shipData: mockShipData,
  index: 0,
  onRemove: vi.fn(),
  onUpdateWeapons: vi.fn()
}

describe('ArmyShipCard', () => {
  it('renders ship information correctly', () => {
    render(<ArmyShipCard {...mockProps} />)

    expect(screen.getByText('Destroyer')).toBeInTheDocument()
    expect(screen.getByText('6 pts')).toBeInTheDocument()
    expect(screen.getByText('Hull: 6')).toBeInTheDocument()
    expect(screen.getByText('Speed: 8"')).toBeInTheDocument()
    expect(screen.getByText('Shields: 3')).toBeInTheDocument()
    expect(screen.getByText('Flak: 2')).toBeInTheDocument()
  })

  it('renders squadron ship with correct point display', () => {
    const squadronProps = {
      ...mockProps,
      ship: {
        ...mockArmyShip,
        isSquadron: true,
        points: 9 // 3 * 3
      },
      shipData: mockShipDataSquadron
    }

    render(<ArmyShipCard {...squadronProps} />)

    expect(screen.getByText('3 x 3 = 9 pts')).toBeInTheDocument()
  })

  it('renders remove button with correct accessibility', () => {
    render(<ArmyShipCard {...mockProps} />)

    const removeButton = screen.getByRole('button', { name: 'Remove Destroyer from army' })
    expect(removeButton).toBeInTheDocument()
    expect(removeButton).toHaveAttribute('title', 'Remove ship')
  })

  it('calls onRemove when remove button is clicked', async () => {
    const user = userEvent.setup()
    render(<ArmyShipCard {...mockProps} />)

    const removeButton = screen.getByRole('button', { name: 'Remove Destroyer from army' })
    await user.click(removeButton)

    expect(mockProps.onRemove).toHaveBeenCalledWith(0)
  })

  it('does not show incomplete weapon warning when weapons are complete', () => {
    render(<ArmyShipCard {...mockProps} />)

    expect(screen.queryByTitle('Incomplete weapon selections')).not.toBeInTheDocument()
  })

  it('shows incomplete weapon warning when prow weapon is missing', () => {
    const incompleteShip = {
      ...mockArmyShip,
      prowWeapon: ''
    }

    render(<ArmyShipCard {...mockProps} ship={incompleteShip} />)

    expect(screen.getByTitle('Incomplete weapon selections')).toBeInTheDocument()
  })

  it('shows incomplete weapon warning when hull weapons are incomplete', () => {
    const incompleteShip = {
      ...mockArmyShip,
      hullWeapons: ['Torpedo'] // Only 1 of 2 required
    }

    render(<ArmyShipCard {...mockProps} ship={incompleteShip} />)

    expect(screen.getByTitle('Incomplete weapon selections')).toBeInTheDocument()
  })

  it('renders prow weapon section with correct selection count', () => {
    render(<ArmyShipCard {...mockProps} />)

    expect(screen.getByText('Prow Weapons (1 to select):')).toBeInTheDocument()
  })

  it('renders prow weapon select with options', () => {
    render(<ArmyShipCard {...mockProps} />)

    const prowSelects = screen.getAllByRole('combobox')
    expect(prowSelects.length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Laser Cannon (Hull) 2 dice @ 12"')).toBeInTheDocument()
    expect(screen.getByText('Plasma Gun (Shields) 1 dice @ 6"')).toBeInTheDocument()
  })

  it('renders prow weapon options correctly', () => {
    render(<ArmyShipCard {...mockProps} />)

    expect(screen.getByText('Choose prow weapon 1...')).toBeInTheDocument()
    expect(screen.getByText('Laser Cannon (Hull) 2 dice @ 12"')).toBeInTheDocument()
    expect(screen.getByText('Plasma Gun (Shields) 1 dice @ 6"')).toBeInTheDocument()
  })

  it('renders hull weapon section with correct selection count', () => {
    render(<ArmyShipCard {...mockProps} />)

    expect(screen.getByText('Hull Weapons (2 to select):')).toBeInTheDocument()
  })

  it('renders multiple hull weapon selects', () => {
    render(<ArmyShipCard {...mockProps} />)

    expect(screen.getByText('Choose hull weapon 1...')).toBeInTheDocument()
    expect(screen.getByText('Choose hull weapon 2...')).toBeInTheDocument()
  })

  it('renders hull weapon selects with options', () => {
    render(<ArmyShipCard {...mockProps} />)

    expect(screen.getByText('Choose hull weapon 1...')).toBeInTheDocument()
    expect(screen.getByText('Choose hull weapon 2...')).toBeInTheDocument()
    expect(screen.getAllByText('Torpedo (Hull) 3 dice @ 18"')).toHaveLength(2)
    expect(screen.getAllByText('Missile (Hull) 2 dice @ 24"')).toHaveLength(2)
  })

  it('handles squadron ships with multiplied weapon requirements', () => {
    const squadronShip = {
      ...mockArmyShip,
      isSquadron: true
    }

    render(<ArmyShipCard {...mockProps} ship={squadronShip} shipData={mockShipDataSquadron} />)

    expect(screen.getByText('Prow Weapons (3 to select):')).toBeInTheDocument()
    expect(screen.getByText('Hull Weapons (6 to select):')).toBeInTheDocument()
  })

  it('renders multiple weapon selects for squadron prow weapons', () => {
    const squadronShip = {
      ...mockArmyShip,
      isSquadron: true,
      prowWeapon: ['Laser Cannon', 'Plasma Gun', ''] // 2 selected, 1 empty
    }

    render(<ArmyShipCard {...mockProps} ship={squadronShip} shipData={mockShipDataSquadron} />)

    expect(screen.getByText('Choose prow weapon 1...')).toBeInTheDocument()
    expect(screen.getByText('Choose prow weapon 2...')).toBeInTheDocument()
    expect(screen.getByText('Choose prow weapon 3...')).toBeInTheDocument()
  })

  it('calls onUpdateWeapons when prow weapon selection changes', async () => {
    const user = userEvent.setup()
    render(<ArmyShipCard {...mockProps} />)

    const prowSelect = screen.getAllByRole('combobox')[0] // First select is prow weapon
    await user.selectOptions(prowSelect, 'Plasma Gun')

    expect(mockProps.onUpdateWeapons).toHaveBeenCalledWith(
      0,
      ['Plasma Gun'],
      ['Torpedo', 'Missile']
    )
  })

  it('calls onUpdateWeapons when hull weapon selection changes', async () => {
    const user = userEvent.setup()
    render(<ArmyShipCard {...mockProps} />)

    const hullSelects = screen.getAllByDisplayValue(/Torpedo|Missile/) as HTMLSelectElement[]
    const torpedoSelect = hullSelects.find(select => select.value === 'Torpedo')!
    await user.selectOptions(torpedoSelect, 'Missile')

    expect(mockProps.onUpdateWeapons).toHaveBeenCalledWith(
      0,
      'Laser Cannon',
      ['Missile', 'Missile']
    )
  })

  it('handles array prow weapons correctly', () => {
    const shipDataWithMultipleProw = {
      ...mockShipData,
      prow: {
        select: 2, // Need 2 selects for this test
        options: [
          { name: 'Laser Cannon', targets: 'Hull', attacks: 2, range: '12"' },
          { name: 'Plasma Gun', targets: 'Shields', attacks: 1, range: '6"' }
        ]
      }
    }

    const shipWithArrayProw = {
      ...mockArmyShip,
      prowWeapon: ['Laser Cannon', 'Plasma Gun']
    }

    render(<ArmyShipCard {...mockProps} ship={shipWithArrayProw} shipData={shipDataWithMultipleProw} />)

    // Should render multiple prow weapon selects
    expect(screen.getByText('Prow Weapons (2 to select):')).toBeInTheDocument()
    expect(screen.getByText('Choose prow weapon 1...')).toBeInTheDocument()
    expect(screen.getByText('Choose prow weapon 2...')).toBeInTheDocument()
  })

  it('handles empty prow weapon array', () => {
    const shipDataWithMultipleProw = {
      ...mockShipData,
      prow: {
        select: 2,
        options: [
          { name: 'Laser Cannon', targets: 'Hull', attacks: 2, range: '12"' },
          { name: 'Plasma Gun', targets: 'Shields', attacks: 1, range: '6"' }
        ]
      }
    }

    const shipWithEmptyArrayProw = {
      ...mockArmyShip,
      prowWeapon: ['', 'Plasma Gun']
    }

    render(<ArmyShipCard {...mockProps} ship={shipWithEmptyArrayProw} shipData={shipDataWithMultipleProw} />)

    // Should render multiple prow weapon selects
    expect(screen.getByText('Prow Weapons (2 to select):')).toBeInTheDocument()
    expect(screen.getByText('Choose prow weapon 1...')).toBeInTheDocument()
    expect(screen.getByText('Choose prow weapon 2...')).toBeInTheDocument()
    expect(screen.getAllByText('Plasma Gun (Shields) 1 dice @ 6"')).toHaveLength(2)
  })

  it('does not render prow weapon section when ship has no prow weapons', () => {
    const shipDataNoProw = {
      ...mockShipData,
      prow: undefined
    }

    render(<ArmyShipCard {...mockProps} shipData={shipDataNoProw} />)

    expect(screen.queryByText('Prow Weapons')).not.toBeInTheDocument()
  })

  it('does not render hull weapon section when ship has no hull weapons', () => {
    const shipDataNoHull = {
      ...mockShipData,
      hull: undefined
    }

    render(<ArmyShipCard {...mockProps} shipData={shipDataNoHull} />)

    expect(screen.queryByText('Hull Weapons')).not.toBeInTheDocument()
  })

  it('does not render weapon sections when no options available', () => {
    const shipDataNoOptions = {
      ...mockShipData,
      prow: {
        select: 1,
        options: []
      },
      hull: {
        select: 1,
        options: []
      }
    }

    render(<ArmyShipCard {...mockProps} shipData={shipDataNoOptions} />)

    // Should not render weapon sections when options arrays are empty
    expect(screen.queryByText(/Prow Weapons/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Hull Weapons/)).not.toBeInTheDocument()
  })

  it('handles weapons with missing optional properties', () => {
    const shipDataMinimalWeapons = {
      ...mockShipData,
      prow: {
        select: 1,
        options: [
          { name: 'Basic Weapon' }, // No targets, attacks, or range
          { name: 'Partial Weapon', targets: 'Hull' } // Missing attacks and range
        ]
      }
    }

    render(<ArmyShipCard {...mockProps} shipData={shipDataMinimalWeapons} />)

    expect(screen.getByText('Basic Weapon')).toBeInTheDocument()
    expect(screen.getByText('Partial Weapon (Hull)')).toBeInTheDocument()
  })

  it('shows incomplete warning for squadron with insufficient weapons', () => {
    const incompleteSquadron = {
      ...mockArmyShip,
      isSquadron: true,
      prowWeapon: ['Laser Cannon'], // Only 1 of 3 required
      hullWeapons: ['Torpedo', 'Missile'] // Only 2 of 6 required
    }

    render(<ArmyShipCard {...mockProps} ship={incompleteSquadron} shipData={mockShipDataSquadron} />)

    expect(screen.getByTitle('Incomplete weapon selections')).toBeInTheDocument()
  })
})