import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import './App.css'
import ArmyList from './components/ArmyList'
import FactionSelector from './components/FactionSelector'
import ShipsModal from './components/ShipsModal'
import FactionInfoModal from './components/FactionInfoModal'
import type { ArmyShip, FactionData, ShipData } from './types'
import { deserializeArmyList, updateURL, createDebouncedUpdateURL } from './utils/urlUtils'
import { formatWeaponDisplay } from './utils/weaponUtils'
import { isShipWeaponSelectionComplete } from './utils/weaponUtils'
import { validateArmyList, isValidFaction } from './utils/validation'

function App() {
  const [selectedFaction, setSelectedFaction] = useState('')
  const [factions, setFactions] = useState<string[]>([])
  const [factionData, setFactionData] = useState<FactionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [armyList, setArmyList] = useState<ArmyShip[]>([])
  const [isShipsModalOpen, setIsShipsModalOpen] = useState(false)
  const [isFactionInfoModalOpen, setIsFactionInfoModalOpen] = useState(false)
  const [factionInfoTab, setFactionInfoTab] = useState<'abilities' | 'rules'>('abilities')

  // Create debounced URL updater
  const debouncedUpdateURLRef = useRef(createDebouncedUpdateURL(500))

  // Derive totalPoints from armyList
  const totalPoints = useMemo(() => {
    return armyList.reduce((sum, ship) => sum + ship.points, 0)
  }, [armyList])

  const handleFactionChange = useCallback((newFaction: string) => {
    setSelectedFaction(newFaction)
    // Reset army data when faction changes
    const newArmyList: ArmyShip[] = []
    setArmyList(newArmyList)
    // Update URL with new faction and empty army (immediate for faction change)
    updateURL(newFaction, newArmyList)
  }, [])

  useEffect(() => {
    fetch('./data/factions.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load factions: ${response.statusText}`)
        }
        return response.json()
      })
      .then(data => {
        setFactionData(data)
        setFactions(Object.keys(data))
        setError(null)

        // After faction data is loaded, restore state from URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const factionParam = urlParams.get('faction')
        const armyParam = urlParams.get('army')

        if (factionParam && isValidFaction(factionParam, data)) {
          setSelectedFaction(factionParam)

          if (armyParam) {
            const restoredArmyList = deserializeArmyList(armyParam)
            const validArmyList = validateArmyList(restoredArmyList, factionParam, data)
            setArmyList(validArmyList)
          }
        }

        setLoading(false)
      })
      .catch(error => {
        console.error('Error loading factions:', error)
        setError('Failed to load faction data. Please refresh the page.')
        setLoading(false)
      })
  }, [])

  const addShipToArmy = useCallback((shipName: string, shipData: ShipData) => {
    const basePoints = shipData.points
    const isSquadron = shipData.size.toLowerCase() === 'squadron'
    const shipPoints = isSquadron ? basePoints * 3 : basePoints

    // Add each ship as a separate entry with weapon selections
    const newShip: ArmyShip = {
      name: shipName,
      count: 1,
      points: shipPoints,
      prowWeapon: isSquadron ? [] : '',
      hullWeapons: [],
      isSquadron: isSquadron
    }
    setArmyList(prev => {
      const newArmyList = [...prev, newShip]
      // Debounced URL update
      debouncedUpdateURLRef.current(selectedFaction, newArmyList)
      return newArmyList
    })

    // Close the modal after adding the ship
    setIsShipsModalOpen(false)
  }, [selectedFaction])

  const removeShipFromArmy = useCallback((index: number) => {
    setArmyList(prev => {
      const updatedArmyList = prev.filter((_, i) => i !== index)
      // Debounced URL update
      debouncedUpdateURLRef.current(selectedFaction, updatedArmyList)
      return updatedArmyList
    })
  }, [selectedFaction])

  const updateShipWeapons = useCallback((index: number, prowWeapon: string | string[], hullWeapons: string[]) => {
    setArmyList(prev => {
      const updatedArmyList = [...prev]
      updatedArmyList[index] = {
        ...updatedArmyList[index],
        prowWeapon,
        hullWeapons
      }
      // Debounced URL update
      debouncedUpdateURLRef.current(selectedFaction, updatedArmyList)
      return updatedArmyList
    })
  }, [selectedFaction])

  const hasDuplicateShips = useMemo(() => {
    if (armyList.length < 2 || !factionData || !selectedFaction) return false

    for (let i = 0; i < armyList.length; i++) {
      for (let j = i + 1; j < armyList.length; j++) {
        const ship1 = armyList[i]
        const ship2 = armyList[j]

        // Skip squadrons
        if (ship1.isSquadron || ship2.isSquadron) continue

        // Skip ships with incomplete weapon selections
        const ship1Complete = isShipWeaponSelectionComplete(ship1, factionData[selectedFaction].ships[ship1.name])
        const ship2Complete = isShipWeaponSelectionComplete(ship2, factionData[selectedFaction].ships[ship2.name])
        if (!ship1Complete || !ship2Complete) continue

        // Check if ships have same name/class
        if (ship1.name === ship2.name) {
          // Check if weapon configurations are identical
          const prow1 = Array.isArray(ship1.prowWeapon) ? ship1.prowWeapon.sort().join(',') : (ship1.prowWeapon || '')
          const prow2 = Array.isArray(ship2.prowWeapon) ? ship2.prowWeapon.sort().join(',') : (ship2.prowWeapon || '')
          const hull1 = [...ship1.hullWeapons].sort().join(',')
          const hull2 = [...ship2.hullWeapons].sort().join(',')

          if (prow1 === prow2 && hull1 === hull2) {
            return true
          }
        }
      }
    }
    return false
  }, [armyList, factionData, selectedFaction])

  const hasIncompleteWeaponSelections = useMemo(() => {
    if (armyList.length === 0 || !factionData || !selectedFaction) return false

    return armyList.some(ship => {
      const shipData = factionData[selectedFaction].ships[ship.name]
      return !isShipWeaponSelectionComplete(ship, shipData)
    })
  }, [armyList, factionData, selectedFaction])

  return (
    <div className="App">
      <header className="App-header">
        {!selectedFaction && (
          <>
            <h1>Welcome to Void Admiral Builder</h1>
            <p>Select your army list to begin:</p>
          </>
        )}
        <FactionSelector
          factions={factions}
          selectedFaction={selectedFaction}
          loading={loading}
          onFactionSelect={handleFactionChange}
        />

        {selectedFaction && factionData && (
          <div className="action-buttons">
            <button
              className="open-ships-modal-btn"
              onClick={() => setIsShipsModalOpen(true)}
              aria-label="Add ship to army"
            >
              <i className="fas fa-plus" aria-hidden="true"></i>
              Add ship
            </button>

            <button
              className="faction-info-btn"
              onClick={() => {
                setFactionInfoTab('abilities')
                setIsFactionInfoModalOpen(true)
              }}
              aria-label="View void admiral abilities"
            >
              <i className="fas fa-dice" aria-hidden="true"></i>
              Void Admiral Abilities
            </button>

            <button
              className="faction-info-btn"
              onClick={() => {
                setFactionInfoTab('rules')
                setIsFactionInfoModalOpen(true)
              }}
              aria-label="View faction fluff and rules"
            >
              <i className="fas fa-book" aria-hidden="true"></i>
              Fluff & Rules
            </button>

            {armyList.length > 0 && (
              <button
                className="print-btn"
                onClick={() => window.print()}
                aria-label="Print army list"
              >
                <i className="fas fa-print" aria-hidden="true"></i>
                Print List
              </button>
            )}
          </div>
        )}
      </header>

      {selectedFaction && factionData && (
        <div className="main-content">
          <ArmyList
            armyList={armyList}
            factionData={factionData}
            selectedFaction={selectedFaction}
            totalPoints={totalPoints}
            hasDuplicateShips={hasDuplicateShips}
            hasIncompleteWeaponSelections={hasIncompleteWeaponSelections}
            onRemoveShip={removeShipFromArmy}
            onUpdateWeapons={updateShipWeapons}
          />

          <ShipsModal
            isOpen={isShipsModalOpen}
            onClose={() => setIsShipsModalOpen(false)}
            factionData={factionData}
            selectedFaction={selectedFaction}
            onAddToArmy={addShipToArmy}
          />

          <FactionInfoModal
            isOpen={isFactionInfoModalOpen}
            onClose={() => setIsFactionInfoModalOpen(false)}
            factionData={factionData}
            selectedFaction={selectedFaction}
            activeTab={factionInfoTab}
          />
        </div>
      )}

      {error && (
        <div className="error-message" role="alert" style={{
          padding: '1rem',
          margin: '1rem',
          backgroundColor: '#d32f2f',
          color: '#fff',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          <i className="fas fa-exclamation-circle" aria-hidden="true"></i>
          {error}
        </div>
      )}

      {!selectedFaction && factionData && (
        <div className="bookmark-notice">
          <i className="fas fa-bookmark" aria-hidden="true"></i>
          Bookmark any list to come back to it later, or share the URL with your friends
        </div>
      )}

      {/* Printable content - hidden on screen */}
      {selectedFaction && factionData && armyList.length > 0 && (
        <div className="print-content">
          <div className="print-header">
            <div className="print-title">Void Admiral Army List</div>
            <div className="print-subtitle">Faction: {selectedFaction}</div>
          </div>

          <table className="print-table">
            <thead>
              <tr>
                <th>Ship</th>
                <th>Size</th>
                <th>Points</th>
                <th>Hull</th>
                <th>Speed</th>
                <th>Shields</th>
                <th>Flak</th>
                <th>Prow Weapons</th>
                <th>Hull Weapons</th>
              </tr>
            </thead>
            <tbody>
              {armyList.map((ship, index) => {
                const shipData = factionData[selectedFaction].ships[ship.name]
                return (
                  <tr key={`${ship.name}-${index}-${ship.points}`}>
                    <td>{ship.name}</td>
                    <td>{shipData.size}</td>
                    <td>{ship.points}</td>
                    <td>{shipData.statline.Hull}</td>
                    <td>{shipData.statline.Speed}</td>
                    <td>{shipData.statline.Shields}</td>
                    <td>{shipData.statline.Flak}</td>
                    <td>
                      {Array.isArray(ship.prowWeapon)
                        ? ship.prowWeapon.map((weapon, idx) => (
                            <div key={idx}>
                              {formatWeaponDisplay(weapon, shipData.prow?.options || [])}
                            </div>
                          ))
                        : ship.prowWeapon
                        ? formatWeaponDisplay(ship.prowWeapon, shipData.prow?.options || [])
                        : 'None'
                      }
                    </td>
                    <td>
                      {ship.hullWeapons.map((weapon, idx) => (
                        <div key={idx}>
                          {formatWeaponDisplay(weapon, shipData.hull?.options || [])}
                        </div>
                      ))}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div className="print-total">
            Total Points: {totalPoints}
          </div>

          <div className="print-section">
            <h3>Special Rules</h3>
            {factionData[selectedFaction].specialRules?.map((rule, index: number) => (
              <div key={`rule-${rule.name}-${index}`} className="print-rule">
                <div className="print-rule-name">{rule.name}</div>
                <div>{rule.description}</div>
              </div>
            ))}
          </div>

          <div className="print-section">
            <h3>Command Abilities</h3>
            {factionData[selectedFaction].commandAbilities?.map((ability, index: number) => (
              <div key={`ability-${ability.name}-${ability.dice}-${index}`} className="print-ability">
                <div className="print-ability-name">
                  <span className="print-ability-dice">[{ability.dice}]</span>
                  {ability.name}
                </div>
                <div>{ability.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
