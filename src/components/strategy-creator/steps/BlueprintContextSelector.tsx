'use client'

import React, { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, Check, Search, X } from 'lucide-react'
import { useBlueprintCards } from '@/hooks/useBlueprintCards'
import { blueprintRegistry } from '@/components/blueprints/registry'

interface BlueprintContextSelectorProps {
  strategyId: string
  selectedCards: any[]
  onUpdate: (cards: any[]) => void
  onContinue: () => void
}

interface BlueprintGroup {
  id: string
  name: string
  cards: any[]
  expanded: boolean
}

export default function BlueprintContextSelector({
  strategyId,
  selectedCards,
  onUpdate,
  onContinue
}: BlueprintContextSelectorProps) {
  const { cards, loading, error } = useBlueprintCards(strategyId)
  const [searchTerm, setSearchTerm] = useState('')
  const [blueprintGroups, setBlueprintGroups] = useState<BlueprintGroup[]>([])
  const [selectedCardIds, setSelectedCardIds] = useState<Set<string>>(
    new Set(selectedCards.map(c => c.id))
  )

  useEffect(() => {
    // Group cards by blueprint type
    const groups: Record<string, any[]> = {}
    cards.forEach(card => {
      if (!groups[card.card_type]) {
        groups[card.card_type] = []
      }
      groups[card.card_type].push(card)
    })

    // Convert to array with blueprint info
    const groupArray = Object.entries(groups).map(([type, cards]) => ({
      id: type,
      name: blueprintRegistry[type]?.name || type,
      cards: cards,
      expanded: true
    }))

    setBlueprintGroups(groupArray)
  }, [cards])

  const toggleBlueprint = (blueprintId: string) => {
    setBlueprintGroups(prev => prev.map(group =>
      group.id === blueprintId
        ? { ...group, expanded: !group.expanded }
        : group
    ))
  }

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

  const toggleAllInBlueprint = (blueprintId: string) => {
    const group = blueprintGroups.find(g => g.id === blueprintId)
    if (!group) return

    const allSelected = group.cards.every(card => selectedCardIds.has(card.id))
    const newSelected = new Set(selectedCardIds)

    if (allSelected) {
      group.cards.forEach(card => newSelected.delete(card.id))
    } else {
      group.cards.forEach(card => newSelected.add(card.id))
    }

    setSelectedCardIds(newSelected)
    const selectedCardObjects = cards.filter(c => newSelected.has(c.id))
    onUpdate(selectedCardObjects)
  }

  const filteredGroups = blueprintGroups.map(group => ({
    ...group,
    cards: group.cards.filter(card =>
      card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(group => group.cards.length > 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Error loading cards: {error}</p>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Left Panel - Card Selection */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Select Blueprint Cards as Context
          </h3>
          <p className="text-sm text-gray-600">
            Choose existing cards that will provide context for AI generation
          </p>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search cards..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Blueprint Groups */}
        <div className="space-y-4">
          {filteredGroups.map(group => {
            const allSelected = group.cards.every(card => selectedCardIds.has(card.id))
            const someSelected = group.cards.some(card => selectedCardIds.has(card.id))

            return (
              <div key={group.id} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleBlueprint(group.id)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    {group.expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <span className="font-medium">{group.name}</span>
                    <span className="text-sm text-gray-500">({group.cards.length})</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleAllInBlueprint(group.id)
                    }}
                    className={`text-sm px-3 py-1 rounded ${
                      allSelected 
                        ? 'bg-indigo-100 text-indigo-700' 
                        : someSelected
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {allSelected ? 'Deselect All' : 'Select All'}
                  </button>
                </button>

                {group.expanded && (
                  <div className="px-4 pb-3 space-y-2">
                    {group.cards.map(card => (
                      <label
                        key={card.id}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCardIds.has(card.id)}
                          onChange={() => toggleCard(card)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{card.title}</div>
                          <div className="text-xs text-gray-500 mt-1">{card.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Right Panel - Selected Cards Summary */}
      <div className="w-80 border-l border-gray-200 p-6 bg-gray-50">
        <h4 className="font-medium text-gray-900 mb-4">
          Selected Cards ({selectedCardIds.size})
        </h4>

        {selectedCardIds.size === 0 ? (
          <p className="text-sm text-gray-500">No cards selected yet</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {cards
              .filter(card => selectedCardIds.has(card.id))
              .map(card => (
                <div key={card.id} className="p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{card.title}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {blueprintRegistry[card.card_type]?.name || card.card_type}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleCard(card)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))
            }
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