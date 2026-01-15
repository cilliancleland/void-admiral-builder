import React from 'react'
import './FactionSelector.css'

interface FactionSelectorProps {
  factions: string[]
  selectedFaction: string
  loading: boolean
  onFactionChange: (faction: string) => void
}

const FactionSelector: React.FC<FactionSelectorProps> = ({
  factions,
  selectedFaction,
  loading,
  onFactionChange
}) => {
  return (
    <div className="card">
      {loading ? (
        <p>Loading factions...</p>
      ) : (
        <select
          value={selectedFaction}
          onChange={(e) => onFactionChange(e.target.value)}
          className="army-selector"
        >
          <option value="">Choose a faction...</option>
          {factions.map((faction) => (
            <option key={faction} value={faction}>
              {faction}
            </option>
          ))}
        </select>
      )}
      {selectedFaction && (
        <p className="selected-army">
          Selected: <strong>{selectedFaction}</strong>
        </p>
      )}
    </div>
  )
}

export default FactionSelector