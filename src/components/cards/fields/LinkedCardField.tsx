'use client'

import { useState, useEffect } from 'react'
import { Search, ExternalLink } from 'lucide-react'

interface LinkedCardFieldProps {
  value: string | string[]
  onChange: (value: string | string[]) => void
  label: string
  description?: string
  targetBlueprintType: string
  multiple?: boolean
  maxItems?: number
  required?: boolean
  availableCards?: Array<{ id: string; title: string; cardType: string }>
  currentCardId?: string
}

// Mock cards for different blueprint types - in real app this comes from database
const MOCK_CARDS_BY_TYPE: Record<string, Array<{ id: string; title: string; cardType: string }>> = {
  'persona': [
    { id: 'per-1', title: 'Tech Professional Persona', cardType: 'persona' },
    { id: 'per-2', title: 'Business Decision Maker', cardType: 'persona' },
    { id: 'per-3', title: 'End User - Small Business', cardType: 'persona' }
  ],
  'okr': [
    { id: 'okr-1', title: 'Revenue Growth Q1 2024', cardType: 'okr' },
    { id: 'okr-2', title: 'User Acquisition Goals', cardType: 'okr' },
    { id: 'okr-3', title: 'Product Quality Metrics', cardType: 'okr' }
  ],
  'epic': [
    { id: 'epc-1', title: 'User Authentication System', cardType: 'epic' },
    { id: 'epc-2', title: 'Dashboard Redesign', cardType: 'epic' },
    { id: 'epc-3', title: 'Mobile App Development', cardType: 'epic' }
  ],
  'workstream': [
    { id: 'wks-1', title: 'Q1 Product Development', cardType: 'workstream' },
    { id: 'wks-2', title: 'Marketing Campaign Launch', cardType: 'workstream' }
  ]
}

export default function LinkedCardField({
  value,
  onChange,
  label,
  description,
  targetBlueprintType,
  multiple = false,
  maxItems,
  required = false,
  availableCards,
  currentCardId
}: LinkedCardFieldProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  // Get available cards for the target blueprint type
  const cards = availableCards || MOCK_CARDS_BY_TYPE[targetBlueprintType] || []
  
  // Filter out current card and search
  const filteredCards = cards.filter(card => 
    card.id !== currentCardId &&
    (searchQuery === '' || 
     card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     card.cardType.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Handle selection
  const handleSelect = (cardId: string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : []
      if (currentValues.includes(cardId)) {
        // Remove if already selected
        onChange(currentValues.filter(id => id !== cardId))
      } else if (!maxItems || currentValues.length < maxItems) {
        // Add if not at max
        onChange([...currentValues, cardId])
      }
    } else {
      onChange(cardId)
      setIsOpen(false)
    }
  }

  // Get selected card titles for display
  const getSelectedCards = () => {
    const selectedIds = multiple ? (Array.isArray(value) ? value : []) : (value ? [value] : [])
    return selectedIds.map(id => cards.find(card => card.id === id)).filter(Boolean)
  }

  const selectedCards = getSelectedCards()

  return (
    <div className="space-y-3">
      <div>
        <label className="form-label">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>

      {/* Selected Cards Display */}
      {selectedCards.length > 0 && (
        <div className="space-y-2">
          {selectedCards.map((card) => card && (
            <div key={card.id} className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center space-x-2">
                <ExternalLink size={14} className="text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-900">{card.title}</p>
                  <p className="text-xs text-blue-600 capitalize">{card.cardType.replace('-', ' ')}</p>
                </div>
              </div>
              <button
                onClick={() => handleSelect(card.id)}
                className="text-blue-600 hover:text-blue-800 text-xs"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search and Select */}
      {(!multiple || !maxItems || selectedCards.length < maxItems) && (
        <div className="relative">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsOpen(true)}
              placeholder={`Search ${targetBlueprintType.replace('-', ' ')} cards...`}
              className="input input-sm pl-9 text-black"
            />
          </div>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
              {filteredCards.length > 0 ? (
                <>
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-100">
                    Available {targetBlueprintType.replace('-', ' ')} cards
                  </div>
                  {filteredCards.map((card) => {
                    const isSelected = multiple 
                      ? (Array.isArray(value) ? value.includes(card.id) : false)
                      : value === card.id
                    
                    return (
                      <button
                        key={card.id}
                        onClick={() => handleSelect(card.id)}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-blue-50 transition-colors ${
                          isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{card.title}</p>
                            <p className="text-gray-500 capitalize">{card.cardType.replace('-', ' ')}</p>
                          </div>
                          {isSelected && <span className="text-blue-600">✓</span>}
                        </div>
                      </button>
                    )
                  })}
                </>
              ) : (
                <div className="px-3 py-2 text-xs text-gray-500 text-center">
                  No {targetBlueprintType.replace('-', ' ')} cards found
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Help Text */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>
          {multiple ? 'Select multiple cards' : 'Select a card to link'}
        </span>
        {multiple && maxItems && (
          <span>{selectedCards.length}/{maxItems} selected</span>
        )}
      </div>
    </div>
  )
}
