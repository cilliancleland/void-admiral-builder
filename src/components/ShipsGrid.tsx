import React from 'react'
import ShipCard from './ShipCard'
import './ShipsGrid.css'

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
}

interface ShipsGridProps {
  factionData: any
  selectedFaction: string
  onAddToArmy: (shipName: string, shipData: ShipData) => void
}

const ShipsGrid: React.FC<ShipsGridProps> = ({ factionData, selectedFaction, onAddToArmy }) => {
  return (
    <div className="ships-grid">
      {Object.keys(factionData[selectedFaction].ships).map((shipName) => (
        <ShipCard
          key={shipName}
          shipName={shipName}
          shipData={factionData[selectedFaction].ships[shipName]}
          onAddToArmy={onAddToArmy}
        />
      ))}
    </div>
  )
}

export default ShipsGrid