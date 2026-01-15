import React from 'react'
import ArmyShipCard from './ArmyShipCard'
import './ArmyList.css'

interface ArmyShip {
  name: string
  count: number
  points: number
  prowWeapon: string | string[]
  hullWeapons: string[]
  isSquadron?: boolean
}

interface ShipData {
  size: string
  points: number
  statline: {
    Hull: number
    Speed: number
    Armour?: number
    Shields?: number
    Flak?: number
  }
  prow?: {
    select: number
    options: Array<{
      name: string
      targets?: string
      attacks?: number
      range?: string
    }>
  }
  hull?: {
    select: number
    options: Array<{
      name: string
      targets?: string
      attacks?: number
      range?: string
    }>
  }
}

interface ArmyListProps {
  armyList: ArmyShip[]
  factionData: any
  selectedFaction: string
  totalPoints: number
  onRemoveShip: (index: number) => void
  onUpdateWeapons: (index: number, prowWeapon: string | string[], hullWeapons: string[]) => void
}

const ArmyList: React.FC<ArmyListProps> = ({
  armyList,
  factionData,
  selectedFaction,
  totalPoints,
  onRemoveShip,
  onUpdateWeapons
}) => {
  return (
    <div className="army-section">
      <div className="army-list">
        <h2>Your Army</h2>
        <div className="army-total">
          <h3>Total Points: {totalPoints}</h3>
        </div>
        {armyList.length === 0 ? (
          <p>No ships added yet</p>
        ) : (
          <div className="army-ships">
            {armyList
              .sort((a, b) => b.points - a.points)
              .map((ship, index) => {
              const shipData = factionData[selectedFaction].ships[ship.name]
              return (
                <ArmyShipCard
                  key={index}
                  ship={ship}
                  shipData={shipData}
                  index={index}
                  onRemove={onRemoveShip}
                  onUpdateWeapons={onUpdateWeapons}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ArmyList