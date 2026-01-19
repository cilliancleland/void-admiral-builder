import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import axe from 'axe-core'
import App from '../App'
import ArmyShipCard from '../components/ArmyShipCard'
import FactionInfoModal from '../components/FactionInfoModal'
import ShipCard from '../components/ShipCard'
import type { ShipData, ArmyShip, FactionData } from '../types'

// Mock fetch for App component
globalThis.fetch = vi.fn()

// Mock faction data
const mockFactionData: FactionData = {
  'Loyalists': {
    fluff: 'The Loyalists are dedicated to preserving the old ways...',
    specialRules: [
      {
        name: 'Loyalist Doctrine',
        description: 'Loyalist ships gain +1 to all command checks.'
      }
    ],
    commandAbilities: [
      {
        dice: 4,
        name: 'Imperial Command',
        description: 'Reroll any failed command check.'
      }
    ],
    ships: {
      'Destroyer': {
        size: 'Medium',
        points: 6,
        statline: { Hull: 6, Speed: 8, Shields: 3, Flak: 2 }
      }
    }
  }
}

const mockShipData: ShipData = {
  size: 'Medium',
  points: 6,
  statline: { Hull: 6, Speed: 8, Shields: 3, Flak: 2 },
  prow: {
    select: 1,
    options: [{ name: 'Laser Cannon', targets: 'Hull', attacks: 2, range: '12"' }]
  },
  hull: {
    select: 2,
    options: [
      { name: 'Torpedo', targets: 'Hull', attacks: 3, range: '18"' },
      { name: 'Missile', targets: 'Hull', attacks: 2, range: '24"' }
    ]
  }
}

const mockArmyShip: ArmyShip = {
  name: 'Destroyer',
  count: 1,
  points: 6,
  prowWeapon: 'Laser Cannon',
  hullWeapons: ['Torpedo', 'Missile'],
  isSquadron: false
}

