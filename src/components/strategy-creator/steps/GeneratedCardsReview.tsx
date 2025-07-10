'use client'

import React, { useState, useEffect } from 'react'
import { Sparkles, Check, Edit2, Save, X, AlertCircle } from 'lucide-react'
import { blueprintRegistry } from '@/components/blueprints/registry'
import MasterCard from '@/components/cards/MasterCard'

interface GeneratedCardsReviewProps {
  sessionId: string
  contextSummary: string
  targetBlueprint: string
  generationOptions: any
  generatedCards: any[]
  onCardsGenerated: (cards: any[]) => void
  onComplete: () => void
}

export default function GeneratedCardsReview({
  sessionId,
  contextSummary,
  targetBlueprint,
  generationOptions,
  generatedCards,
  onCardsGenerated,
  onComplete
}: GeneratedCardsReviewProps) {
  const [cards, setCards] = useState(generatedCards)
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [committing, setCommitting] = useState(false)
  const [editingCard, setEditingCard] = useState<string | null>(null)
  const [editedCards, setEditedCards] = useState<Record<string, any>>({})

  useEffect(() => {
    if (cards.length === 0 && contextSummary && targetBlueprint) {
      generateCards()
    } else if (cards.length > 0) {
      // Pre-select all cards by default
      setSelectedCards(new Set(cards.map(c => c.id)))
    }
  }, [])

  const generateCards = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/strategy-creator/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          contextSummary,
          targetBlueprint,
          generationOptions
        })
      })

      if (!response.ok) throw new Error('Failed to generate cards')

      const { cards: newCards } = await response.json()
      setCards(newCards)
      setSelectedCards(new Set(newCards.map((c: any) => c.id)))
      onCardsGenerated(newCards)
    } catch (error) {
      console.error('Error generating cards:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleCardSelection = (cardId: string) => {
    const newSelected = new Set(selectedCards)
    if (newSelected.has(cardId)) {
      newSelected.delete(cardId)
    } else {
      newSelected.add(cardId)
    }
    setSelectedCards(newSelected)
  }

  const handleEditCard = (cardId: string) => {
    const card = cards.find(c => c.id === cardId)
    if (card) {
      setEditedCards({ ...editedCards, [cardId]: { ...card } })
      setEditingCard(cardId)
    }
  }

  const handleSaveEdit = (cardId: string) => {
    const editedCard = editedCards[cardId]
    if (editedCard) {
      setCards(cards.map(c => c.id === cardId ? editedCard : c))
      onCardsGenerated(cards.map(c => c.id === cardId ? editedCard : c))
    }
    setEditingCard(null)
  }

  const handleCancelEdit = (cardId: string) => {
    delete editedCards[cardId]
    setEditingCard(null)
  }

  const updateEditedCard = (cardId: string, field: string, value: any) => {
    setEditedCards({
      ...editedCards,
      [cardId]: {
        ...editedCards[cardId],
        [field]: value
      }
    })
  }

  const commitCards = async () => {
    if (selectedCards.size === 0) return

    setCommitting(true)
    try {
      const cardsToCommit = cards.filter(c => selectedCards.has(c.id))
      
      const response = await fetch('/api/strategy-creator/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          selectedCards: cardsToCommit
        })
      })

      if (!response.ok) throw new Error('Failed to commit cards')

      const { count } = await response.json()
      
      // Success - close the modal
      onComplete()
    } catch (error) {
      console.error('Error committing cards:', error)
    } finally {
      setCommitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-sm text-gray-600">Generating {targetBlueprint} cards...</p>
      </div>
    )
  }

  const blueprint = blueprintRegistry[targetBlueprint]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Review Generated Cards
        </h3>
        <p className="text-sm text-gray-600">
          Review, edit, and select which cards to add to your strategy
        </p>
      </div>

      {/* Selection Bar */}
      <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {selectedCards.size} of {cards.length} cards selected
          </span>
          <button
            onClick={() => setSelectedCards(new Set(cards.map(c => c.id)))}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            Select All
          </button>
          <button
            onClick={() => setSelectedCards(new Set())}
            className="text-sm text-gray-600 hover:text-gray-700"
          >
            Deselect All
          </button>
        </div>

        <button
          onClick={generateCards}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <Sparkles size={16} />
          Regenerate
        </button>
      </div>

      {/* Cards List */}
      <div className="space-y-4">
        {cards.map((card) => {
          const isSelected = selectedCards.has(card.id)
          const isEditing = editingCard === card.id
          const editedCard = editedCards[card.id] || card

          return (
            <div
              key={card.id}
              className={`relative rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200'
              }`}
            >
              {/* Selection Checkbox */}
              <div className="absolute top-4 left-4 z-10">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleCardSelection(card.id)}
                  className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
              </div>

              {/* AI Generated Badge */}
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                <span className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                  <Sparkles size={12} />
                  AI Generated
                </span>
                {!isEditing && (
                  <button
                    onClick={() => handleEditCard(card.id)}
                    className="p-1.5 hover:bg-gray-200 rounded"
                    title="Edit card"
                  >
                    <Edit2 size={16} />
                  </button>
                )}
              </div>

              {/* Card Content */}
              <div className="pt-12 px-4 pb-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editedCard.title}
                      onChange={(e) => updateEditedCard(card.id, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                      placeholder="Card title"
                    />
                    <textarea
                      value={editedCard.description}
                      onChange={(e) => updateEditedCard(card.id, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                      rows={3}
                      placeholder="Card description"
                    />
                    
                    {/* Blueprint Fields */}
                    {blueprint && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-700">Blueprint Fields</h4>
                        {/* Simplified field editing - full implementation would use BlueprintFields component */}
                        <div className="p-3 bg-gray-50 rounded text-xs text-gray-600">
                          Blueprint-specific fields would be edited here
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleCancelEdit(card.id)}
                        className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(card.id)}
                        className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">{card.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{card.description}</p>
                    
                    {/* Key Points */}
                    {card.keyPoints && card.keyPoints.length > 0 && (
                      <div className="mb-3">
                        <h5 className="text-xs font-medium text-gray-700 mb-1">Key Points:</h5>
                        <ul className="space-y-1">
                          {card.keyPoints.map((point: string, idx: number) => (
                            <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                              <span className="text-indigo-600 mt-0.5">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className={`px-2 py-0.5 rounded-full ${
                        card.priority === 'high' 
                          ? 'bg-red-100 text-red-700'
                          : card.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                      }`}>
                        {card.priority} priority
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                        {blueprint?.name || targetBlueprint}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Warning if no cards selected */}
      {selectedCards.size === 0 && (
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200 flex items-start gap-3">
          <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-900">No cards selected</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Please select at least one card to add to your strategy.
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-8 flex justify-end gap-3">
        <button
          onClick={() => window.history.back()}
          className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
        >
          Back
        </button>
        <button
          onClick={commitCards}
          disabled={selectedCards.size === 0 || committing}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {committing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Creating...
            </>
          ) : (
            <>
              <Check size={16} />
              Create {selectedCards.size} Cards
            </>
          )}
        </button>
      </div>
    </div>
  )
}