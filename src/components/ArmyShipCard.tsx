import React from 'react'
import './ArmyShipCard.css'

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

interface ArmyShipCardProps {
  ship: ArmyShip
  shipData: ShipData
  index: number
  onRemove: (index: number) => void
  onUpdateWeapons: (index: number, prowWeapon: string | string[], hullWeapons: string[]) => void
}

const ArmyShipCard: React.FC<ArmyShipCardProps> = ({
  ship,
  shipData,
  index,
  onRemove,
  onUpdateWeapons
}) => {
  return (
    <div className="army-ship-item">
      <button
        className="delete-ship-btn"
        onClick={() => onRemove(index)}
        title="Remove ship"
      >
        <i className="fas fa-times"></i>
      </button>
      <div className="army-ship-header">
        <span className="ship-name">{ship.name}</span>
        <span className="ship-points">
          {ship.isSquadron ? `${ship.points/3} x 3 = ${ship.points}` : ship.points} pts
        </span>
      </div>
      <div className="army-ship-stats">
        <span>Hull: {shipData.statline.Hull}</span>
        <span>Speed: {shipData.statline.Speed}"</span>
        <span>Shields: {shipData.statline.Shields || 0}</span>
        <span>Flak: {shipData.statline.Flak || 0}</span>
      </div>

      {shipData.prow && shipData.prow.options && shipData.prow.options.length > 0 && (
        <div className="weapon-section">
          <label>Prow Weapons ({ship.isSquadron ? shipData.prow.select * 3 : shipData.prow.select} to select):</label>
          {Array.from({ length: ship.isSquadron ? shipData.prow.select * 3 : shipData.prow.select }, (_, weaponIndex) => (
            <select
              key={weaponIndex}
              value={Array.isArray(ship.prowWeapon) ? ship.prowWeapon[weaponIndex] || '' : (weaponIndex === 0 ? ship.prowWeapon : '')}
              onChange={(e) => {
                const currentProwWeapons = Array.isArray(ship.prowWeapon) ? [...ship.prowWeapon] : [ship.prowWeapon || '']
                currentProwWeapons[weaponIndex] = e.target.value
                onUpdateWeapons(index, currentProwWeapons, ship.hullWeapons)
              }}
              className="weapon-select"
            >
              <option value="">Choose prow weapon {weaponIndex + 1}...</option>
              {shipData.prow.options.map((weapon: any, optionIndex: number) => (
                <option key={optionIndex} value={weapon.name}>
                  {weapon.name}
                  {weapon.attacks && weapon.range && ` (${weapon.attacks} attacks, ${weapon.range})`}
                </option>
              ))}
            </select>
          ))}
        </div>
      )}

      {shipData.hull && shipData.hull.options && shipData.hull.options.length > 0 && (
        <div className="weapon-section">
          <label>Hull Weapons ({ship.isSquadron ? shipData.hull.select * 3 : shipData.hull.select} to select):</label>
          {Array.from({ length: ship.isSquadron ? shipData.hull.select * 3 : shipData.hull.select }, (_, weaponIndex) => (
            <select
              key={weaponIndex}
              value={ship.hullWeapons[weaponIndex] || ''}
              onChange={(e) => {
                const newHullWeapons = [...ship.hullWeapons]
                newHullWeapons[weaponIndex] = e.target.value
                onUpdateWeapons(index, ship.prowWeapon, newHullWeapons)
              }}
              className="weapon-select"
            >
              <option value="">Choose hull weapon {weaponIndex + 1}...</option>
              {shipData.hull.options.map((weapon: any, optionIndex: number) => (
                <option key={optionIndex} value={weapon.name}>
                  {weapon.name}
                  {weapon.attacks && weapon.range && ` (${weapon.attacks} attacks, ${weapon.range})`}
                </option>
              ))}
            </select>
          ))}
        </div>
      )}
    </div>
  )
}

export default ArmyShipCard