'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import ContextInput from './ContextInput'
import CardTypeSelector from './CardTypeSelector'
import StrategyPreview from './StrategyPreview'
import { StrategyCreatorContext, GeneratedCard } from '@/types/strategy-creator'

interface StrategyCreatorModalProps {
  isOpen: boolean
  onClose: () => void
  strategyId: string
}

export default function StrategyCreatorModal({ isOpen, onClose, strategyId }: StrategyCreatorModalProps) {
  const [step, setStep] = useState<'context' | 'cards' | 'preview'>('context')
  const [context, setContext] = useState<StrategyCreatorContext>({
    businessContext: '',
    goals: [],
    challenges: [],
    constraints: []
  })
  const [selectedCardTypes, setSelectedCardTypes] = useState<string[]>([])
  const [generatedCards, setGeneratedCards] = useState<GeneratedCard[]>([])
  const [loading, setLoading] = useState(false)

  const handleContextSubmit = async (newContext: StrategyCreatorContext) => {
    setContext(newContext)
    setStep('cards')
  }

  const handleCardTypeSubmit = async (cardTypes: string[]) => {
    setSelectedCardTypes(cardTypes)
    setLoading(true)

    try {
      // Generate context summary
      const summaryResponse = await fetch('/api/strategy-creator/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context })
      })

      if (!summaryResponse.ok) throw new Error('Failed to generate summary')
      const { summary } = await summaryResponse.json()

      // Generate strategy cards
      const cardsResponse = await fetch('/api/strategy-creator/generate-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          summary, 
          cardTypes,
          strategyId 
        })
      })

      if (!cardsResponse.ok) throw new Error('Failed to generate cards')
      const { cards } = await cardsResponse.json()

      setGeneratedCards(cards)
      setStep('preview')
    } catch (error) {
      console.error('Error generating strategy:', error)
      alert('Failed to generate strategy. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCards = async (cardsToCreate: GeneratedCard[]) => {
    setLoading(true)

    try {
      const response = await fetch('/api/strategy-creator/create-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cards: cardsToCreate,
          strategyId 
        })
      })

      if (!response.ok) throw new Error('Failed to create cards')

      onClose()
      window.location.reload() // Refresh to show new cards
    } catch (error) {
      console.error('Error creating cards:', error)
      alert('Failed to create cards. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Strategy Creator</h2>
            <p className="text-sm text-gray-500 mt-1">
              {step === 'context' && 'Define your business context'}
              {step === 'cards' && 'Select card types to generate'}
              {step === 'preview' && 'Review and create your strategy cards'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {step === 'context' && (
            <ContextInput 
              context={context}
              onSubmit={handleContextSubmit}
            />
          )}

          {step === 'cards' && (
            <CardTypeSelector
              selectedTypes={selectedCardTypes}
              onSubmit={handleCardTypeSubmit}
              onBack={() => setStep('context')}
              loading={loading}
            />
          )}

          {step === 'preview' && (
            <StrategyPreview
              cards={generatedCards}
              onCreate={handleCreateCards}
              onBack={() => setStep('cards')}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  )
}