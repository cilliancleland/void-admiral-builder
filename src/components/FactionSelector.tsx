import React from 'react'
import './FactionSelector.css'

interface FactionSelectorProps {
  factions: string[]
  selectedFaction: string
  loading: boolean
  onFactionSelect: (faction: string) => void
}

const FactionSelector: React.FC<FactionSelectorProps> = React.memo(({
  factions,
  selectedFaction,
  loading,
  onFactionSelect
}) => {
  return (
    <div className="card">
      {loading ? (
        <p>Loading factions...</p>
      ) : (
        <select
          value={selectedFaction}
          onChange={(e) => onFactionSelect(e.target.value)}
          className="army-selector"
          aria-label="Select faction"
        >
          <option value="">Choose a faction...</option>
          {factions.map((faction) => (
            <option key={faction} value={faction}>
              {faction}
            </option>
          ))}
        </select>
      )}
    </div>
  )
})

FactionSelector.displayName = 'FactionSelector'

export default FactionSelector