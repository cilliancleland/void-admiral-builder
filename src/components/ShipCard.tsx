import React from 'react'
import './ShipCard.css'
import type { ShipData } from '../types'

interface ShipCardProps {
  shipName: string
  shipData: ShipData
  onAddToArmy: (shipName: string, shipData: ShipData) => void
}

const ShipCard: React.FC<ShipCardProps> = React.memo(({ shipName, shipData, onAddToArmy }) => {
  return (
    <div className="ship-card">
      <h3>{shipName}</h3>
      <div className="ship-details">
        <p><strong>Size:</strong> {shipData.size}</p>
        <p><strong>Points:</strong> {shipData.points}</p>
        <p><strong>Hull:</strong> {shipData.statline.Hull}</p>
        <p><strong>Speed:</strong> {shipData.statline.Speed}"</p>
        <p><strong>Shields:</strong> {shipData.statline.Shields || 0}</p>
        <p><strong>Flak:</strong> {shipData.statline.Flak || 0}</p>
      </div>
      <button
        className="add-ship-btn"
        onClick={() => onAddToArmy(shipName, shipData)}
      >
        Add to Army
      </button>
    </div>
  )
})

ShipCard.displayName = 'ShipCard'

export default ShipCard