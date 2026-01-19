import { describe, it, expect } from 'vitest'
import { formatWeaponDisplay, isShipWeaponSelectionComplete } from './weaponUtils'
import type { WeaponOption, ArmyShip, ShipData } from '../types'

describe('formatWeaponDisplay', () => {
  const mockWeaponOptions: WeaponOption[] = [
    {
      name: 'Laser Cannon',
      targets: 'Hull',
      attacks: 2,
      range: '12"'
    },
    {
      name: 'Plasma Gun',
      targets: 'Shields',
      attacks: 1,
      range: '6"'
    },
    {
      name: 'Basic Weapon',
      targets: 'Hull'
      // Missing attacks and range
    }
  ]

  it('returns "None" for empty or falsy weapon name', () => {
    expect(formatWeaponDisplay('', mockWeaponOptions)).toBe('None')
    expect(formatWeaponDisplay(null as any, mockWeaponOptions)).toBe('None')
    expect(formatWeaponDisplay(undefined as any, mockWeaponOptions)).toBe('None')
  })

  it('returns weapon name when weapon not found in options', () => {
    expect(formatWeaponDisplay('Unknown Weapon', mockWeaponOptions)).toBe('Unknown Weapon')
  })

  it('formats weapon with complete details correctly', () => {
    const result = formatWeaponDisplay('Laser Cannon', mockWeaponOptions)
    expect(result).toBe('Laser Cannon (Hull) 2 dice @ 12"')
  })

  it('handles weapon with missing attacks (defaults to 1)', () => {
    const result = formatWeaponDisplay('Basic Weapon', mockWeaponOptions)
    expect(result).toBe('Basic Weapon (Hull) 1 dice @ 0"')
  })

  it('handles weapon with missing range (defaults to "0")', () => {
    const result = formatWeaponDisplay('Basic Weapon', mockWeaponOptions)
    expect(result).toBe('Basic Weapon (Hull) 1 dice @ 0"')
  })

  it('handles weapon with missing targets (defaults to "Unknown")', () => {
    const weaponWithoutTargets: WeaponOption[] = [{
      name: 'No Target Weapon',
      attacks: 3,
      range: '10"'
    }]
    const result = formatWeaponDisplay('No Target Weapon', weaponWithoutTargets)
    expect(result).toBe('No Target Weapon (Unknown) 3 dice @ 10"')
  })

  it('handles weapon with all missing optional fields', () => {
    const weaponMinimal: WeaponOption[] = [{
      name: 'Minimal Weapon'
    }]
    const result = formatWeaponDisplay('Minimal Weapon', weaponMinimal)
    expect(result).toBe('Minimal Weapon (Unknown) 1 dice @ 0"')
  })
})

