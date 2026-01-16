import React, { useEffect, useRef } from 'react'
import ShipsGrid from './ShipsGrid'
import './ShipsModal.css'
import type { ShipData, FactionData } from '../types'

interface ShipsModalProps {
  isOpen: boolean
  onClose: () => void
  factionData: FactionData
  selectedFaction: string
  onAddToArmy: (shipName: string, shipData: ShipData) => void
}

const ShipsModal: React.FC<ShipsModalProps> = React.memo(({
  isOpen,
  onClose,
  factionData,
  selectedFaction,
  onAddToArmy
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

  if (!isOpen) return null

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ships-modal-title"
    >
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
      >
        <div className="modal-header">
          <h2 id="ships-modal-title">Available Ships - {selectedFaction}</h2>
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
          <ShipsGrid
            factionData={factionData}
            selectedFaction={selectedFaction}
            onAddToArmy={onAddToArmy}
          />
        </div>
      </div>
    </div>
  )
})

ShipsModal.displayName = 'ShipsModal'

export default ShipsModal