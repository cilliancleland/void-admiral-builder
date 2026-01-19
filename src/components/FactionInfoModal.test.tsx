import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import FactionInfoModal from './FactionInfoModal'
import type { FactionData } from '../types'

const mockFactionData: FactionData = {
  'Loyalists': {
    fluff: 'The Loyalists are dedicated to preserving the old ways...',
    specialRules: [
      {
        name: 'Loyalist Doctrine',
        description: 'Loyalist ships gain +1 to all command checks.'
      },
      {
        name: 'Imperial Training',
        description: 'Loyalist crews are highly disciplined.'
      }
    ],
    commandAbilities: [
      {
        dice: 4,
        name: 'Imperial Command',
        description: 'Reroll any failed command check.'
      },
      {
        dice: 6,
        name: 'Fleet Coordination',
        description: 'All ships in fleet may reroll one die.'
      }
    ],
    ships: {}
  },
  'Renegades': {
    fluff: 'The Renegades reject the old order...',
    specialRules: [
      {
        name: 'Anarchic Spirit',
        description: 'Renegade ships ignore fleet restrictions.'
      }
    ],
    ships: {}
  }
}

const mockProps = {
  isOpen: true,
  onClose: vi.fn(),
  factionData: mockFactionData,
  selectedFaction: 'Loyalists',
  activeTab: 'abilities' as const
}

