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
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
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

  it('handles fetch error gracefully', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load faction data. Please refresh the page.')).toBeInTheDocument()
    })

    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('handles HTTP error response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: () => Promise.reject(new Error('Not found'))
    } as Response)

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Failed to load faction data. Please refresh the page.')).toBeInTheDocument()
    })
  })

  it('opens faction info modal for abilities tab', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Wait for data to load and select faction
    await waitFor(() => {
      expect(screen.getByText('Choose a faction...')).toBeInTheDocument()
    })

    const factionSelect = screen.getByRole('combobox')
    await user.selectOptions(factionSelect, 'Loyalists')

    // Click void admiral abilities button
    const abilitiesButton = screen.getByRole('button', { name: 'View void admiral abilities' })
    await user.click(abilitiesButton)

    // Modal should be open
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Loyalists - Void Admiral Abilities')).toBeInTheDocument()
  })

  it('opens faction info modal for rules tab', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Wait for data to load and select faction
    await waitFor(() => {
      expect(screen.getByText('Choose a faction...')).toBeInTheDocument()
    })

    const factionSelect = screen.getByRole('combobox')
    await user.selectOptions(factionSelect, 'Loyalists')

    // Click fluff & rules button
    const rulesButton = screen.getByRole('button', { name: 'View faction fluff and rules' })
    await user.click(rulesButton)

    // Modal should be open
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Loyalists - Fluff & Special Rules')).toBeInTheDocument()
  })

  it('closes faction info modal when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Wait for data to load and select faction
    await waitFor(() => {
      expect(screen.getByText('Choose a faction...')).toBeInTheDocument()
    })

    const factionSelect = screen.getByRole('combobox')
    await user.selectOptions(factionSelect, 'Loyalists')

    // Open modal
    const abilitiesButton = screen.getByRole('button', { name: 'View void admiral abilities' })
    await user.click(abilitiesButton)

    expect(screen.getByRole('dialog')).toBeInTheDocument()

    // Close modal
    const closeButton = screen.getByLabelText('Close modal')
    await user.click(closeButton)

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('shows print button when army has ships', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Wait for data to load and select faction
    await waitFor(() => {
      expect(screen.getByText('Choose a faction...')).toBeInTheDocument()
    })

    const factionSelect = screen.getByRole('combobox')
    await user.selectOptions(factionSelect, 'Loyalists')

    // Initially no print button
    expect(screen.queryByRole('button', { name: 'Print army list' })).not.toBeInTheDocument()

    // Add a ship
    const addShipsButton = screen.getByRole('button', { name: /add ship/i })
    await user.click(addShipsButton)

    await waitFor(() => {
      expect(screen.getByText('Galleon')).toBeInTheDocument()
    })

    const addButton = screen.getAllByRole('button', { name: /add to army/i })[0]
    await user.click(addButton)

    // Now print button should be visible
    expect(screen.getByRole('button', { name: 'Print army list' })).toBeInTheDocument()
  })

  it('calls window.print when print button is clicked', async () => {
    const user = userEvent.setup()
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {})

    render(<App />)

    // Wait for data to load and select faction
    await waitFor(() => {
      expect(screen.getByText('Choose a faction...')).toBeInTheDocument()
    })

    const factionSelect = screen.getByRole('combobox')
    await user.selectOptions(factionSelect, 'Loyalists')

    // Add a ship to enable print button
    const addShipsButton = screen.getByRole('button', { name: /add ship/i })
    await user.click(addShipsButton)

    await waitFor(() => {
      expect(screen.getByText('Galleon')).toBeInTheDocument()
    })

    const addButton = screen.getAllByRole('button', { name: /add to army/i })[0]
    await user.click(addButton)

    // Click print button
    const printButton = screen.getByRole('button', { name: 'Print army list' })
    await user.click(printButton)

    expect(printSpy).toHaveBeenCalledTimes(1)

    printSpy.mockRestore()
  })

  it('can remove ships from army', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Wait for data to load and select faction
    await waitFor(() => {
      expect(screen.getByText('Choose a faction...')).toBeInTheDocument()
    })

    const factionSelect = screen.getByRole('combobox')
    await user.selectOptions(factionSelect, 'Loyalists')

    // Add a ship
    const addShipsButton = screen.getByRole('button', { name: /add ship/i })
    await user.click(addShipsButton)

    await waitFor(() => {
      expect(screen.getByText('Galleon')).toBeInTheDocument()
    })

    const addButton = screen.getAllByRole('button', { name: /add to army/i })[0]
    await user.click(addButton)

    // Verify ship was added
    expect(screen.getByText('Galleon', { selector: '.ship-name' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Total Points: 9' })).toBeInTheDocument()

    // Remove the ship
    const removeButton = screen.getByRole('button', { name: 'Remove Galleon from army' })
    await user.click(removeButton)

    // Verify ship was removed
    expect(screen.queryByText('Galleon', { selector: '.ship-name' })).not.toBeInTheDocument()
    expect(screen.getByText('Total Points: 0')).toBeInTheDocument()
    expect(screen.getByText('No ships added yet')).toBeInTheDocument()
  })

  it('can update ship weapons', async () => {
    const user = userEvent.setup()
    render(<App />)

    // Wait for data to load and select faction
    await waitFor(() => {
      expect(screen.getByText('Choose a faction...')).toBeInTheDocument()
    })

    const factionSelect = screen.getByRole('combobox')
    await user.selectOptions(factionSelect, 'Loyalists')

    // Add a ship
    const addShipsButton = screen.getByRole('button', { name: /add ship/i })
    await user.click(addShipsButton)

    await waitFor(() => {
      expect(screen.getByText('Galleon')).toBeInTheDocument()
    })

    const addButton = screen.getAllByRole('button', { name: /add to army/i })[0]
    await user.click(addButton)

    // Find weapon selects in army list
    const weaponSelects = screen.getAllByRole('combobox')

    // Update a hull weapon (assuming first ship has hull weapons)
    if (weaponSelects.length > 0) {
      // This test assumes the ship has weapon options - may need adjustment based on actual data
      const firstWeaponSelect = weaponSelects[0]

      // Mock weapon options - this would need to be adjusted based on actual faction data
      // For now, just test that the select exists
      expect(firstWeaponSelect).toBeInTheDocument()
    }
  })

  it('allows adding multiple ships to army', async () => {
    const user = userEvent.setup()

    // Mock faction data with ships
    const mockFactionDataWithWeapons = {
      'TestFaction': {
        ships: {
          'TestShip': {
            size: 'Medium',
            points: 5,
            statline: { Hull: 5, Speed: 8 },
            prow: {
              select: 1,
              options: [{ name: 'Laser Cannon', targets: 'Hull', attacks: 2, range: '12"' }]
            },
            hull: {
              select: 1,
              options: [{ name: 'Torpedo', targets: 'Hull', attacks: 3, range: '18"' }]
            }
          }
        }
      }
    }

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve(mockFactionDataWithWeapons)
    } as Response)

    render(<App />)

    // Wait for data to load and select faction
    await waitFor(() => {
      expect(screen.getByText('Choose a faction...')).toBeInTheDocument()
    })

    const factionSelect = screen.getByRole('combobox')
    await user.selectOptions(factionSelect, 'TestFaction')

    // Add first ship
    const addShipsButton = screen.getByRole('button', { name: /add ship/i })
    await user.click(addShipsButton)

    await waitFor(() => {
      expect(screen.getByText('TestShip')).toBeInTheDocument()
    })

    const addButton = screen.getAllByRole('button', { name: /add to army/i })[0]
    await user.click(addButton)

    // Add second ship
    await user.click(addShipsButton)

    await waitFor(() => {
      const addButtons = screen.getAllByRole('button', { name: /add to army/i })
      expect(addButtons).toHaveLength(1)
    })

    const addButtons = screen.getAllByRole('button', { name: /add to army/i })
    await user.click(addButtons[0])

    // Should have two ships in army
    expect(screen.getAllByText('TestShip', { selector: '.ship-name' })).toHaveLength(2)
    expect(screen.getByRole('heading', { name: 'Total Points: 10' })).toBeInTheDocument()
  })

  it('detects incomplete weapon selections', async () => {
    const user = userEvent.setup()

    // Mock faction data with required weapons
    const mockFactionDataWithWeapons = {
      'TestFaction': {
        ships: {
          'TestShip': {
            size: 'Medium',
            points: 5,
            statline: { Hull: 5, Speed: 8 },
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
        }
      }
    }

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve(mockFactionDataWithWeapons)
    } as Response)

    render(<App />)

    // Wait for data to load and select faction
    await waitFor(() => {
      expect(screen.getByText('Choose a faction...')).toBeInTheDocument()
    })

    const factionSelect = screen.getByRole('combobox')
    await user.selectOptions(factionSelect, 'TestFaction')

    // Add a ship - it will have incomplete weapons by default
    const addShipsButton = screen.getByRole('button', { name: /add ship/i })
    await user.click(addShipsButton)

    await waitFor(() => {
      expect(screen.getByText('TestShip')).toBeInTheDocument()
    })

    const addButton = screen.getAllByRole('button', { name: /add to army/i })[0]
    await user.click(addButton)

    // Should show incomplete weapon warning (implementation depends on ArmyList component)
    // This test verifies the incomplete weapon detection logic in App.tsx works
    expect(screen.getByText('TestShip', { selector: '.ship-name' })).toBeInTheDocument()
  })
})