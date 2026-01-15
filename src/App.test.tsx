import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import App from './App'

// Mock the fetch function
global.fetch = vi.fn()

// Mock faction data
const mockFactionData = {
  'Loyalists': {
    ships: {
      'Galleon': {
        size: 'Large',
        points: 9,
        statline: { Hull: 10, Speed: 6, Shields: 4, Flak: 3 }
      },
      'Squadron Ship': {
        size: 'Squadron',
        points: 4,
        statline: { Hull: 4, Speed: 10, Shields: 2, Flak: 1 }
      }
    }
  },
  'Renegades': {
    ships: {
      'Frigate': {
        size: 'Small',
        points: 5,
        statline: { Hull: 5, Speed: 8, Shields: 2, Flak: 2 }
      }
    }
  }
}

describe('App', () => {
  beforeEach(() => {
    vi.mocked(fetch).mockClear()
    vi.mocked(fetch).mockResolvedValueOnce({
      json: () => Promise.resolve(mockFactionData)
    } as Response)
  })

  it('loads faction data on mount', async () => {
    render(<App />)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/data/factions.json')
    })
  })

  it('displays faction selector after loading', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Choose a faction...')).toBeInTheDocument()
    })
  })

  it('calculates correct cost for squadron ships (3x multiplier)', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Choose a faction...')).toBeInTheDocument()
    })

    // Select faction
    const factionSelect = screen.getByRole('combobox')
    await user.selectOptions(factionSelect, 'Loyalists')

    // Wait for ships to load
    await waitFor(() => {
      expect(screen.getByText('Squadron Ship')).toBeInTheDocument()
    })

    // Click add to army for squadron ship
    const addButtons = screen.getAllByRole('button', { name: /add to army/i })
    const squadronButton = addButtons.find(button =>
      button.closest('.ship-card')?.textContent?.includes('Squadron Ship')
    )
    await user.click(squadronButton!)

    // Check that the cost shows 4 x 3 = 12 pts
    expect(screen.getByText('4 x 3 = 12 pts')).toBeInTheDocument()
    expect(screen.getByText('Total Points: 12')).toBeInTheDocument()
  })

  it('sorts army ships by points in descending order', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Wait for data to load and select faction
    await waitFor(() => {
      expect(screen.getByText('Choose a faction...')).toBeInTheDocument()
    })

    const factionSelect = screen.getByRole('combobox')
    await user.selectOptions(factionSelect, 'Loyalists')

    await waitFor(() => {
      expect(screen.getByText('Galleon')).toBeInTheDocument()
    })

    // Add multiple ships
    const addButtons = screen.getAllByRole('button', { name: /add to army/i })
    const galleonButton = addButtons.find(button =>
      button.closest('.ship-card')?.textContent?.includes('Galleon')
    )

    // Add two galleons and one squadron ship
    await user.click(galleonButton!) // 9 points
    await user.click(galleonButton!) // 9 points
    await user.click(addButtons.find(button =>
      button.closest('.ship-card')?.textContent?.includes('Squadron Ship')
    )!) // 12 points

    // Check that ships are sorted by points descending (12, 9, 9)
    const armyShipCards = screen.getAllByText(/pts/)
    expect(armyShipCards[0]).toHaveTextContent('4 x 3 = 12') // Squadron first
    expect(armyShipCards[1]).toHaveTextContent('9 pts') // Galleons after
  })

  it('resets army when switching factions', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Wait for data to load and select faction
    await waitFor(() => {
      expect(screen.getByText('Choose a faction...')).toBeInTheDocument()
    })

    const factionSelect = screen.getByRole('combobox')
    await user.selectOptions(factionSelect, 'Loyalists')

    // Wait for ships to load and add one to army
    await waitFor(() => {
      expect(screen.getByText('Galleon')).toBeInTheDocument()
    })

    const addButton = screen.getAllByRole('button', { name: /add to army/i })[0]
    await user.click(addButton)

    // Verify ship was added
    await waitFor(() => {
      expect(screen.getByText('Total Points: 9')).toBeInTheDocument()
    })

    // Switch to a different faction
    await user.selectOptions(factionSelect, 'Renegades')

    // Verify army was reset
    await waitFor(() => {
      expect(screen.getByText('Total Points: 0')).toBeInTheDocument()
      expect(screen.getByText('No ships added yet')).toBeInTheDocument()
    })
  })
})