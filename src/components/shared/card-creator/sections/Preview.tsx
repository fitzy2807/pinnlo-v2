'use client'

import React from 'react'
import { CardCreatorConfig, GeneratedCard } from '../types'

interface PreviewProps {
  config: CardCreatorConfig
  generatedCards: GeneratedCard[]
  selectedGeneratedCards: string[]
  onSelectionChange: (cardIds: string[]) => void
  onAddCards: () => void
  targetSection: string
}

export default function Preview({
  config,
  generatedCards,
  selectedGeneratedCards,
  onSelectionChange,
  onAddCards,
  targetSection
}: PreviewProps) {
  const handleToggleCard = (cardId: string) => {
    if (selectedGeneratedCards.includes(cardId)) {
      onSelectionChange(selectedGeneratedCards.filter(id => id !== cardId))
    } else {
      onSelectionChange([...selectedGeneratedCards, cardId])
    }
  }

  const handleToggleAll = () => {
    if (selectedGeneratedCards.length === generatedCards.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(generatedCards.map(card => card.id))
    }
  }

  const targetSectionLabel = config.sections.find(s => s.id === targetSection)?.label || targetSection

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        Preview & Add Cards
      </h3>
      
      {generatedCards.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">No cards generated yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm text-gray-900 font-medium">
                {generatedCards.length} cards generated
              </p>
              <p className="text-xs text-gray-600">
                Generated using {generatedCards[0]?.card_data?.source_context || 'AI context'}
              </p>
            </div>
            <button
              onClick={handleToggleAll}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {selectedGeneratedCards.length === generatedCards.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          
          {/* Generation metadata */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-xs text-blue-800">
                <p className="font-medium">Generation Complete</p>
                <p>Cards generated using MCP AI with {generatedCards[0]?.card_data?.generation_config?.quality || 'balanced'} quality setting</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {generatedCards.map((card) => (
              <div key={card.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedGeneratedCards.includes(card.id)}
                    onChange={() => handleToggleCard(card.id)}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{card.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{card.description}</p>
                    
                    {/* Show blueprint fields */}
                    {card.card_data && Object.keys(card.card_data).length > 0 && (
                      <div className="mt-3 space-y-2 text-xs">
                        {/* Value Proposition specific fields */}
                        {card.card_type === 'value-proposition' && card.card_data.customerSegment && (
                          <div>
                            <span className="font-medium text-gray-700">Customer Segment:</span>
                            <p className="text-gray-600 mt-0.5">{card.card_data.customerSegment}</p>
                          </div>
                        )}
                        {card.card_type === 'value-proposition' && card.card_data.problemSolved && (
                          <div>
                            <span className="font-medium text-gray-700">Problem Solved:</span>
                            <p className="text-gray-600 mt-0.5">{card.card_data.problemSolved}</p>
                          </div>
                        )}
                        {card.card_type === 'value-proposition' && card.card_data.gainCreated && (
                          <div>
                            <span className="font-medium text-gray-700">Gain Created:</span>
                            <p className="text-gray-600 mt-0.5">{card.card_data.gainCreated}</p>
                          </div>
                        )}
                        {card.card_type === 'value-proposition' && card.card_data.differentiator && (
                          <div>
                            <span className="font-medium text-gray-700">Key Differentiator:</span>
                            <p className="text-gray-600 mt-0.5">{card.card_data.differentiator}</p>
                          </div>
                        )}
                        {card.card_type === 'value-proposition' && card.card_data.alternativeSolutions && card.card_data.alternativeSolutions.length > 0 && (
                          <div>
                            <span className="font-medium text-gray-700">Alternative Solutions:</span>
                            <ul className="mt-1 ml-4 list-disc">
                              {card.card_data.alternativeSolutions.map((solution: string, idx: number) => (
                                <li key={idx} className="text-gray-600">{solution}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Key Points */}
                        {card.card_data.key_points && Array.isArray(card.card_data.key_points) && (
                          <div>
                            <span className="font-medium text-gray-700">Key Points:</span>
                            <ul className="mt-1 ml-4 list-disc">
                              {card.card_data.key_points.map((point: string, idx: number) => (
                                <li key={idx} className="text-gray-600">{point}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-2 flex items-center space-x-2">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {card.card_type}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                        {card.priority}
                      </span>
                      {card.confidence && (
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                          {Math.round(card.confidence * 100)}% confidence
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {selectedGeneratedCards.length > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={onAddCards}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Add {selectedGeneratedCards.length} Cards to {targetSectionLabel}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}