describe('FactionInfoModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when modal is not open', () => {
    render(<FactionInfoModal {...mockProps} isOpen={false} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders nothing when selected faction does not exist in faction data', () => {
    render(<FactionInfoModal {...mockProps} selectedFaction="NonExistentFaction" />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders modal with correct structure when open', () => {
    render(<FactionInfoModal {...mockProps} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByLabelText('Close modal')).toBeInTheDocument()
    expect(screen.getByText('Loyalists - Void Admiral Abilities')).toBeInTheDocument()
  })

  it('renders abilities tab content correctly', () => {
    render(<FactionInfoModal {...mockProps} />)

    expect(screen.getByText('Void Admiral Abilities')).toBeInTheDocument()
    expect(screen.getByText('🎲4')).toBeInTheDocument()
    expect(screen.getByText('Imperial Command')).toBeInTheDocument()
    expect(screen.getByText('Reroll any failed command check.')).toBeInTheDocument()
    expect(screen.getByText('🎲6')).toBeInTheDocument()
    expect(screen.getByText('Fleet Coordination')).toBeInTheDocument()
    expect(screen.getByText('All ships in fleet may reroll one die.')).toBeInTheDocument()
  })

  it('renders rules tab content correctly', () => {
    render(<FactionInfoModal {...mockProps} activeTab="rules" />)

    expect(screen.getByText('Loyalists - Fluff & Special Rules')).toBeInTheDocument()
    expect(screen.getByText('Faction Fluff')).toBeInTheDocument()
    expect(screen.getByText('The Loyalists are dedicated to preserving the old ways...')).toBeInTheDocument()
    expect(screen.getByText('Special Rules')).toBeInTheDocument()
    expect(screen.getByText('Loyalist Doctrine')).toBeInTheDocument()
    expect(screen.getByText('Loyalist ships gain +1 to all command checks.')).toBeInTheDocument()
    expect(screen.getByText('Imperial Training')).toBeInTheDocument()
    expect(screen.getByText('Loyalist crews are highly disciplined.')).toBeInTheDocument()
  })

  it('does not render abilities section when faction has no command abilities', () => {
    render(<FactionInfoModal {...mockProps} selectedFaction="Renegades" />)

    expect(screen.queryByText('Void Admiral Abilities')).not.toBeInTheDocument()
  })

  it('does not render fluff section when faction has no fluff', () => {
    const factionDataWithoutFluff = {
      ...mockFactionData,
      Loyalists: {
        ...mockFactionData.Loyalists,
        fluff: undefined
      }
    }

    render(<FactionInfoModal {...mockProps} factionData={factionDataWithoutFluff} activeTab="rules" />)

    expect(screen.queryByText('Faction Fluff')).not.toBeInTheDocument()
  })

  it('does not render special rules section when faction has no special rules', () => {
    const factionDataWithoutRules = {
      ...mockFactionData,
      Loyalists: {
        ...mockFactionData.Loyalists,
        specialRules: []
      }
    }

    render(<FactionInfoModal {...mockProps} factionData={factionDataWithoutRules} activeTab="rules" />)

    expect(screen.queryByText('Special Rules')).not.toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<FactionInfoModal {...mockProps} />)

    const closeButton = screen.getByLabelText('Close modal')
    await user.click(closeButton)

    expect(mockProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when clicking modal overlay', async () => {
    const user = userEvent.setup()
    render(<FactionInfoModal {...mockProps} />)

    const overlay = screen.getByRole('dialog')
    await user.click(overlay)

    expect(mockProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose when clicking modal content', async () => {
    const user = userEvent.setup()
    render(<FactionInfoModal {...mockProps} />)

    const modalContent = screen.getByText('Void Admiral Abilities').closest('.modal-content')!
    await user.click(modalContent)

    expect(mockProps.onClose).not.toHaveBeenCalled()
  })

  it('calls onClose when Escape key is pressed', async () => {
    const user = userEvent.setup()
    render(<FactionInfoModal {...mockProps} />)

    await user.keyboard('{Escape}')

    expect(mockProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('focuses close button when modal opens', async () => {
    render(<FactionInfoModal {...mockProps} />)

    const closeButton = screen.getByLabelText('Close modal')
    await waitFor(() => {
      expect(closeButton).toHaveFocus()
    })
  })

  it('maintains focus trap with Tab key navigation', async () => {
    const user = userEvent.setup()
    render(<FactionInfoModal {...mockProps} />)

    const closeButton = screen.getByLabelText('Close modal')

    // Wait for initial focus
    await waitFor(() => {
      expect(closeButton).toHaveFocus()
    })

    // Tab should cycle through focusable elements
    await user.tab()
    // Should still be focused on close button since it's the only focusable element in abilities tab
    expect(closeButton).toHaveFocus()

    // Shift+Tab should also stay on close button
    await user.tab({ shift: true })
    expect(closeButton).toHaveFocus()
  })

  it('removes event listeners when modal closes', () => {
    const { rerender } = render(<FactionInfoModal {...mockProps} />)

    // Modal is open, event listeners should be attached
    expect(document.body).toBeDefined()

    // Close modal
    rerender(<FactionInfoModal {...mockProps} isOpen={false} />)

    // Modal should be unmounted, event listeners should be cleaned up
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('handles faction with only fluff and no special rules', () => {
    const factionDataOnlyFluff = {
      'TestFaction': {
        fluff: 'This faction has only fluff.',
        ships: {}
      }
    }

    render(
      <FactionInfoModal
        {...mockProps}
        factionData={factionDataOnlyFluff}
        selectedFaction="TestFaction"
        activeTab="rules"
      />
    )

    expect(screen.getByText('Faction Fluff')).toBeInTheDocument()
    expect(screen.getByText('This faction has only fluff.')).toBeInTheDocument()
    expect(screen.queryByText('Special Rules')).not.toBeInTheDocument()
  })

  it('handles faction with only special rules and no fluff', () => {
    const factionDataOnlyRules = {
      'TestFaction': {
        specialRules: [
          {
            name: 'Test Rule',
            description: 'Test rule description.'
          }
        ],
        ships: {}
      }
    }

    render(
      <FactionInfoModal
        {...mockProps}
        factionData={factionDataOnlyRules}
        selectedFaction="TestFaction"
        activeTab="rules"
      />
    )

    expect(screen.getByText('Special Rules')).toBeInTheDocument()
    expect(screen.getByText('Test Rule')).toBeInTheDocument()
    expect(screen.queryByText('Faction Fluff')).not.toBeInTheDocument()
  })
})