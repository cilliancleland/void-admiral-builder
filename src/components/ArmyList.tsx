import React, { useMemo } from 'react'
import ArmyShipCard from './ArmyShipCard'
import './ArmyList.css'
import type { ArmyShip, FactionData } from '../types'

interface ArmyListProps {
  armyList: ArmyShip[]
  factionData: FactionData
  selectedFaction: string
  totalPoints: number
  hasDuplicateShips: boolean
  hasIncompleteWeaponSelections: boolean
  onRemoveShip: (index: number) => void
  onUpdateWeapons: (index: number, prowWeapon: string | string[], hullWeapons: string[]) => void
}

const ArmyList: React.FC<ArmyListProps> = ({
  armyList,
  factionData,
  selectedFaction,
  totalPoints,
  hasDuplicateShips,
  hasIncompleteWeaponSelections,
  onRemoveShip,
  onUpdateWeapons
}) => {
  // Memoize sorted army list with original indices to avoid sorting on every render
  const sortedArmyListWithIndices = useMemo(() => {
    return armyList
      .map((ship, originalIndex) => ({ ship, originalIndex }))
      .sort((a, b) => b.ship.points - a.ship.points)
  }, [armyList])

  return (
    <div className="army-section">
      <div className="army-list">
        <h2>Your Army</h2>
        <div className="army-total">
          <h3>Total Points: {totalPoints}</h3>
          {hasDuplicateShips && (
            <div className="duplicate-warning" role="alert">
              <i className="fas fa-exclamation-triangle" aria-hidden="true"></i>
              Duplicate ships detected
            </div>
          )}
          {hasIncompleteWeaponSelections && (
            <div className="incomplete-warning" role="alert">
              <i className="fas fa-exclamation-circle" aria-hidden="true"></i>
              Ships with incomplete weapon selections
            </div>
          )}
        </div>
        {armyList.length === 0 ? (
          <p>No ships added yet</p>
        ) : (
          <div className="army-ships">
            {sortedArmyListWithIndices.map(({ ship, originalIndex }) => {
              const shipData = factionData[selectedFaction].ships[ship.name]
              // Use stable key combining ship name, original index, and ship properties for uniqueness
              const stableKey = `${ship.name}-${originalIndex}-${ship.points}-${JSON.stringify(ship.prowWeapon)}-${ship.hullWeapons.join(',')}`
              return (
                <ArmyShipCard
                  key={stableKey}
                  ship={ship}
                  shipData={shipData}
                  index={originalIndex}
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