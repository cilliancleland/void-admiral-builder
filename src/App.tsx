import { useState, useEffect } from 'react'
import './App.css'
import ShipsGrid from './components/ShipsGrid'
import ArmyList from './components/ArmyList'
import FactionSelector from './components/FactionSelector'

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

  useEffect(() => {
    fetch('/data/factions.json')
      .then(response => response.json())
      .then(data => {
        setFactionData(data)
        setFactions(Object.keys(data))
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
    setArmyList([...armyList, {
      name: shipName,
      count: 1,
      points: shipPoints,
      prowWeapon: isSquadron ? [] : '',
      hullWeapons: [],
      isSquadron: isSquadron
    }])
    setTotalPoints(totalPoints + shipPoints)
  }

  const removeShipFromArmy = (index: number) => {
    const shipToRemove = armyList[index]
    const updatedArmyList = armyList.filter((_, i) => i !== index)
    setArmyList(updatedArmyList)
    setTotalPoints(totalPoints - shipToRemove.points)
  }

  const updateShipWeapons = (index: number, prowWeapon: string | string[], hullWeapons: string[]) => {
    const updatedArmyList = [...armyList]
    updatedArmyList[index].prowWeapon = prowWeapon
    updatedArmyList[index].hullWeapons = hullWeapons
    setArmyList(updatedArmyList)
  }

  return (
    <div className="App">
      <header className="App-header">
        {!selectedFaction && (
          <>
            <h1>Welcome to Army Builder</h1>
            <p>Select your army list to begin:</p>
          </>
        )}
        <FactionSelector
          factions={factions}
          selectedFaction={selectedFaction}
          loading={loading}
          onFactionChange={setSelectedFaction}
        />
      </header>

      {selectedFaction && factionData && (
        <div className="main-content">
          <div className="ships-section">
            <div className="ships-list">
              <h2>Available Ships - {selectedFaction}</h2>
              <ShipsGrid
                factionData={factionData}
                selectedFaction={selectedFaction}
                onAddToArmy={addShipToArmy}
              />
            </div>
          </div>

          <ArmyList
            armyList={armyList}
            factionData={factionData}
            selectedFaction={selectedFaction}
            totalPoints={totalPoints}
            onRemoveShip={removeShipFromArmy}
            onUpdateWeapons={updateShipWeapons}
          />
        </div>
      )}
    </div>
  )
}

export default App
