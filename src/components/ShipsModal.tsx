import React from 'react'
import ShipsGrid from './ShipsGrid'
import './ShipsModal.css'

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

interface ShipsModalProps {
  isOpen: boolean
  onClose: () => void
  factionData: any
  selectedFaction: string
  onAddToArmy: (shipName: string, shipData: ShipData) => void
}

const ShipsModal: React.FC<ShipsModalProps> = ({
  isOpen,
  onClose,
  factionData,
  selectedFaction,
  onAddToArmy
}) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Available Ships - {selectedFaction}</h2>
          <button className="modal-close" onClick={onClose} title="Close modal" aria-label="Close modal">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body">
          <ShipsGrid
            factionData={factionData}
            selectedFaction={selectedFaction}
            onAddToArmy={onAddToArmy}
          />
        </div>
      </div>
    </div>
  )
}

export default ShipsModal