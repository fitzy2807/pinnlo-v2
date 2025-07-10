'use client'

import { useState } from 'react'
import { ArrowLeft, Check, X } from 'lucide-react'
import { GeneratedCard } from '@/types/strategy-creator'
import { blueprintRegistry } from '@/components/blueprints/registry'

interface StrategyPreviewProps {
  cards: GeneratedCard[]
  onCreate: (cards: GeneratedCard[]) => void
  onBack: () => void
  loading: boolean
}

export default function StrategyPreview({ cards, onCreate, onBack, loading }: StrategyPreviewProps) {
  const [selectedCards, setSelectedCards] = useState<Set<string>>(
    new Set(cards.map(card => card.id))
  )

  const toggleCard = (cardId: string) => {
    const newSelected = new Set(selectedCards)
    if (newSelected.has(cardId)) {
      newSelected.delete(cardId)
    } else {
      newSelected.add(cardId)
    }
    setSelectedCards(newSelected)
  }

  const handleCreate = () => {
    const cardsToCreate = cards.filter(card => selectedCards.has(card.id))
    if (cardsToCreate.length === 0) {
      alert('Please select at least one card to create')
      return
    }
    onCreate(cardsToCreate)
  }

  const groupedCards = cards.reduce((acc, card) => {
    const blueprint = blueprintRegistry[card.cardType]
    const category = blueprint?.category || 'Other'
    if (!acc[category]) acc[category] = []
    acc[category].push(card)
    return acc
  }, {} as Record<string, GeneratedCard[]>)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full"
          disabled={loading}
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h3 className="text-lg font-semibold">Review Generated Cards</h3>
          <p className="text-sm text-gray-500">Select which cards you want to create</p>
        </div>
        <div className="text-sm text-gray-600">
          {selectedCards.size} of {cards.length} selected
        </div>
      </div>

      {/* Card Categories */}
      <div className="space-y-6">
        {Object.entries(groupedCards).map(([category, categoryCards]) => (
          <div key={category}>
            <h4 className="font-medium text-gray-900 mb-3">{category}</h4>
            <div className="space-y-3">
              {categoryCards.map(card => {
                const blueprint = blueprintRegistry[card.cardType]
                const isSelected = selectedCards.has(card.id)

                return (
                  <div
                    key={card.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleCard(card.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-600'
                          : 'border-gray-300'
                      }`}>
                        {isSelected && <Check size={14} className="text-white" />}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h5 className="font-medium text-gray-900">{card.title}</h5>
                            <p className="text-sm text-gray-600 mt-1">{card.description}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            card.priority === 'high' 
                              ? 'bg-red-100 text-red-700'
                              : card.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-green-100 text-green-700'
                          }`}>
                            {card.priority}
                          </span>
                        </div>

                        {card.keyPoints && card.keyPoints.length > 0 && (
                          <ul className="mt-3 space-y-1">
                            {card.keyPoints.slice(0, 3).map((point, index) => (
                              <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                                <span className="text-indigo-600 mt-0.5">•</span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        )}

                        <div className="flex items-center gap-2 mt-3">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {blueprint?.name || card.cardType}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-6 border-t">
        <button
          onClick={() => setSelectedCards(new Set())}
          className="text-sm text-gray-600 hover:text-gray-900"
          disabled={loading}
        >
          Deselect All
        </button>

        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            disabled={loading}
          >
            Back
          </button>
          <button
            onClick={handleCreate}
            disabled={loading || selectedCards.size === 0}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : `Create ${selectedCards.size} Cards`}
          </button>
        </div>
      </div>
    </div>
  )
}