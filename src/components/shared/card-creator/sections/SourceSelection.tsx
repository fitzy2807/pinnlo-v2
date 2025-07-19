'use client'

import React from 'react'
import { CardCreatorConfig } from '../types'
import { useDevelopmentCards } from '@/hooks/useDevelopmentCards'
import { useBlueprintCards } from '@/hooks/useBlueprintCards'
import { useIntelligenceCards } from '@/hooks/useIntelligenceCards'

// Card count component with count calculation
function CardCount({ 
  sectionId, 
  strategy, 
  category,
  cardTypes 
}: { 
  sectionId: string, 
  strategy?: any, 
  category?: string,
  cardTypes: string[]
}) {
  const { getSectionCounts } = useDevelopmentCards(strategy?.id)
  const { cards: blueprintCards } = useBlueprintCards(strategy?.id)
  const { cards: intelligenceCards } = useIntelligenceCards()
  
  let count = 0
  
  console.log(`🔢 Counting cards for ${sectionId} (${category}):`, cardTypes)
  
  if (category === 'development') {
    const sectionMapping: Record<string, string> = {
      'prd': 'section1',
      'epic': 'section1',
      'feature': 'section1',
      'user-journey': 'section1',
      'tech-stack': 'section2',
      'trd': 'section3',
      'technical-requirements': 'section3',
      'task-lists': 'section4'
    }
    const mappedSectionId = sectionMapping[sectionId] || sectionId
    count = getSectionCounts ? getSectionCounts()[mappedSectionId] || 0 : 0
    console.log(`📊 Development count for ${sectionId} (${mappedSectionId}):`, count)
  } else if (category === 'strategy' && blueprintCards) {
    const cards = blueprintCards.filter(card => {
      const cardType = card.card_type || ''
      return cardTypes.includes(cardType)
    })
    count = cards.length
    console.log(`🔵 Strategy count for ${sectionId}:`, count, 'matching cards:', cards.map(c => c.card_type))
  } else if (category === 'intelligence' && intelligenceCards) {
    const cards = intelligenceCards.filter(card => {
      const cardCategory = card.category || card.card_type || ''
      return cardTypes.includes(cardCategory)
    })
    count = cards.length
    console.log(`🟢 Intelligence count for ${sectionId}:`, count, 'matching cards:', cards.map(c => c.category || c.card_type))
  }
  
  return (
    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">
      {count} cards
    </span>
  )
}

// Helper function to get card count for a section
function getSectionCardCount(
  sectionId: string,
  category: string,
  cardTypes: string[],
  strategy: any,
  getSectionCounts: any,
  blueprintCards: any[],
  intelligenceCards: any[]
): number {
  let count = 0
  
  if (category === 'development') {
    const sectionMapping: Record<string, string> = {
      'prd': 'section1',
      'epic': 'section1',
      'feature': 'section1',
      'user-journey': 'section1',
      'tech-stack': 'section2',
      'trd': 'section3',
      'technical-requirements': 'section3',
      'task-lists': 'section4'
    }
    const mappedSectionId = sectionMapping[sectionId] || sectionId
    count = getSectionCounts ? getSectionCounts()[mappedSectionId] || 0 : 0
  } else if (category === 'strategy' && blueprintCards) {
    const cards = blueprintCards.filter(card => {
      const cardType = card.card_type || ''
      return cardTypes.includes(cardType)
    })
    count = cards.length
  } else if (category === 'intelligence' && intelligenceCards) {
    const cards = intelligenceCards.filter(card => {
      const cardCategory = card.category || card.card_type || ''
      return cardTypes.includes(cardCategory)
    })
    count = cards.length
  }
  
  return count
}

interface SourceSelectionProps {
  config: CardCreatorConfig
  strategy?: any
  selectedSections: string[]
  onSectionChange: (sections: string[]) => void
}

