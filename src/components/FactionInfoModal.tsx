import React, { useEffect, useRef } from 'react'
import './FactionInfoModal.css'
import type { FactionData } from '../types'

interface FactionInfoModalProps {
  isOpen: boolean
  onClose: () => void
  factionData: FactionData
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
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    
    // Focus trap: focus the close button when modal opens
    if (closeButtonRef.current) {
      closeButtonRef.current.focus()
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  // Focus trap: prevent tabbing outside modal
  useEffect(() => {
    if (!isOpen || !modalRef.current) return

    const modal = modalRef.current
    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    modal.addEventListener('keydown', handleTab)
    return () => {
      modal.removeEventListener('keydown', handleTab)
    }
  }, [isOpen])

  if (!isOpen || !factionData[selectedFaction]) return null

  const faction = factionData[selectedFaction]

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="faction-info-modal-title"
    >
      <div 
        className="modal-content faction-modal" 
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
      >
        <div className="modal-header">
          <h2 id="faction-info-modal-title">
            {selectedFaction} - {activeTab === 'abilities' ? 'Void Admiral Abilities' : 'Fluff & Special Rules'}
          </h2>
          <button 
            ref={closeButtonRef}
            className="modal-close" 
            onClick={onClose} 
            title="Close modal" 
            aria-label="Close modal"
          >
            <i className="fas fa-times" aria-hidden="true"></i>
          </button>
        </div>
        <div className="modal-body">
          {activeTab === 'abilities' && faction.commandAbilities && (
            <div className="abilities-section">
              <h3>Void Admiral Abilities</h3>
              <div className="abilities-grid">
                {faction.commandAbilities.map((ability, index: number) => (
                  <div key={`ability-${ability.name}-${ability.dice}-${index}`} className="ability-card">
                    <div className="ability-header">
                      <span className="ability-dice" aria-label={`Dice value: ${ability.dice}`}>🎲{ability.dice}</span>
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
                    {faction.specialRules.map((rule, index: number) => (
                      <div key={`rule-${rule.name}-${index}`} className="rule-item">
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