describe('isShipWeaponSelectionComplete', () => {
  const mockShipDataWithProw: ShipData = {
    size: 'Medium',
    points: 6,
    statline: { Hull: 6, Speed: 8 },
    prow: {
      select: 2,
      options: []
    }
  }

  const mockShipDataWithHull: ShipData = {
    size: 'Medium',
    points: 6,
    statline: { Hull: 6, Speed: 8 },
    hull: {
      select: 3,
      options: []
    }
  }

  const mockShipDataWithBoth: ShipData = {
    size: 'Medium',
    points: 6,
    statline: { Hull: 6, Speed: 8 },
    prow: {
      select: 1,
      options: []
    },
    hull: {
      select: 2,
      options: []
    }
  }

  const mockShipDataSquadron: ShipData = {
    size: 'Medium',
    points: 6,
    statline: { Hull: 6, Speed: 8 },
    hull: {
      select: 2,
      options: []
    },
    squadron: true
  }

  it('returns true for ship with no weapon requirements', () => {
    const shipData: ShipData = {
      size: 'Medium',
      points: 6,
      statline: { Hull: 6, Speed: 8 }
    }
    const armyShip: ArmyShip = {
      name: 'Test Ship',
      count: 1,
      points: 6,
      prowWeapon: '',
      hullWeapons: []
    }

    expect(isShipWeaponSelectionComplete(armyShip, shipData)).toBe(true)
  })

  describe('prow weapon selection', () => {
    it('returns false when prow weapon count is less than required', () => {
      const armyShip: ArmyShip = {
        name: 'Test Ship',
        count: 1,
        points: 6,
        prowWeapon: '', // 0 selections, but 2 required
        hullWeapons: []
      }

      expect(isShipWeaponSelectionComplete(armyShip, mockShipDataWithProw)).toBe(false)
    })

    it('returns false when single prow weapon is empty string', () => {
      const shipData: ShipData = {
        ...mockShipDataWithProw,
        prow: { select: 1, options: [] }
      }
      const armyShip: ArmyShip = {
        name: 'Test Ship',
        count: 1,
        points: 6,
        prowWeapon: '', // empty string
        hullWeapons: []
      }

      expect(isShipWeaponSelectionComplete(armyShip, shipData)).toBe(false)
    })

    it('returns false when single prow weapon is null', () => {
      const shipData: ShipData = {
        ...mockShipDataWithProw,
        prow: { select: 1, options: [] }
      }
      const armyShip: ArmyShip = {
        name: 'Test Ship',
        count: 1,
        points: 6,
        prowWeapon: null as any, // null value
        hullWeapons: []
      }

      expect(isShipWeaponSelectionComplete(armyShip, shipData)).toBe(false)
    })

    it('returns true when single prow weapon is selected', () => {
      const shipData: ShipData = {
        ...mockShipDataWithProw,
        prow: { select: 1, options: [] }
      }
      const armyShip: ArmyShip = {
        name: 'Test Ship',
        count: 1,
        points: 6,
        prowWeapon: 'Laser Cannon',
        hullWeapons: []
      }

      expect(isShipWeaponSelectionComplete(armyShip, shipData)).toBe(true)
    })

    it('returns false when prow weapon array has empty strings', () => {
      const armyShip: ArmyShip = {
        name: 'Test Ship',
        count: 1,
        points: 6,
        prowWeapon: ['Laser Cannon', ''], // one empty
        hullWeapons: []
      }

      expect(isShipWeaponSelectionComplete(armyShip, mockShipDataWithProw)).toBe(false)
    })

    it('returns false when prow weapon array has null values', () => {
      const armyShip: ArmyShip = {
        name: 'Test Ship',
        count: 1,
        points: 6,
        prowWeapon: ['Laser Cannon', null as any], // one null
        hullWeapons: []
      }

      expect(isShipWeaponSelectionComplete(armyShip, mockShipDataWithProw)).toBe(false)
    })

    it('returns true when all prow weapons in array are selected', () => {
      const armyShip: ArmyShip = {
        name: 'Test Ship',
        count: 1,
        points: 6,
        prowWeapon: ['Laser Cannon', 'Plasma Gun'],
        hullWeapons: []
      }

      expect(isShipWeaponSelectionComplete(armyShip, mockShipDataWithProw)).toBe(true)
    })
  })

  describe('hull weapon selection', () => {
    it('returns false when hull weapon count is less than required', () => {
      const armyShip: ArmyShip = {
        name: 'Test Ship',
        count: 1,
        points: 6,
        prowWeapon: '',
        hullWeapons: ['Laser Cannon'] // 1 weapon, but 3 required
      }

      expect(isShipWeaponSelectionComplete(armyShip, mockShipDataWithHull)).toBe(false)
    })

    it('returns false when hull weapons array contains empty strings', () => {
      const armyShip: ArmyShip = {
        name: 'Test Ship',
        count: 1,
        points: 6,
        prowWeapon: '',
        hullWeapons: ['Laser Cannon', '', 'Plasma Gun'] // one empty
      }

      expect(isShipWeaponSelectionComplete(armyShip, mockShipDataWithHull)).toBe(false)
    })

    it('returns false when hull weapons array contains null values', () => {
      const armyShip: ArmyShip = {
        name: 'Test Ship',
        count: 1,
        points: 6,
        prowWeapon: '',
        hullWeapons: ['Laser Cannon', null as any, 'Plasma Gun'] // one null
      }

      expect(isShipWeaponSelectionComplete(armyShip, mockShipDataWithHull)).toBe(false)
    })

    it('returns true when all required hull weapons are selected', () => {
      const armyShip: ArmyShip = {
        name: 'Test Ship',
        count: 1,
        points: 6,
        prowWeapon: '',
        hullWeapons: ['Laser Cannon', 'Plasma Gun', 'Basic Weapon']
      }

      expect(isShipWeaponSelectionComplete(armyShip, mockShipDataWithHull)).toBe(true)
    })

    it('handles squadron ships with multiplied hull weapon requirements', () => {
      const armyShip: ArmyShip = {
        name: 'Test Squadron',
        count: 1,
        points: 6,
        prowWeapon: '',
        hullWeapons: ['Weapon1', 'Weapon2', 'Weapon3', 'Weapon4', 'Weapon5', 'Weapon6'], // 6 weapons needed (2 * 3)
        isSquadron: true
      }

      expect(isShipWeaponSelectionComplete(armyShip, mockShipDataSquadron)).toBe(true)
    })

    it('returns false for squadron ships with insufficient hull weapons', () => {
      const armyShip: ArmyShip = {
        name: 'Test Squadron',
        count: 1,
        points: 6,
        prowWeapon: '',
        hullWeapons: ['Weapon1', 'Weapon2'], // only 2, but 6 needed (2 * 3)
        isSquadron: true
      }

      expect(isShipWeaponSelectionComplete(armyShip, mockShipDataSquadron)).toBe(false)
    })
  })

  describe('combined prow and hull weapon selection', () => {
    it('returns false when prow weapons incomplete but hull weapons complete', () => {
      const armyShip: ArmyShip = {
        name: 'Test Ship',
        count: 1,
        points: 6,
        prowWeapon: '', // incomplete
        hullWeapons: ['Weapon1', 'Weapon2'] // complete
      }

      expect(isShipWeaponSelectionComplete(armyShip, mockShipDataWithBoth)).toBe(false)
    })

    it('returns false when hull weapons incomplete but prow weapons complete', () => {
      const armyShip: ArmyShip = {
        name: 'Test Ship',
        count: 1,
        points: 6,
        prowWeapon: 'Laser Cannon', // complete
        hullWeapons: ['Weapon1'] // incomplete (needs 2)
      }

      expect(isShipWeaponSelectionComplete(armyShip, mockShipDataWithBoth)).toBe(false)
    })

    it('returns true when both prow and hull weapons are complete', () => {
      const armyShip: ArmyShip = {
        name: 'Test Ship',
        count: 1,
        points: 6,
        prowWeapon: 'Laser Cannon', // complete
        hullWeapons: ['Weapon1', 'Weapon2'] // complete
      }

      expect(isShipWeaponSelectionComplete(armyShip, mockShipDataWithBoth)).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles undefined prowWeapon as incomplete', () => {
      const shipData: ShipData = {
        ...mockShipDataWithProw,
        prow: { select: 1, options: [] }
      }
      const armyShip: ArmyShip = {
        name: 'Test Ship',
        count: 1,
        points: 6,
        prowWeapon: undefined as any,
        hullWeapons: []
      }

      expect(isShipWeaponSelectionComplete(armyShip, shipData)).toBe(false)
    })

    it('handles empty hullWeapons array', () => {
      const armyShip: ArmyShip = {
        name: 'Test Ship',
        count: 1,
        points: 6,
        prowWeapon: '',
        hullWeapons: [] // empty array instead of undefined
      }

      expect(isShipWeaponSelectionComplete(armyShip, mockShipDataWithHull)).toBe(false)
    })
  })
})