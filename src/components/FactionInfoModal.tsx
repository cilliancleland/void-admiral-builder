import React from 'react'
import './FactionInfoModal.css'

interface FactionInfoModalProps {
  isOpen: boolean
  onClose: () => void
  factionData: any
  selectedFaction: string
  activeTab: 'abilities' | 'rules'
}

const FactionInfoModal: React.FC<FactionInfoModalProps> = ({
  isOpen,
  onClose,
  factionData,
  selectedFaction,
  activeTab
}) => {
  if (!isOpen || !factionData[selectedFaction]) return null

  const faction = factionData[selectedFaction]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content faction-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{selectedFaction} - {activeTab === 'abilities' ? 'Void Admiral Abilities' : 'Fluff & Special Rules'}</h2>
          <button className="modal-close" onClick={onClose} title="Close modal" aria-label="Close modal">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="modal-body">
          {activeTab === 'abilities' && faction.commandAbilities && (
            <div className="abilities-section">
              <h3>Void Admiral Abilities</h3>
              <div className="abilities-grid">
                {faction.commandAbilities.map((ability: any, index: number) => (
                  <div key={index} className="ability-card">
                    <div className="ability-header">
                      <span className="ability-dice">🎲{ability.dice}</span>
                      <h4>{ability.name}</h4>
                    </div>
                    <p>{ability.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="rules-section">
              {faction.fluff && (
                <div className="fluff-section">
                  <h3>Faction Fluff</h3>
                  <p className="fluff-text">{faction.fluff}</p>
                </div>
              )}

              {faction.specialRules && faction.specialRules.length > 0 && (
                <div className="special-rules-section">
                  <h3>Special Rules</h3>
                  <div className="rules-list">
                    {faction.specialRules.map((rule: any, index: number) => (
                      <div key={index} className="rule-item">
                        <h4>{rule.name}</h4>
                        <p>{rule.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FactionInfoModal