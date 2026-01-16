import type { ArmyShip } from '../types'

/**
 * Serializes an army list to a URL-safe string
 */
export const serializeArmyList = (armyList: ArmyShip[]): string => {
  return encodeURIComponent(JSON.stringify(armyList))
}

/**
 * Deserializes an army list from a URL parameter string
 */
export const deserializeArmyList = (serialized: string): ArmyShip[] => {
  try {
    const decoded = decodeURIComponent(serialized)
    const parsed = JSON.parse(decoded)
    
    // Validate that it's an array
    if (!Array.isArray(parsed)) {
      return []
    }
    
    // Validate each ship has required fields
    return parsed.filter((ship): ship is ArmyShip => {
      return (
        typeof ship === 'object' &&
        ship !== null &&
        typeof ship.name === 'string' &&
        typeof ship.count === 'number' &&
        typeof ship.points === 'number' &&
        (typeof ship.prowWeapon === 'string' || Array.isArray(ship.prowWeapon)) &&
        Array.isArray(ship.hullWeapons)
      )
    })
  } catch {
    return []
  }
}

/**
 * Updates the URL with faction and army list without adding to browser history
 */
export const updateURL = (faction: string, armyList: ArmyShip[]): void => {
  const url = new URL(window.location.href)
  if (faction) {
    url.searchParams.set('faction', faction)
  } else {
    url.searchParams.delete('faction')
  }
  if (armyList.length > 0) {
    url.searchParams.set('army', serializeArmyList(armyList))
  } else {
    url.searchParams.delete('army')
  }
  // Use replaceState to update URL without adding to browser history
  window.history.replaceState({}, '', url.toString())
}

/**
 * Debounced version of updateURL that waits before updating
 */
export const createDebouncedUpdateURL = (delay: number = 500) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  
  return (faction: string, armyList: ArmyShip[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      updateURL(faction, armyList)
      timeoutId = null
    }, delay)
  }
}
