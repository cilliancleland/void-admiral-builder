import React from 'react'
import ShipCard from './ShipCard'
import './ShipsGrid.css'
import type { ShipData, FactionData } from '../types'

interface ShipsGridProps {
  factionData: FactionData
  selectedFaction: string
  onAddToArmy: (shipName: string, shipData: ShipData) => void
}

const ShipsGrid: React.FC<ShipsGridProps> = React.memo(({ factionData, selectedFaction, onAddToArmy }) => {
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
})

ShipsGrid.displayName = 'ShipsGrid'

export default ShipsGrid