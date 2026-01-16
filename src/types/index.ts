// Weapon and Ship Types
export interface WeaponOption {
  name: string
  targets?: string
  attacks?: number
  range?: string
}

export interface Statline {
  Hull: number
  Speed: number
  Armour?: number
  Shields?: number
  Flak?: number
}

export interface ShipData {
  size: string
  points: number
  statline: Statline
  prow?: {
    select: number
    options: WeaponOption[]
  }
  hull?: {
    select: number
    options: WeaponOption[]
  }
  squadron?: boolean
}

// Army Types
export interface ArmyShip {
  name: string
  count: number
  points: number
  prowWeapon: string | string[]
  hullWeapons: string[]
  isSquadron?: boolean
}

// Faction Types
export interface SpecialRule {
  name: string
  description: string
}

export interface CommandAbility {
  dice: number
  name: string
  description: string
}

export interface Faction {
  fluff?: string
  specialRules?: SpecialRule[]
  commandAbilities?: CommandAbility[]
  ships: Record<string, ShipData>
}

export interface FactionData {
  [factionName: string]: Faction
}
