'use client'

import React, { useState, useMemo } from 'react'
import { CardCreatorConfig, GenerationContext, GeneratedCard, Card } from './types'
import SourceSelection from './sections/SourceSelection'
import CardDisplay from './sections/CardDisplay'
import OutputConfig from './sections/OutputConfig'
import Preview from './sections/Preview'
import { buildContextSummary, buildStructuredContext } from './utils/contextBuilder'
import { useDevelopmentCards } from '@/hooks/useDevelopmentCards'
import { useBlueprintCards } from '@/hooks/useBlueprintCards'
import { useIntelligenceCards } from '@/hooks/useIntelligenceCards'
import { AIService } from './services/aiService'

interface CardCreatorProps {
  config: CardCreatorConfig
  strategy?: any
  onClose: () => void
  onCardsCreated?: (cards: GeneratedCard[]) => void
}

export default function CardCreator({ 
  config, 
  strategy, 
  onClose,
  onCardsCreated 
}: CardCreatorProps) {
  // Step state management
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedSections, setSelectedSections] = useState<string[]>([])
  const [selectedCards, setSelectedCards] = useState<string[]>([])
  const [targetSection, setTargetSection] = useState<string>('')
  const [cardQuantity, setCardQuantity] = useState(3)
  const [quality, setQuality] = useState<'fast' | 'balanced' | 'high'>('balanced')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCards, setGeneratedCards] = useState<GeneratedCard[]>([])
  const [selectedGeneratedCards, setSelectedGeneratedCards] = useState<string[]>([])

  // Hooks for loading cards - must be at top level
  const { cards: developmentCards } = useDevelopmentCards(strategy?.id)
  const { cards: blueprintCards } = useBlueprintCards(strategy?.id)
  const { cards: intelligenceCards } = useIntelligenceCards()

  // Progress calculation
  const progress = useMemo(() => {
    if (generatedCards.length > 0) return 100
    if (targetSection && selectedCards.length > 0) return 75
    if (selectedCards.length > 0) return 50
    if (selectedSections.length > 0) return 25
    return 0
  }, [selectedSections, selectedCards, targetSection, generatedCards])


  const canProceedToNext = useMemo(() => {
    switch (currentStep) {
      case 1: return selectedSections.length > 0
      case 2: return selectedCards.length > 0
      case 3: return targetSection && cardQuantity > 0
      case 4: return generatedCards.length > 0
      default: return false
    }
  }, [currentStep, selectedSections, selectedCards, targetSection, cardQuantity, generatedCards])

  const handleNext = () => {
    if (canProceedToNext && currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    
    try {
      // Combine all available cards
      const allCards = [...(developmentCards || []), ...(blueprintCards || []), ...(intelligenceCards || [])]
      const contextCards = selectedCards
        .map(id => allCards.find(card => card.id === id))
        .filter(Boolean) as Card[]

      // Build context for MCP
      const structuredContext = buildStructuredContext(contextCards, targetSection)
      const targetCardType = config.sections.find(s => s.id === targetSection)?.cardTypes[0] || 'feature'

      // Call existing MCP endpoint
      const response = await fetch('/api/mcp/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: 'generate_strategy_cards',
          arguments: {
            contextSummary: structuredContext.summary,
            targetBlueprint: targetCardType,
            existingCards: contextCards.map(card => ({
              cardType: card.card_type,
              title: card.title,
              description: card.description
            })),
            generationOptions: {
              count: cardQuantity,
              style: quality,
              targetSection: targetSection
            },
            strategyId: strategy?.id
          }
        })
      })

      if (!response.ok) {
        throw new Error(`MCP request failed: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('MCP Response:', result)
      
      if (result.error) {
        throw new Error(result.error)
      }

      // Check if we got prompts back (which means we need to call AI)
      let rawCards = []
      
      if (result.content && result.content[0]?.text) {
        // Parse the content from MCP
        const mcpContent = JSON.parse(result.content[0].text)
        
        if (mcpContent.prompts) {
          // We received prompts, need to call AI service
          console.log('Received prompts from MCP, calling AI service...')
          const aiService = new AIService()
          
          try {
            rawCards = await aiService.generateFromMCPPrompts(mcpContent)
            console.log('AI generated cards:', rawCards)
          } catch (aiError) {
            console.error('AI service failed:', aiError)
            throw aiError
          }
        } else if (mcpContent.cards) {
          // Direct cards response
          rawCards = mcpContent.cards
        }
      } else {
        // Check for cards in the result directly
        rawCards = result.cards || result.result || result.data || []
      }
      
      console.log('Raw cards to process:', rawCards)
      
      // Handle nested card structures
      let cardsToProcess = rawCards
      
      // Check if cards are nested in a property based on card type
      if (!Array.isArray(rawCards) && typeof rawCards === 'object') {
        // Look for arrays in the object (like valuePropositionCards, strategyCards, etc.)
        const cardArrays = Object.values(rawCards).filter(val => Array.isArray(val))
        if (cardArrays.length > 0) {
          // Flatten all card arrays
          cardsToProcess = cardArrays.flat()
          console.log('Found nested cards, flattened to:', cardsToProcess)
        }
      }
      
      if (!Array.isArray(cardsToProcess) || cardsToProcess.length === 0) {
        console.log('Full MCP result structure:', JSON.stringify(result, null, 2))
        throw new Error('No cards generated. The AI service may need configuration.')
      }
      
      const generatedCards: GeneratedCard[] = cardsToProcess.map((card: any, index: number) => {
        // Map the AI-generated blueprint fields to card_data
        const cardData: any = {
          generated_by: 'mcp_card_creator',
          source_context: `${contextCards.length} cards`,
          generation_config: { quality, quantity: cardQuantity }
        }
        
        // Add blueprint-specific fields
        if (card.blueprintFields) {
          // Map based on the target card type
          if (targetCardType === 'value-proposition') {
            // Map AI fields to Strategy Bank value proposition field names
            if (card.blueprintFields.targetCustomer) {
              cardData.customerSegment = card.blueprintFields.targetCustomer
            }
            if (card.blueprintFields.painPoints) {
              cardData.problemSolved = card.blueprintFields.painPoints
            }
            if (card.blueprintFields.uniqueValue) {
              cardData.gainCreated = card.blueprintFields.uniqueValue
            }
            if (card.blueprintFields.differentiation) {
              cardData.differentiator = card.blueprintFields.differentiation
            }
            // Handle alternative solutions if provided
            if (card.blueprintFields.alternativeSolutions) {
              cardData.alternativeSolutions = Array.isArray(card.blueprintFields.alternativeSolutions) 
                ? card.blueprintFields.alternativeSolutions 
                : []
            }
          } else {
            // For other card types, map fields directly
            Object.entries(card.blueprintFields).forEach(([key, value]) => {
              cardData[key] = value
            })
          }
        }
        
        // Handle confidence
        let confidence = 0.85
        if (card.confidence) {
          if (typeof card.confidence === 'object' && card.confidence.level) {
            confidence = card.confidence.level === 'high' ? 0.9 : card.confidence.level === 'low' ? 0.6 : 0.75
            if (card.confidence.rationale) {
              cardData.confidence_rationale = card.confidence.rationale
            }
          } else if (typeof card.confidence === 'number') {
            confidence = card.confidence
          }
        }
        
        // Handle priority
        let priority = 'Medium'
        if (card.priority) {
          priority = typeof card.priority === 'string' 
            ? card.priority.charAt(0).toUpperCase() + card.priority.slice(1).toLowerCase()
            : 'Medium'
        }
        
        // Add implementation details if present
        if (card.implementation) {
          cardData.implementation = card.implementation
        }
        
        // Add key points if present
        if (card.keyPoints && Array.isArray(card.keyPoints)) {
          cardData.key_points = card.keyPoints
        }
        
        // Add tags if present
        if (card.tags && Array.isArray(card.tags)) {
          cardData.tags = card.tags
        }
        
        // Add relationships if present
        if (card.relationships && Array.isArray(card.relationships)) {
          cardData.relationships = card.relationships
        }
        
        // Merge any existing card_data
        if (card.card_data) {
          Object.assign(cardData, card.card_data)
        }
        
        return {
          id: `generated-${Date.now()}-${index}`,
          title: card.title || `Generated Card ${index + 1}`,
          description: card.description || card.content || '',
          card_type: targetCardType, // Use the target card type from the section config
          priority: priority as 'High' | 'Medium' | 'Low',
          card_data: cardData,
          confidence,
          source: 'ai_generated' as const
        }
      })

      if (generatedCards.length === 0) {
        throw new Error('No cards were generated')
      }

      setGeneratedCards(generatedCards)
      setCurrentStep(4)
    } catch (error) {
      console.error('MCP generation failed:', error)
      
      // Fallback to mock generation if MCP fails
      const shouldUseFallback = confirm(
        'AI generation failed. Would you like to use mock generation instead?\n\n' +
        'Error: ' + (error as Error).message
      )
      
      if (shouldUseFallback) {
        try {
          const targetCardType = config.sections.find(s => s.id === targetSection)?.cardTypes[0] || 'feature'
          const mockCards: GeneratedCard[] = Array.from({ length: cardQuantity }, (_, i) => ({
            id: `generated-${Date.now()}-${i}`,
            title: `Mock ${targetCardType} Card ${i + 1}`,
            description: `Generated using fallback mock generation (MCP unavailable)`,
            card_type: targetCardType,
            priority: 'Medium',
            card_data: {
              generated_by: 'mock_fallback',
              source_context: `${selectedCards.length} cards`,
              generation_config: { quality, quantity: cardQuantity },
              error_reason: (error as Error).message
            },
            confidence: 0.5,
            source: 'ai_generated' as const
          }))
          
          setGeneratedCards(mockCards)
          setCurrentStep(4)
        } catch (fallbackError) {
          console.error('Fallback generation also failed:', fallbackError)
          alert('Both AI and fallback generation failed')
        }
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAddCards = () => {
    const cardsToAdd = generatedCards.filter(card => 
      selectedGeneratedCards.includes(card.id)
    )
    
    if (onCardsCreated) {
      onCardsCreated(cardsToAdd)
    }
    
    // Reset state for next generation
    setGeneratedCards([])
    setSelectedGeneratedCards([])
    setCurrentStep(1)
    setSelectedSections([])
    setSelectedCards([])
    setTargetSection('')
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-3">
      {/* Progress Bar Only */}
      <div className="bg-white rounded-lg border border-gray-200 p-2">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Navigation Buttons */}
      {!isGenerating && (
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center gap-1 text-black font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:text-gray-600"
            style={{ fontSize: '12px', fontWeight: 500 }}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
          
          {currentStep === 3 ? (
            <button
              onClick={handleGenerate}
              disabled={!canProceedToNext || isGenerating}
              className="flex items-center gap-1 text-black font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:text-gray-600"
              style={{ fontSize: '12px', fontWeight: 500 }}
            >
              {isGenerating ? 'Generating...' : `Generate ${cardQuantity} Cards`}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : currentStep === 4 ? (
            <button
              onClick={() => {
                setCurrentStep(3)
                setGeneratedCards([])
                setSelectedGeneratedCards([])
              }}
              className="flex items-center gap-1 text-black font-medium transition-all hover:text-gray-600"
              style={{ fontSize: '12px', fontWeight: 500 }}
            >
              Regenerate
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canProceedToNext}
              className="flex items-center gap-1 text-black font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:text-gray-600"
              style={{ fontSize: '12px', fontWeight: 500 }}
            >
              Next
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Step Content */}
      <div className="mt-2">
      {currentStep === 1 && (
        <SourceSelection
          config={config}
          strategy={strategy}
          selectedSections={selectedSections}
          onSectionChange={setSelectedSections}
        />
      )}

      {currentStep === 2 && (
        <CardDisplay
          config={config}
          strategy={strategy}
          selectedSections={selectedSections}
          selectedCards={selectedCards}
          onCardSelectionChange={setSelectedCards}
        />
      )}

      {currentStep === 3 && (
        <OutputConfig
          config={config}
          targetSection={targetSection}
          onTargetSectionChange={setTargetSection}
          cardQuantity={cardQuantity}
          onQuantityChange={setCardQuantity}
          quality={quality}
          onQualityChange={setQuality}
          selectedCardsCount={selectedCards.length}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
        />
      )}

      {currentStep === 4 && (
        <Preview
          config={config}
          generatedCards={generatedCards}
          selectedGeneratedCards={selectedGeneratedCards}
          onSelectionChange={setSelectedGeneratedCards}
          onAddCards={handleAddCards}
          targetSection={targetSection}
        />
      )}
      </div>

    </div>
  )
}