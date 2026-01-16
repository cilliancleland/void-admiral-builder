import type { WeaponOption, ArmyShip, ShipData } from '../types'

/**
 * Formats a weapon name with its details for display
 */
export const formatWeaponDisplay = (weaponName: string, weaponOptions: WeaponOption[]): string => {
  if (!weaponName || weaponName === '') return 'None'

  const weapon = weaponOptions.find(option => option.name === weaponName)
  if (!weapon) return weaponName

  const dice = weapon.attacks || 1
  const range = weapon.range || '0"'
  const targets = weapon.targets || 'Unknown'
  return `${weaponName} (${targets}) ${dice} dice @ ${range}`
}

/**
 * Checks if a ship has all required weapon selections completed
 */
export const isShipWeaponSelectionComplete = (ship: ArmyShip, shipData: ShipData): boolean => {
  // Check if all required prow weapons are selected
  if (shipData.prow) {
    const requiredProwSelections = shipData.prow.select
    const currentProwSelections = Array.isArray(ship.prowWeapon) 
      ? ship.prowWeapon.length 
      : (ship.prowWeapon ? 1 : 0)

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
    const requiredHullSelections = ship.isSquadron 
      ? shipData.hull.select * 3 
      : shipData.hull.select

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
