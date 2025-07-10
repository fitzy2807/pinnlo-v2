'use client'

import React, { useState, useEffect } from 'react'
import { Brain, TrendingUp, Users, Cpu, Target, AlertTriangle, Lightbulb, DollarSign, Filter } from 'lucide-react'
import { useIntelligenceCards } from '@/hooks/useIntelligenceCards'
import { IntelligenceCardCategory } from '@/types/intelligence-cards'

interface IntelligenceContextSelectorProps {
  blueprintCards: any[]
  selectedCards: any[]
  onUpdate: (cards: any[]) => void
  onContinue: () => void
}

const categoryIcons = {
  market: TrendingUp,
  competitor: Users,
  technology: Cpu,
  consumer: Target,
  regulatory: AlertTriangle,
  trends: Lightbulb,
  financial: DollarSign,
  operational: Brain
}

const suggestedCategories: Record<string, IntelligenceCardCategory[]> = {
  'strategic-context': ['market', 'competitor', 'trends'],
  'vision': ['trends', 'technology', 'market'],
  'value-proposition': ['consumer', 'competitor', 'market'],
  'personas': ['consumer', 'trends', 'technology'],
  'business-model': ['financial', 'market', 'operational'],
  'go-to-market': ['market', 'competitor', 'consumer'],
  'competitive-analysis': ['competitor', 'market', 'technology'],
  'risk-assessment': ['regulatory', 'financial', 'operational']
}

export default function IntelligenceContextSelector({
  blueprintCards,
  selectedCards,
  onUpdate,
  onContinue
}: IntelligenceContextSelectorProps) {
  const { cards, loading } = useIntelligenceCards()
  const [selectedCategory, setSelectedCategory] = useState<IntelligenceCardCategory | 'all'>('all')
  const [selectedCardIds, setSelectedCardIds] = useState<Set<string>>(
    new Set(selectedCards.map(c => c.id))
  )
  const [relevanceFilter, setRelevanceFilter] = useState<'all' | 'high' | 'medium'>('high')

  // Determine suggested categories based on selected blueprint cards
  const getSuggestedCategories = () => {
    const categories = new Set<IntelligenceCardCategory>()
    blueprintCards.forEach(card => {
      const suggestions = suggestedCategories[card.card_type] || []
      suggestions.forEach(cat => categories.add(cat))
    })
    return Array.from(categories)
  }

  const suggested = getSuggestedCategories()

  // Filter cards based on category and relevance
  const filteredCards = cards.filter(card => {
    if (selectedCategory !== 'all' && card.category !== selectedCategory) return false
    
    if (relevanceFilter !== 'all') {
      const relevance = card.relevance_score || 5
      if (relevanceFilter === 'high' && relevance < 7) return false
      if (relevanceFilter === 'medium' && (relevance < 4 || relevance > 6)) return false
    }
    
    return true
  })

  const toggleCard = (card: any) => {
    const newSelected = new Set(selectedCardIds)
    if (newSelected.has(card.id)) {
      newSelected.delete(card.id)
    } else {
      newSelected.add(card.id)
    }
    setSelectedCardIds(newSelected)
    
    // Update parent with full card objects
    const selectedCardObjects = cards.filter(c => newSelected.has(c.id))
    onUpdate(selectedCardObjects)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Left Sidebar - Categories */}
      <div className="w-64 border-r border-gray-200 p-6 bg-gray-50">
        <h4 className="font-medium text-gray-900 mb-4">Categories</h4>
        
        <button
          onClick={() => setSelectedCategory('all')}
          className={`w-full text-left px-3 py-2 rounded-lg mb-1 ${
            selectedCategory === 'all' 
              ? 'bg-indigo-100 text-indigo-700' 
              : 'hover:bg-gray-100'
          }`}
        >
          All Categories ({cards.length})
        </button>

        <div className="mt-4 space-y-1">
          {Object.entries(categoryIcons).map(([category, Icon]) => {
            const categoryCards = cards.filter(c => c.category === category)
            const isSuggested = suggested.includes(category as IntelligenceCardCategory)
            
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category as IntelligenceCardCategory)}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between ${
                  selectedCategory === category 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon size={16} />
                  <span className="capitalize">{category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{categoryCards.length}</span>
                  {isSuggested && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      Suggested
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Relevance Filter */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Filter size={16} />
            Relevance Filter
          </h4>
          <div className="space-y-2">
            {['all', 'high', 'medium'].map((level) => (
              <label key={level} className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={relevanceFilter === level}
                  onChange={() => setRelevanceFilter(level as any)}
                  className="text-indigo-600"
                />
                <span className="text-sm capitalize">
                  {level === 'all' ? 'All Scores' : `${level} (${level === 'high' ? '7+' : '4-6'})`}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - Cards */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Select Intelligence Cards
          </h3>
          <p className="text-sm text-gray-600">
            Choose intelligence insights that will inform AI card generation
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-2 gap-4">
          {filteredCards.map(card => {
            const Icon = categoryIcons[card.category as keyof typeof categoryIcons] || Brain
            const isSelected = selectedCardIds.has(card.id)

            return (
              <div
                key={card.id}
                onClick={() => toggleCard(card)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <Icon size={20} className="text-gray-400" />
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="pointer-events-none"
                  />
                </div>

                <h4 className="font-medium text-gray-900 mb-1">{card.title}</h4>
                
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded capitalize">
                    {card.category}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    (card.relevance_score || 5) >= 7 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    Relevance: {card.relevance_score || 5}/10
                  </span>
                </div>

                {card.key_findings && card.key_findings.length > 0 && (
                  <div className="text-xs text-gray-600">
                    <div className="font-medium mb-1">Key Findings:</div>
                    <ul className="space-y-0.5">
                      {card.key_findings.slice(0, 2).map((finding, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span className="text-indigo-600 mt-0.5">•</span>
                          <span>{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {filteredCards.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No intelligence cards found with current filters
          </div>
        )}
      </div>

      {/* Right Panel - Summary */}
      <div className="w-80 border-l border-gray-200 p-6 bg-gray-50">
        <h4 className="font-medium text-gray-900 mb-4">
          Selected Intelligence ({selectedCardIds.size})
        </h4>

        {selectedCardIds.size === 0 ? (
          <p className="text-sm text-gray-500">No intelligence cards selected yet</p>
        ) : (
          <div className="space-y-3">
            {/* Category Summary */}
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <div className="text-xs font-medium text-gray-700 mb-2">By Category</div>
              {Object.entries(
                cards
                  .filter(c => selectedCardIds.has(c.id))
                  .reduce((acc, card) => {
                    acc[card.category] = (acc[card.category] || 0) + 1
                    return acc
                  }, {} as Record<string, number>)
              ).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between text-sm mb-1">
                  <span className="capitalize">{category}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>

            {/* Suggested Categories Note */}
            {suggested.length > 0 && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-xs font-medium text-green-800 mb-1">
                  Suggested categories based on blueprint selection:
                </div>
                <div className="flex flex-wrap gap-1">
                  {suggested.map(cat => (
                    <span key={cat} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full capitalize">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Continue Button */}
        <div className="mt-6">
          <button
            onClick={onContinue}
            disabled={selectedCardIds.size === 0}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue with {selectedCardIds.size} cards
          </button>
        </div>
      </div>
    </div>
  )
}