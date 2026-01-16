import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from './App'

// Mock the fetch function
globalThis.fetch = vi.fn()

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

    // Mock window.location and window.history for URL parameter testing
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000/',
        search: '',
        origin: 'http://localhost:3000',
        pathname: '/',
      },
      writable: true,
    })

    Object.defineProperty(window, 'history', {
      value: {
        replaceState: vi.fn(),
      },
      writable: true,
    })
  })

  it('loads faction data on mount', async () => {
    render(<App />)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('./data/factions.json')
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

    // Click the add ship button to open modal
    const addShipsButton = screen.getByRole('button', { name: /add ship/i })
    await user.click(addShipsButton)

    // Wait for ships to load in modal
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
    expect(screen.getByRole('heading', { name: 'Total Points: 12' })).toBeInTheDocument()
  })

  it('adds ships to army and modal closes automatically', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Wait for data to load and select faction
    await waitFor(() => {
      expect(screen.getByText('Choose a faction...')).toBeInTheDocument()
    })

    const factionSelect = screen.getByRole('combobox')
    await user.selectOptions(factionSelect, 'Loyalists')

    // Click add ship button to open modal
    const addShipsButton = screen.getByRole('button', { name: /add ship/i })
    await user.click(addShipsButton)

    await waitFor(() => {
      expect(screen.getByText('Galleon')).toBeInTheDocument()
    })

    // Add a ship - modal should close automatically
    const addButton = screen.getAllByRole('button', { name: /add to army/i })[0]
    await user.click(addButton)

    // Verify modal closed (modal overlay should not be present)
    await waitFor(() => {
      expect(screen.queryByText('Available Ships - Loyalists')).not.toBeInTheDocument()
    })

    // Verify ship was added to army (galleon should be in army list)
    expect(screen.getByRole('heading', { name: 'Total Points: 9' })).toBeInTheDocument()
    expect(screen.getByText('Galleon', { selector: '.ship-name' })).toBeInTheDocument() // Should be in army now
  })

  it('can add a ship to army', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Wait for data to load and select faction
    await waitFor(() => {
      expect(screen.getByText('Choose a faction...')).toBeInTheDocument()
    })

    const factionSelect = screen.getByRole('combobox')
    await user.selectOptions(factionSelect, 'Loyalists')

    // Click add ship button to open modal
    const addShipsButton = screen.getByRole('button', { name: /add ship/i })
    await user.click(addShipsButton)

    await waitFor(() => {
      expect(screen.getByText('Galleon')).toBeInTheDocument()
    })

    // Add ship - modal should close automatically
    const addButton = screen.getAllByRole('button', { name: /add to army/i })[0]
    await user.click(addButton)

    // Verify modal closed and ship was added
    await waitFor(() => {
      expect(screen.queryByText('Available Ships - Loyalists')).not.toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Total Points: 9' })).toBeInTheDocument()
    })
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

    // Open ships modal and add one ship to army
    const addShipsButton = screen.getByRole('button', { name: /add ship/i })
    await user.click(addShipsButton)

    await waitFor(() => {
      expect(screen.getByText('Galleon')).toBeInTheDocument()
    })

    const addButton = screen.getAllByRole('button', { name: /add to army/i })[0]
    await user.click(addButton)

    // Modal closes automatically after adding ship
    // Verify ship was added
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Total Points: 9' })).toBeInTheDocument()
    })

    // Switch to a different faction
    await user.selectOptions(factionSelect, 'Renegades')

    // Verify army was reset
    await waitFor(() => {
      expect(screen.getByText('Total Points: 0')).toBeInTheDocument()
      expect(screen.getByText('No ships added yet')).toBeInTheDocument()
    })
  })

  it('updates URL when faction is selected', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Choose a faction...')).toBeInTheDocument()
    })

    // Select faction
    const factionSelect = screen.getByRole('combobox')
    await user.selectOptions(factionSelect, 'Loyalists')

    // Verify URL was updated with faction parameter
    expect(window.history.replaceState).toHaveBeenCalledWith(
      {},
      '',
      expect.stringContaining('faction=Loyalists')
    )
  })

  it('updates URL when ships are added to army', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Wait for data to load and select faction
    await waitFor(() => {
      expect(screen.getByText('Choose a faction...')).toBeInTheDocument()
    })

    const factionSelect = screen.getByRole('combobox')
    await user.selectOptions(factionSelect, 'Loyalists')

    // Clear previous history calls
    vi.mocked(window.history.replaceState).mockClear()

    // Add a ship to army
    const addShipsButton = screen.getByRole('button', { name: /add ship/i })
    await user.click(addShipsButton)

    await waitFor(() => {
      expect(screen.getByText('Galleon')).toBeInTheDocument()
    })

    const addButton = screen.getAllByRole('button', { name: /add to army/i })[0]
    await user.click(addButton)

    // Verify URL was updated with army data
    await waitFor(() => {
      expect(window.history.replaceState).toHaveBeenCalledWith(
        {},
        '',
        expect.stringContaining('army=')
      )
    })
  })

  it('restores state from URL parameters on mount', async () => {
    // Mock URL with faction and army parameters
    const mockArmyData = [
      {
        name: 'Galleon',
        count: 1,
        points: 9,
        prowWeapon: '',
        hullWeapons: [],
        isSquadron: false
      }
    ]
    const encodedArmy = encodeURIComponent(JSON.stringify(mockArmyData))

    Object.defineProperty(window, 'location', {
      value: {
        href: `http://localhost:3000/?faction=Loyalists&army=${encodedArmy}`,
        search: `?faction=Loyalists&army=${encodedArmy}`,
        origin: 'http://localhost:3000',
        pathname: '/',
      },
      writable: true,
    })

    render(<App />)

    // Wait for faction to be restored and army to be loaded
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Total Points: 9' })).toBeInTheDocument()
    })

    // Verify the ship was restored
    expect(screen.getByText('Galleon', { selector: '.ship-name' })).toBeInTheDocument()
  })
})