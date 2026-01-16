import type { ArmyShip, FactionData } from '../types'

/**
 * Validates that a faction exists in the faction data
 */
export const isValidFaction = (faction: string, factionData: FactionData | null): boolean => {
  return factionData !== null && faction in factionData
}

/**
 * Validates that all ships in an army list exist in the faction's ship list
 */
export const validateArmyList = (
  armyList: ArmyShip[],
  faction: string,
  factionData: FactionData | null
): ArmyShip[] => {
  if (!factionData || !factionData[faction]) {
    return []
  }

  const factionShips = factionData[faction].ships

  return armyList.filter(ship => {
    return (
      ship.name in factionShips &&
      typeof ship.name === 'string' &&
      typeof ship.count === 'number' &&
      typeof ship.points === 'number' &&
      (typeof ship.prowWeapon === 'string' || Array.isArray(ship.prowWeapon)) &&
      Array.isArray(ship.hullWeapons)
    )
  })
}