export default function SourceSelection({
  config,
  strategy,
  selectedSections,
  onSectionChange
}: SourceSelectionProps) {
  const { getSectionCounts } = useDevelopmentCards(strategy?.id)
  const { cards: blueprintCards } = useBlueprintCards(strategy?.id)
  const { cards: intelligenceCards } = useIntelligenceCards()

  const handleSectionToggle = (sectionId: string) => {
    if (selectedSections.includes(sectionId)) {
      onSectionChange(selectedSections.filter(id => id !== sectionId))
    } else {
      onSectionChange([...selectedSections, sectionId])
    }
  }

  // Group sections by category and filter out sections with 0 cards
  // Add null safety check for config.sections
  if (!config || !config.sections || !Array.isArray(config.sections)) {
    console.error('Config or config.sections is undefined/invalid:', config)
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-800 font-medium">Configuration Error</h3>
        <p className="text-red-600 text-sm mt-1">
          Card creator configuration is missing or invalid. Please refresh and try again.
        </p>
      </div>
    )
  }

  const strategySections = config.sections
    .filter(s => s.category === 'strategy')
    .filter(section => {
      const count = getSectionCardCount(
        section.id,
        section.category,
        section.cardTypes,
        strategy,
        getSectionCounts,
        blueprintCards || [],
        intelligenceCards || []
      )
      return count > 0
    })
  
  const intelligenceSections = config.sections
    .filter(s => s.category === 'intelligence')
    .filter(section => {
      const count = getSectionCardCount(
        section.id,
        section.category,
        section.cardTypes,
        strategy,
        getSectionCounts,
        blueprintCards || [],
        intelligenceCards || []
      )
      return count > 0
    })
  
  const developmentSections = config.sections
    .filter(s => s.category === 'development')
    .filter(section => {
      const count = getSectionCardCount(
        section.id,
        section.category,
        section.cardTypes,
        strategy,
        getSectionCounts,
        blueprintCards || [],
        intelligenceCards || []
      )
      return count > 0
    })

  const SectionCard = ({ section }: { section: any }) => {
    const isSelected = selectedSections.includes(section.id)
    
    // Section emojis mapping
    const sectionEmojis: Record<string, string> = {
      // Development
      'section1': '📋',
      'section2': '🛠️',
      'section3': '⚙️',
      'section4': '✅',
      // Strategy
      'strategic-context': '🎯',
      'vision': '🔮',
      'value-proposition': '💎',
      'personas': '👥',
      'customer-journey': '🗺️',
      'swot-analysis': '📊',
      'competitive-analysis': '🔍',
      'okrs': '🎯',
      'business-model': '💼',
      'go-to-market': '🚀',
      'risk-assessment': '⚠️',
      'roadmap': '🛣️',
      'kpis': '📈',
      'financial-projections': '💰',
      'workstream': '🔄',
      // Intelligence
      'market': '📈',
      'competitor': '👁️',
      'trends': '📊',
      'technology': '💻',
      'stakeholder': '👑',
      'consumer': '🎯',
      'risk': '⚠️',
      'opportunities': '💡'
    }
    
    return (
      <label 
        key={section.id} 
        className={`
          relative w-[calc(20%-8px)] min-w-[140px] max-w-[180px] h-[80px] rounded-lg cursor-pointer transition-all 
          flex flex-col items-center justify-center gap-1 shadow-md hover:shadow-lg
          ${isSelected 
            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
            : 'bg-black hover:bg-gray-900 text-white'
          }
        `}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => handleSectionToggle(section.id)}
          className="sr-only"
        />
        
        <span className="text-2xl">
          {sectionEmojis[section.id] || '📄'}
        </span>
        <span className="text-xs font-medium text-center px-2">
          {section.label}
        </span>
      </label>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        Select Source
      </h3>
      
      <div className="space-y-8">
        {/* Strategy Bank Section */}
        {strategySections.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Strategy Bank - Blueprint Cards
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {strategySections.map((section) => (
                <SectionCard key={section.id} section={section} />
              ))}
            </div>
          </div>
        )}

        {/* Intelligence Bank Section */}
        {intelligenceSections.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Intelligence Bank - Research & Analysis
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {intelligenceSections.map((section) => (
                <SectionCard key={section.id} section={section} />
              ))}
            </div>
          </div>
        )}

        {/* Development Bank Section */}
        {developmentSections.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Development Bank - Product & Technical
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {developmentSections.map((section) => (
                <SectionCard key={section.id} section={section} />
              ))}
            </div>
          </div>
        )}
      </div>
      
      {selectedSections.length > 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800 font-medium">
            ✅ Selected {selectedSections.length} content source{selectedSections.length !== 1 ? 's' : ''}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Cards from these sources will be available as context in the next step
          </p>
          
          {/* Show selected sections by category */}
          <div className="mt-2 flex flex-wrap gap-1">
            {selectedSections.map(sectionId => {
              const section = config.sections.find(s => s.id === sectionId)
              return section ? (
                <span 
                  key={sectionId}
                  className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    section.category === 'strategy' ? 'bg-blue-100 text-blue-800' :
                    section.category === 'intelligence' ? 'bg-green-100 text-green-800' :
                    'bg-orange-100 text-orange-800'
                  }`}
                >
                  {section.label}
                </span>
              ) : null
            })}
          </div>
        </div>
      )}
    </div>
  )
}
