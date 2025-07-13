'use client'

import React, { useState, useEffect } from 'react'
import { CardCreatorConfig, Card } from '../types'
import { useDevelopmentCards } from '@/hooks/useDevelopmentCards'
import { useBlueprintCards } from '@/hooks/useBlueprintCards'
import { useIntelligenceCards } from '@/hooks/useIntelligenceCards'

interface CardDisplayProps {
  config: CardCreatorConfig
  strategy?: any
  selectedSections: string[]
  selectedCards: string[]
  onCardSelectionChange: (cardIds: string[]) => void
}

export default function CardDisplay({
  config,
  strategy,
  selectedSections,
  selectedCards,
  onCardSelectionChange
}: CardDisplayProps) {
  const [loading, setLoading] = useState(true)
  const [availableCards, setAvailableCards] = useState<Card[]>([])
  
  const { cards: developmentCards, getCardsBySection } = useDevelopmentCards(strategy?.id)
  const { cards: blueprintCards } = useBlueprintCards(strategy?.id)
  const { cards: intelligenceCards } = useIntelligenceCards()

  // Enhanced debugging to understand data structure
  useEffect(() => {
    console.log('🎯 CARD CREATOR DETAILED DEBUG:')
    console.log('Strategy ID:', strategy?.id)
    console.log('Selected Sections:', selectedSections)
    console.log('Available config sections:', config.sections.map(s => ({ id: s.id, label: s.label, category: s.category })))
    
    // Development Bank Debug
    console.log('📊 Development cards:', developmentCards?.length || 0)
    if (developmentCards?.length > 0) {
      console.log('Development card sample:', developmentCards.slice(0, 2).map(c => ({
        id: c.id,
        title: c.title,
        card_type: c.card_type
      })))
    }
    
    // Strategy Bank Debug  
    console.log('🔵 Blueprint cards:', blueprintCards?.length || 0)
    if (blueprintCards?.length > 0) {
      console.log('Blueprint card types:', [...new Set(blueprintCards.map(c => c.card_type))])
      console.log('Blueprint card sample:', blueprintCards.slice(0, 2).map(c => ({
        id: c.id,
        title: c.title,
        card_type: c.card_type
      })))
    } else {
      console.log('❌ No blueprint cards found')
    }
    
    // Intelligence Bank Debug
    console.log('🟢 Intelligence cards:', intelligenceCards?.length || 0)
    if (intelligenceCards?.length > 0) {
      console.log('Intelligence card categories:', [...new Set(intelligenceCards.map(c => c.category || c.card_type))])
      console.log('Intelligence card sample:', intelligenceCards.slice(0, 2).map(c => ({
        id: c.id,
        title: c.title,
        category: c.category,
        card_type: c.card_type
      })))
    } else {
      console.log('❌ No intelligence cards found')
    }
    
    console.log('🎯 END DEBUG')
  }, [developmentCards, blueprintCards, intelligenceCards, selectedSections, strategy?.id, config.sections])

  // Load cards from selected sections across all banks
  useEffect(() => {
    if (selectedSections.length === 0) {
      setAvailableCards([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      let sectionCards: any[] = []
      
      // Get cards from all selected sections
      for (const sectionId of selectedSections) {
        const section = config.sections.find(s => s.id === sectionId)
        
        if (section?.category === 'development') {
          // Load Development Bank cards
          if (getCardsBySection) {
            // Map new section IDs to Development Bank section IDs
            const sectionMapping: Record<string, string> = {
              'epic': 'section1',
              'feature': 'section1',
              'user-journey': 'section1',
              'tech-stack': 'section2',
              'technical-requirements': 'section3',
              'task-lists': 'section4'
            }
            const mappedSectionId = sectionMapping[sectionId] || sectionId
            const cardsInSection = getCardsBySection(mappedSectionId)
            sectionCards = [...sectionCards, ...cardsInSection]
          }
        } else if (section?.category === 'strategy') {
          // Load Strategy Bank cards by card type (exact match)
          if (blueprintCards && section.cardTypes.length > 0) {
            const strategyCardsInSection = blueprintCards.filter(card => 
              section.cardTypes.includes(card.card_type)
            )
            sectionCards = [...sectionCards, ...strategyCardsInSection]
          }
        } else if (section?.category === 'intelligence') {
          // Load Intelligence Bank cards by category (exact match)
          if (intelligenceCards && section.cardTypes.length > 0) {
            const intelligenceCardsInSection = intelligenceCards.filter(card => {
              const cardCategory = card.category || card.card_type || ''
              return section.cardTypes.includes(cardCategory)
            })
            sectionCards = [...sectionCards, ...intelligenceCardsInSection]
          }
        }
      }
      
      // Convert to Card interface format
      const formattedCards: Card[] = sectionCards.map(card => ({
        id: card.id,
        title: card.title,
        description: card.description || '',
        card_type: card.card_type,
        priority: card.priority || 'Medium',
        card_data: card.card_data || {},
        created_at: card.created_at,
        updated_at: card.updated_at
      }))
      
      setAvailableCards(formattedCards)
    } catch (error) {
      console.error('Error loading cards:', error)
      setAvailableCards([])
    } finally {
      setLoading(false)
    }
  }, [selectedSections, developmentCards, blueprintCards, intelligenceCards, getCardsBySection, config.sections])

  const handleCardToggle = (cardId: string) => {
    if (selectedCards.includes(cardId)) {
      onCardSelectionChange(selectedCards.filter(id => id !== cardId))
    } else {
      onCardSelectionChange([...selectedCards, cardId])
    }
  }

  const handleSelectAll = () => {
    if (selectedCards.length === availableCards.length) {
      onCardSelectionChange([])
    } else {
      onCardSelectionChange(availableCards.map(card => card.id))
    }
  }

  const getCardTypeLabel = (cardType: string) => {
    const typeMap: Record<string, string> = {
      'feature': 'Feature',
      'tech-stack': 'Tech Stack',
      'technical-requirement-structured': 'TRD',
      'technical-requirement': 'Tech Req',
      'task-list': 'Task List'
    }
    return typeMap[cardType] || cardType
  }

  const getSectionLabel = (sectionId: string) => {
    return config.sections.find(s => s.id === sectionId)?.label || sectionId
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        Select Context Cards
      </h3>
      
      {selectedSections.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-600 text-sm">
            Please select sections in step 1 to load available cards
          </p>
        </div>
      ) : loading ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-600 text-sm">
            Loading cards from selected sections...
          </p>
        </div>
      ) : availableCards.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            📋 No cards found in selected sections
          </p>
          <p className="text-yellow-600 text-xs mt-1">
            Selected sections: {selectedSections.map(getSectionLabel).join(', ')}
          </p>
          <p className="text-yellow-600 text-xs mt-1">
            Add some cards to these sections first, then return to Card Creator
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Found {availableCards.length} cards from {selectedSections.length} section{selectedSections.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {selectedCards.length === availableCards.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {availableCards.map((card) => (
              <label 
                key={card.id}
                className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedCards.includes(card.id)}
                  onChange={() => handleCardToggle(card.id)}
                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {card.title}
                    </h4>
                    <div className="ml-2 flex items-center space-x-1">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {getCardTypeLabel(card.card_type)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        card.priority === 'High' ? 'bg-red-100 text-red-600' :
                        card.priority === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {card.priority}
                      </span>
                    </div>
                  </div>
                  {card.description && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {card.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Created {new Date(card.created_at).toLocaleDateString()}
                  </p>
                </div>
              </label>
            ))}
          </div>
          
          {selectedCards.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">
                ✅ Selected {selectedCards.length} card{selectedCards.length !== 1 ? 's' : ''} as context
              </p>
              <p className="text-xs text-green-600 mt-1">
                These cards will provide context for AI generation in the next step
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}