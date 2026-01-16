import { useState, useEffect } from 'react'
import './App.css'
import ArmyList from './components/ArmyList'
import FactionSelector from './components/FactionSelector'
import ShipsModal from './components/ShipsModal'
import FactionInfoModal from './components/FactionInfoModal'

// Utility functions for URL parameter management
const serializeArmyList = (armyList: Array<{
  name: string,
  count: number,
  points: number,
  prowWeapon: string | string[],
  hullWeapons: string[],
  isSquadron?: boolean
}>) => {
  return encodeURIComponent(JSON.stringify(armyList))
}

const deserializeArmyList = (serialized: string) => {
  try {
    return JSON.parse(decodeURIComponent(serialized))
  } catch {
    return []
  }
}

const updateURL = (faction: string, armyList: any[]) => {
  const url = new URL(window.location.href)
  if (faction) {
    url.searchParams.set('faction', faction)
  } else {
    url.searchParams.delete('faction')
  }
  if (armyList.length > 0) {
    url.searchParams.set('army', serializeArmyList(armyList))
  } else {
    url.searchParams.delete('army')
  }
  window.history.replaceState({}, '', url.toString())
}

function App() {
  const [selectedFaction, setSelectedFaction] = useState('')
  const [factions, setFactions] = useState<string[]>([])
  const [factionData, setFactionData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [armyList, setArmyList] = useState<Array<{
    name: string,
    count: number,
    points: number,
    prowWeapon: string | string[],
    hullWeapons: string[],
    isSquadron?: boolean
  }>>([])
  const [totalPoints, setTotalPoints] = useState(0)
  const [isShipsModalOpen, setIsShipsModalOpen] = useState(false)
  const [isFactionInfoModalOpen, setIsFactionInfoModalOpen] = useState(false)
  const [factionInfoTab, setFactionInfoTab] = useState<'abilities' | 'rules'>('abilities')

  const handleFactionChange = (newFaction: string) => {
    setSelectedFaction(newFaction)
    // Reset army data when faction changes
    const newArmyList: Array<{
      name: string,
      count: number,
      points: number,
      prowWeapon: string | string[],
      hullWeapons: string[],
      isSquadron?: boolean
    }> = []
    setArmyList(newArmyList)
    setTotalPoints(0)
    // Update URL with new faction and empty army
    updateURL(newFaction, newArmyList)
  }

  useEffect(() => {
    fetch('./data/factions.json')
      .then(response => response.json())
      .then(data => {
        setFactionData(data)
        setFactions(Object.keys(data))

        // After faction data is loaded, restore state from URL parameters
        const urlParams = new URLSearchParams(window.location.search)
        const factionParam = urlParams.get('faction')
        const armyParam = urlParams.get('army')

        if (factionParam && data[factionParam]) {
          setSelectedFaction(factionParam)
        }

        if (armyParam && factionParam && data[factionParam]) {
          const restoredArmyList = deserializeArmyList(armyParam)
          if (Array.isArray(restoredArmyList)) {
            // Validate that all ships in the army list exist in the faction data
            const validArmyList = restoredArmyList.filter(ship =>
              data[factionParam].ships && data[factionParam].ships[ship.name]
            )
            setArmyList(validArmyList)
            // Recalculate total points
            const total = validArmyList.reduce((sum, ship) => sum + ship.points, 0)
            setTotalPoints(total)
          }
        }

        setLoading(false)
      })
      .catch(error => {
        console.error('Error loading factions:', error)
        setLoading(false)
      })
  }, [])

  const addShipToArmy = (shipName: string, shipData: any) => {
    const basePoints = shipData.points
    const isSquadron = shipData.size.toLowerCase() === 'squadron'
    const shipPoints = isSquadron ? basePoints * 3 : basePoints

    // Add each ship as a separate entry with weapon selections
    const newShip = {
      name: shipName,
      count: 1,
      points: shipPoints,
      prowWeapon: isSquadron ? [] : '',
      hullWeapons: [],
      isSquadron: isSquadron
    }
    const newArmyList = [...armyList, newShip]
    setArmyList(newArmyList)
    setTotalPoints(totalPoints + shipPoints)

    // Update URL with new army list
    updateURL(selectedFaction, newArmyList)

    // Close the modal after adding the ship
    setIsShipsModalOpen(false)
  }

  const removeShipFromArmy = (index: number) => {
    const shipToRemove = armyList[index]
    const updatedArmyList = armyList.filter((_, i) => i !== index)
    setArmyList(updatedArmyList)
    setTotalPoints(totalPoints - shipToRemove.points)
    // Update URL with updated army list
    updateURL(selectedFaction, updatedArmyList)
  }

  const updateShipWeapons = (index: number, prowWeapon: string | string[], hullWeapons: string[]) => {
    const updatedArmyList = [...armyList]
    updatedArmyList[index].prowWeapon = prowWeapon
    updatedArmyList[index].hullWeapons = hullWeapons
    setArmyList(updatedArmyList)
    // Update URL with updated army list
    updateURL(selectedFaction, updatedArmyList)
  }

  const hasDuplicateShips = () => {
    if (armyList.length < 2) return false

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
  }

  const hasIncompleteWeaponSelections = () => {
    if (armyList.length === 0) return false

    return armyList.some(ship => {
      const shipData = factionData[selectedFaction].ships[ship.name]
      return !isShipWeaponSelectionComplete(ship, shipData)
    })
  }

  const isShipWeaponSelectionComplete = (ship: any, shipData: any) => {
    // Check if all required prow weapons are selected
    if (shipData.prow) {
      const requiredProwSelections = shipData.prow.select
      const currentProwSelections = Array.isArray(ship.prowWeapon) ? ship.prowWeapon.length : (ship.prowWeapon ? 1 : 0)

      if (currentProwSelections < requiredProwSelections) {
        return false
      }

      // Check if any prow weapons are still default/empty
      if (Array.isArray(ship.prowWeapon)) {
        if (ship.prowWeapon.some((weapon: string) => !weapon || weapon === '')) {
          return false
        }
      } else if (!ship.prowWeapon || ship.prowWeapon === '') {
        return false
      }
    }

    // Check if all required hull weapons are selected
    if (shipData.hull) {
      const requiredHullSelections = ship.isSquadron ? shipData.hull.select * 3 : shipData.hull.select

      if (ship.hullWeapons.length < requiredHullSelections) {
        return false
      }

      // Check if any hull weapons are still default/empty
      if (ship.hullWeapons.some((weapon: string) => !weapon || weapon === '')) {
        return false
      }
    }

    return true
  }

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
          onFactionChange={setSelectedFaction}
          onFactionSelect={handleFactionChange}
        />

        {selectedFaction && factionData && (
          <div className="action-buttons">
            <button
              className="open-ships-modal-btn"
              onClick={() => setIsShipsModalOpen(true)}
            >
              <i className="fas fa-plus"></i>
              Add ship
            </button>

            <button
              className="faction-info-btn"
              onClick={() => {
                setFactionInfoTab('abilities')
                setIsFactionInfoModalOpen(true)
              }}
            >
              <i className="fas fa-dice"></i>
              Void Admiral Abilities
            </button>

            <button
              className="faction-info-btn"
              onClick={() => {
                setFactionInfoTab('rules')
                setIsFactionInfoModalOpen(true)
              }}
            >
              <i className="fas fa-book"></i>
              Fluff & Rules
            </button>

            {armyList.length > 0 && (
              <button
                className="print-btn"
                onClick={() => window.print()}
              >
                <i className="fas fa-print"></i>
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
            hasDuplicateShips={hasDuplicateShips()}
            hasIncompleteWeaponSelections={hasIncompleteWeaponSelections()}
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

      {!selectedFaction && factionData && (
        <div className="bookmark-notice">
          <i className="fas fa-bookmark"></i>
          Bookmark any list to come back to it later, or share the URL with your friends
        </div>
      )}

      {/* Printable content - hidden on screen */}
      {selectedFaction && factionData && armyList.length > 0 && (
        <div className="print-content" style={{ display: 'none' }}>
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
                  <tr key={index}>
                    <td>{ship.name}</td>
                    <td>{shipData.size}</td>
                    <td>{ship.points}</td>
                    <td>{shipData.statline.Hull}</td>
                    <td>{shipData.statline.Speed}</td>
                    <td>{shipData.statline.Shields}</td>
                    <td>{shipData.statline.Flak}</td>
                    <td>
                      {Array.isArray(ship.prowWeapon)
                        ? ship.prowWeapon.join(', ')
                        : ship.prowWeapon || 'None'
                      }
                    </td>
                    <td>{ship.hullWeapons.join(', ')}</td>
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
            {factionData[selectedFaction].specialRules?.map((rule: any, index: number) => (
              <div key={index} className="print-rule">
                <div className="print-rule-name">{rule.name}</div>
                <div>{rule.description}</div>
              </div>
            ))}
          </div>

          <div className="print-section">
            <h3>Command Abilities</h3>
            {factionData[selectedFaction].commandAbilities?.map((ability: any, index: number) => (
              <div key={index} className="print-ability">
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
