'use client'

import { useState } from 'react'
import MasterCard from '@/components/cards/MasterCard'
import { useCards } from '@/hooks/useCards'
import { Plus, RefreshCw } from 'lucide-react'

export default function CardsTestPage() {
  const [strategyId] = useState(2) // Using real strategy ID from database
  const { 
    cards, 
    loading, 
    error, 
    createCard, 
    updateCard, 
    deleteCard, 
    duplicateCard, 
    refreshCards 
  } = useCards(strategyId)

  const availableCards = cards.map(card => ({
    id: card.id,
    title: card.title,
    cardType: card.cardType
  }))

  const handleUpdate = (cardId: string) => async (updates: any) => {
    console.log('🔄 Updating card:', cardId, updates)
    const result = await updateCard(cardId, updates)
    if (result) {
      console.log('✅ Card updated successfully')
    }
  }

  const handleDelete = (cardId: string) => async () => {
    console.log('🗑️ Deleting card:', cardId)
    const confirmed = window.confirm('Are you sure you want to delete this card?')
    if (confirmed) {
      const result = await deleteCard(cardId)
      if (result) {
        console.log('✅ Card deleted successfully')
      }
    }
  }

  const handleDuplicate = (cardId: string) => async () => {
    console.log('📋 Duplicating card:', cardId)
    const result = await duplicateCard(cardId)
    if (result) {
      console.log('✅ Card duplicated successfully')
    }
  }

  const handleAIEnhance = (cardId: string) => () => {
    console.log('🤖 AI Enhancing card:', cardId)
    // TODO: Implement AI enhancement
  }

  const handleCreateSampleCard = async () => {
    const sampleCards = [
      {
        title: 'New Strategic Context',
        description: 'Sample strategic context card for testing',
        cardType: 'strategic-context',
        priority: 'Medium' as const,
        confidenceLevel: 'Medium' as const,
        strategicAlignment: 'Test alignment',
        tags: ['Test', 'Sample'],
        relationships: [],
        marketContext: 'Sample market context',
        competitiveLandscape: 'Sample competitive landscape',
        keyTrends: ['Test trend 1', 'Test trend 2'],
        stakeholders: ['Test stakeholder'],
        timeframe: '1 year'
      },
      {
        title: 'Sample Vision Statement',
        description: 'Test vision for the platform',
        cardType: 'vision',
        priority: 'High' as const,
        confidenceLevel: 'High' as const,
        strategicAlignment: 'Core vision statement',
        tags: ['Vision', 'Strategy'],
        relationships: [],
        visionType: 'Product',
        timeHorizon: '3 years',
        guidingPrinciples: ['Innovation', 'Customer-centricity'],
        inspirationSource: 'Market research'
      },
      {
        title: 'Enterprise User Persona',
        description: 'Primary enterprise user persona',
        cardType: 'personas',
        priority: 'High' as const,
        confidenceLevel: 'Medium' as const,
        strategicAlignment: 'Supports product development',
        tags: ['Personas', 'Enterprise'],
        relationships: [],
        personaType: 'Primary',
        demographics: { age: '35-45', role: 'Director' },
        goals: ['Efficiency', 'ROI'],
        painPoints: ['Complexity', 'Integration issues']
      }
    ]

    const randomCard = sampleCards[Math.floor(Math.random() * sampleCards.length)]
    await createCard(randomCard)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="animate-spin h-8 w-8 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Loading cards...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Database-Connected Master Cards</h1>
              <p className="text-sm text-gray-600">
                Testing real database integration with Supabase. All changes are now persisted!
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={refreshCards}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <RefreshCw size={16} />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleCreateSampleCard}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-md transition-colors"
              >
                <Plus size={16} />
                <span>Add Sample Card</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">
                <strong>Error:</strong> {error}
              </p>
            </div>
          )}

          <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Database Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Total Cards:</span>
                <span className="ml-2 text-gray-900">{cards.length}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Strategy ID:</span>
                <span className="ml-2 text-gray-500 font-mono text-xs">{strategyId}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Connection:</span>
                <span className="ml-2 text-green-600">✅ Connected</span>
              </div>
            </div>
          </div>
        </div>

        {cards.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Plus size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No cards yet</h3>
            <p className="text-gray-600 mb-4">Create your first card to get started!</p>
            <button
              onClick={handleCreateSampleCard}
              className="btn btn-primary"
            >
              Create Sample Card
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {cards.map((card) => (
              <MasterCard
                key={card.id}
                cardData={card}
                onUpdate={handleUpdate(card.id)}
                onDelete={handleDelete(card.id)}
                onDuplicate={handleDuplicate(card.id)}
                onAIEnhance={handleAIEnhance(card.id)}
                availableCards={availableCards}
              />
            ))}
          </div>
        )}

        <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Database Integration Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h3 className="font-medium text-gray-900 mb-1">✅ Working:</h3>
              <ul className="space-y-1">
                <li>• Real database persistence</li>
                <li>• Create/read/update/delete cards</li>
                <li>• Blueprint-specific field storage</li>
                <li>• Automatic timestamps</li>
                <li>• Duplicate card functionality</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">🎯 Next Phase:</h3>
              <ul className="space-y-1">
                <li>• Connect to real strategies</li>
                <li>• User authentication integration</li>
                <li>• Blueprint Manager database</li>
                <li>• AI enhancement backend</li>
                <li>• Real-time updates</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}