'use client'

import React from 'react'
import { X } from 'lucide-react'
import CardCreator from '../card-creator/CardCreator'
import { createCardCreator } from '../card-creator/factory'

interface CardCreatorAgentProps {
  onClose: () => void
  configuration?: {
    hubContext?: 'intelligence' | 'strategy' | 'development' | 'organisation'
    strategy?: any
    onCardsCreated?: (cards: any[], metadata?: { targetSection: string; targetCardType: string }) => void
  }
}

export default function CardCreatorAgent({ onClose, configuration }: CardCreatorAgentProps) {
  // Default to development context if not specified
  const hubContext = configuration?.hubContext || 'development'
  const strategy = configuration?.strategy
  
  // Create configuration based on hub context
  const config = createCardCreator(hubContext as any)
  
  // Debug logging
  console.log('CardCreatorAgent - Hub context:', hubContext)
  console.log('CardCreatorAgent - Config created:', config)
  console.log('CardCreatorAgent - Config sections length:', config?.sections?.length)
  
  return (
    <div className="h-full flex flex-col bg-white">
      {/* Agent Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Card Creator Agent</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Create cards with AI assistance based on existing context
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Card Creator Component */}
      <div className="flex-1 overflow-y-auto">
        <CardCreator
          config={config}
          strategy={strategy}
          onClose={onClose}
          onCardsCreated={(cards, metadata) => {
            console.log('Cards created:', cards, 'Metadata:', metadata)
            // Call the configured onCardsCreated handler if provided
            if (configuration?.onCardsCreated) {
              configuration.onCardsCreated(cards, metadata)
            }
          }}
        />
      </div>
    </div>
  )
}