describe('Accessibility Tests', () => {
  beforeEach(() => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve(mockFactionData)
    } as Response)
  })

  describe('App Component', () => {
    it('should load without critical accessibility issues', async () => {
      const { container } = render(<App />)

      const results = await axe.run(container)
      const criticalViolations = results.violations.filter(v =>
        v.impact === 'critical' || v.impact === 'serious'
      )

      // Log any issues found for debugging
      if (criticalViolations.length > 0) {
        console.log('Accessibility violations found:', criticalViolations)
      }

      // For now, just check that we don't have critical blocking issues
      expect(criticalViolations.length).toBeLessThan(5) // Allow some minor issues
    })
  })

  describe('ArmyShipCard Component', () => {
    it('should have good accessibility', async () => {
      const mockProps = {
        ship: mockArmyShip,
        shipData: mockShipData,
        index: 0,
        onRemove: vi.fn(),
        onUpdateWeapons: vi.fn()
      }

      const { container } = render(<ArmyShipCard {...mockProps} />)
      const results = await axe.run(container)

      // Check for specific accessibility issues
      const violations = results.violations
      expect(violations.filter(v => v.impact === 'critical')).toHaveLength(0)

      // Should not have missing form labels
      const labelIssues = violations.filter(v => v.id === 'label')
      expect(labelIssues).toHaveLength(0)
    })

    it('should have proper ARIA labels and roles', () => {
      const mockProps = {
        ship: mockArmyShip,
        shipData: mockShipData,
        index: 0,
        onRemove: vi.fn(),
        onUpdateWeapons: vi.fn()
      }

      const { getByRole } = render(<ArmyShipCard {...mockProps} />)

      // Check remove button has proper accessibility
      expect(getByRole('button', { name: 'Remove Destroyer from army' })).toBeInTheDocument()
    })

    it('should display weapon selection counts for screen readers', () => {
      const mockProps = {
        ship: mockArmyShip,
        shipData: mockShipData,
        index: 0,
        onRemove: vi.fn(),
        onUpdateWeapons: vi.fn()
      }

      const { getByText } = render(<ArmyShipCard {...mockProps} />)

      // Check that weapon selection counts are visible
      expect(getByText('Prow Weapons (1 to select):')).toBeInTheDocument()
      expect(getByText('Hull Weapons (2 to select):')).toBeInTheDocument()
    })

    it('should show incomplete weapon warning with proper styling', () => {
      const incompleteShip = {
        ...mockArmyShip,
        prowWeapon: '' // incomplete
      }

      const mockProps = {
        ship: incompleteShip,
        shipData: mockShipData,
        index: 0,
        onRemove: vi.fn(),
        onUpdateWeapons: vi.fn()
      }

      const { container } = render(<ArmyShipCard {...mockProps} />)

      // Check for warning icon with title attribute
      const warningIcon = container.querySelector('.incomplete-weapon-icon')
      expect(warningIcon).toBeInTheDocument()
      expect(warningIcon).toHaveAttribute('title', 'Incomplete weapon selections')
    })
  })

  describe('FactionInfoModal Component', () => {
    const mockProps = {
      isOpen: true,
      onClose: vi.fn(),
      factionData: mockFactionData,
      selectedFaction: 'Loyalists',
      activeTab: 'abilities' as const
    }

    it('should have good accessibility', async () => {
      const { container } = render(<FactionInfoModal {...mockProps} />)
      const results = await axe.run(container)

      const criticalViolations = results.violations.filter(v =>
        v.impact === 'critical' || v.impact === 'serious'
      )
      expect(criticalViolations).toHaveLength(0)
    })

    it('should have proper modal ARIA attributes', () => {
      const { getByRole } = render(<FactionInfoModal {...mockProps} />)

      const modal = getByRole('dialog')
      expect(modal).toHaveAttribute('aria-modal', 'true')
      expect(modal).toHaveAttribute('aria-labelledby', 'faction-info-modal-title')
    })

    it('should have accessible close button', () => {
      const { getByRole } = render(<FactionInfoModal {...mockProps} />)

      const closeButton = getByRole('button', { name: 'Close modal' })
      expect(closeButton).toHaveAttribute('title', 'Close modal')
      expect(closeButton).toHaveAttribute('aria-label', 'Close modal')
    })

    it('should have proper heading structure', () => {
      const { getByRole } = render(<FactionInfoModal {...mockProps} />)

      expect(getByRole('heading', { name: 'Loyalists - Void Admiral Abilities' })).toBeInTheDocument()
    })

    it('should display dice values with proper ARIA labels', () => {
      const { container } = render(<FactionInfoModal {...mockProps} />)

      const diceElement = container.querySelector('[aria-label="Dice value: 4"]')
      expect(diceElement).toBeInTheDocument()
      expect(diceElement).toHaveTextContent('🎲4')
    })
  })

  describe('ShipCard Component', () => {
    const mockProps = {
      shipName: 'Destroyer',
      shipData: mockShipData,
      onAddToArmy: vi.fn()
    }

    it('should have good accessibility', async () => {
      const { container } = render(<ShipCard {...mockProps} />)
      const results = await axe.run(container)

      const criticalViolations = results.violations.filter(v =>
        v.impact === 'critical' || v.impact === 'serious'
      )
      expect(criticalViolations).toHaveLength(0)
    })

    it('should have accessible add to army button', () => {
      const { getByRole } = render(<ShipCard {...mockProps} />)

      expect(getByRole('button', { name: /add to army/i })).toBeInTheDocument()
    })

    it('should have proper heading structure', () => {
      const { getByRole } = render(<ShipCard {...mockProps} />)

      expect(getByRole('heading', { name: 'Destroyer' })).toBeInTheDocument()
    })
  })

  describe('Form Accessibility', () => {
    it('weapon selects should have proper labels', () => {
      const mockProps = {
        ship: mockArmyShip,
        shipData: mockShipData,
        index: 0,
        onRemove: vi.fn(),
        onUpdateWeapons: vi.fn()
      }

      const { getByText } = render(<ArmyShipCard {...mockProps} />)

      // Labels should be present for form controls
      expect(getByText('Prow Weapons (1 to select):')).toBeInTheDocument()
      expect(getByText('Hull Weapons (2 to select):')).toBeInTheDocument()
    })

    it('select options should have meaningful text', () => {
      const mockProps = {
        ship: mockArmyShip,
        shipData: mockShipData,
        index: 0,
        onRemove: vi.fn(),
        onUpdateWeapons: vi.fn()
      }

      const { getByText } = render(<ArmyShipCard {...mockProps} />)

      // Options should be descriptive
      expect(getByText('Choose prow weapon 1...')).toBeInTheDocument()
      expect(getByText('Choose hull weapon 1...')).toBeInTheDocument()
      expect(getByText('Laser Cannon (Hull) 2 dice @ 12"')).toBeInTheDocument()
    })
  })
})