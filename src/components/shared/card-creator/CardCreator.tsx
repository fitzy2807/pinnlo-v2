'use client'

import React, { useState, useMemo } from 'react'
import { CardCreatorConfig, GenerationContext, GeneratedCard, Card } from './types'
import SourceSelection from './sections/SourceSelection'
import CardDisplay from './sections/CardDisplay'
import OutputConfig from './sections/OutputConfig'
import ContextPreview from './sections/ContextPreview'
import { buildContextSummary, buildStructuredContext } from './utils/contextBuilder'
import { useDevelopmentCards } from '@/hooks/useDevelopmentCards'
import { useBlueprintCards } from '@/hooks/useBlueprintCards'
import { useIntelligenceCards } from '@/hooks/useIntelligenceCards'
import { AIService } from './services/aiService'
import { toast } from 'react-hot-toast'

interface CardCreatorProps {
  config: CardCreatorConfig
  strategy?: any
  onClose: () => void
  onCardsCreated?: (cards: GeneratedCard[], metadata?: { targetSection: string; targetCardType: string }) => void
}

export default function CardCreator({ 
  config, 
  strategy, 
  onClose,
  onCardsCreated 
}: CardCreatorProps) {
  // Step state management - 3 steps + preview
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedSections, setSelectedSections] = useState<string[]>([])
  const [selectedCards, setSelectedCards] = useState<string[]>([])
  const [targetSection, setTargetSection] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Context preview state - now includes quantity determination
  const [contextPreview, setContextPreview] = useState<string | null>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false)
  const [plannedQuantity, setPlannedQuantity] = useState<number>(0)

  // Hooks for loading cards - must be at top level
  const { cards: developmentCards } = useDevelopmentCards(strategy?.id)
  const { cards: blueprintCards } = useBlueprintCards(strategy?.id)
  const { cards: intelligenceCards } = useIntelligenceCards()

  // Progress calculation - for 3 steps + preview
  const progress = useMemo(() => {
    if (isGenerating) return 90
    if (contextPreview) return 75
    if (targetSection) return 60
    if (selectedCards.length > 0) return 40
    if (selectedSections.length > 0) return 20
    return 0
  }, [selectedSections, selectedCards, targetSection, contextPreview, isGenerating])


  const canProceedToNext = useMemo(() => {
    switch (currentStep) {
      case 1: return selectedSections.length > 0
      case 2: return selectedCards.length > 0
      case 3: return targetSection !== ''
      default: return false
    }
  }, [currentStep, selectedSections, selectedCards, targetSection])

  const handleNext = () => {
    if (canProceedToNext && currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleGeneratePreview = async () => {
    console.log('handleGeneratePreview called, currentStep:', currentStep)
    setIsGeneratingPreview(true)
    setPreviewError(null)
    
    try {
      // Combine all available cards
      const allCards = [...(developmentCards || []), ...(blueprintCards || []), ...(intelligenceCards || [])]
      
      // Use selected cards
      const contextCards = selectedCards
        .map(id => allCards.find(card => card.id === id))
        .filter(Boolean) as Card[]

      // Build context for preview
      const structuredContext = buildStructuredContext(contextCards, targetSection)
      const targetCardType = config.sections.find(s => s.id === targetSection)?.cardTypes[0] || 'feature'

      // Call MCP endpoint with preview_only flag
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
              title: card.title
            })),
            preview_only: true
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Preview generation failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.error) {
        throw new Error(result.error)
      }

      // Extract preview from MCP response
      console.log('MCP result:', result)
      
      if (result.content && result.content[0]?.text) {
        const mcpContent = JSON.parse(result.content[0].text)
        console.log('MCP content:', mcpContent)
        
        if (mcpContent.preview && mcpContent.prompts) {
          // We need to call AI service to generate the actual preview text
          const aiService = new AIService()
          const previewText = await aiService.generateFromMCPPrompts(mcpContent)
          console.log('Preview text received:', previewText)
          setContextPreview(previewText)
          
          // Extract the planned quantity from the preview - handle different formats including bold markdown
          const quantityMatch = previewText.match(/(?:I will create|create|creating)\s+(?:\*\*)?(\d+|one|two|three|four|five|six|seven|eight|nine|ten)(?:\*\*)?\s+[\w\s-]*?cards/i)
          if (quantityMatch) {
            const numberMap: { [key: string]: number } = {
              'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
              'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
            }
            const quantity = numberMap[quantityMatch[1].toLowerCase()] || parseInt(quantityMatch[1])
            setPlannedQuantity(quantity)
            console.log('Planned quantity:', quantity)
          } else {
            console.warn('Could not extract quantity from preview:', previewText.substring(0, 200))
            // Default to 3 cards if preview doesn't specify
            const defaultQuantity = 3
            setPlannedQuantity(defaultQuantity)
            console.log('Using default quantity:', defaultQuantity)
          }
        } else {
          throw new Error('Invalid preview response format')
        }
      } else {
        throw new Error('No content in MCP response')
      }
    } catch (error) {
      console.error('Preview generation failed:', error)
      setPreviewError((error as Error).message)
      // Stay on step 3 to show the error in ContextPreview
      // The error will be displayed in the ContextPreview component
    } finally {
      setIsGeneratingPreview(false)
    }
  }

  const handleGenerate = async () => {
    console.log('handleGenerate called')
    setIsGenerating(true)
    const generatedCards: GeneratedCard[] = []
    
    try {
      // Combine all available cards
      const allCards = [...(developmentCards || []), ...(blueprintCards || []), ...(intelligenceCards || [])]
      
      // Use selected cards (same as preview)
      const contextCards = selectedCards
        .map(id => allCards.find(card => card.id === id))
        .filter(Boolean) as Card[]

      // Build context for MCP
      const structuredContext = buildStructuredContext(contextCards, targetSection)
      const targetCardType = config.sections.find(s => s.id === targetSection)?.cardTypes[0] || 'feature'

      // Generate cards one at a time
      for (let i = 0; i < plannedQuantity; i++) {
        toast.loading(`Generating card ${i + 1} of ${plannedQuantity}...`, { id: `card-gen-${i}` })
        
        // Call MCP endpoint for single card
        const response = await fetch('/api/mcp/invoke', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tool: 'generate_strategy_cards',
            arguments: {
              contextSummary: structuredContext.summary,
              targetBlueprint: targetCardType,
              existingCards: [...contextCards, ...generatedCards].map(card => ({
                cardType: card.card_type || targetCardType,
                title: card.title,
                description: card.description
              })),
              cardIndex: i + 1,
              generationOptions: {
                count: 1, // Always 1 for single card generation
                style: 'balanced',
                targetSection: targetSection
              },
              strategyId: strategy?.id
            }
          })
        })

        if (!response.ok) {
          throw new Error(`MCP request failed for card ${i + 1}: ${response.statusText}`)
        }

        const result = await response.json()
        console.log(`MCP Response for card ${i + 1}:`, result)
        
        if (result.error) {
          throw new Error(result.error)
        }

        // Process single card response
        let rawCard = null
        
        if (result.content && result.content[0]?.text) {
          // Parse the content from MCP
          const mcpContent = JSON.parse(result.content[0].text)
          
          if (mcpContent.prompts && mcpContent.isSingleCard) {
            // We received prompts, need to call AI service
            console.log(`Received prompts from MCP for card ${i + 1}, calling AI service...`)
            const aiService = new AIService()
            
            try {
              const aiResponse = await aiService.generateFromMCPPrompts(mcpContent)
              console.log(`AI generated card ${i + 1}:`, aiResponse)
              
              // For single card, response should be an object, not an array
              // If aiResponse is an array with one card, extract it
              if (Array.isArray(aiResponse) && aiResponse.length > 0) {
                rawCard = aiResponse[0]
              } else if (typeof aiResponse === 'string') {
                rawCard = JSON.parse(aiResponse)
              } else {
                rawCard = aiResponse
              }
            } catch (aiError) {
              console.error(`AI service failed for card ${i + 1}:`, aiError)
              toast.error(`Failed to generate card ${i + 1}`, { id: `card-gen-${i}` })
              continue // Skip this card and try next
            }
          } else if (mcpContent.card) {
            // Direct card response
            rawCard = mcpContent.card
          }
        }
        
        if (!rawCard) {
          console.error(`No card generated for index ${i + 1}`)
          toast.error(`Failed to generate card ${i + 1}`, { id: `card-gen-${i}` })
          continue
        }
        
        console.log(`Processing card ${i + 1}:`, rawCard)
        
        // Map the single card
        const generatedCard: GeneratedCard = (() => {
          const card = rawCard
          
          // Map the AI-generated blueprint fields to card_data
          const cardData: any = {
            generated_by: 'mcp_card_creator',
            source_context: `${contextCards.length} cards`,
            generation_config: { quality: 'balanced', quantity: plannedQuantity },
            card_index: i + 1
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
            id: `generated-${Date.now()}-${i}`,
            title: card.title || `Generated Card ${i + 1}`,
            description: card.description || card.content || '',
            card_type: targetCardType,
            priority: priority as 'High' | 'Medium' | 'Low',
            card_data: cardData,
            confidence,
            source: 'ai_generated' as const
          }
        })()
        
        generatedCards.push(generatedCard)
        toast.success(`Generated card ${i + 1}`, { id: `card-gen-${i}` })
      }

      if (generatedCards.length === 0) {
        throw new Error('No cards were successfully generated')
      }

      // Auto-add all generated cards
      console.log(`Auto-adding ${generatedCards.length} generated cards`)
      if (onCardsCreated) {
        await onCardsCreated(generatedCards, {
          targetSection: targetSection,
          targetCardType: targetCardType
        })
      }
      
      // Check if any cards were generated
      if (generatedCards.length === 0) {
        throw new Error('No cards were generated. Please try again.')
      }
      
      // Close the modal after successful generation
      toast.success(`Successfully created ${generatedCards.length} cards!`)
      onClose()
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
          const mockCards: GeneratedCard[] = Array.from({ length: plannedQuantity || 2 }, (_, i) => ({
            id: `generated-${Date.now()}-${i}`,
            title: `Mock ${targetCardType} Card ${i + 1}`,
            description: `Generated using fallback mock generation (MCP unavailable)`,
            card_type: targetCardType,
            priority: 'Medium',
            card_data: {
              generated_by: 'mock_fallback',
              source_context: `${selectedCards.length} cards`,
              generation_config: { quality: 'balanced', quantity: plannedQuantity || 2 },
              error_reason: (error as Error).message
            },
            confidence: 0.5,
            source: 'ai_generated' as const
          }))
          
          // Auto-add mock cards
          if (onCardsCreated) {
            await onCardsCreated(mockCards)
          }
          toast.success(`Created ${mockCards.length} mock cards`)
          onClose()
        } catch (fallbackError) {
          console.error('Fallback generation also failed:', fallbackError)
          alert('Both AI and fallback generation failed')
        }
      }
    } finally {
      setIsGenerating(false)
    }
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
              onClick={handleGeneratePreview}
              disabled={!canProceedToNext || isGeneratingPreview}
              className="flex items-center gap-1 text-black font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:text-gray-600"
              style={{ fontSize: '12px', fontWeight: 500 }}
            >
              {isGeneratingPreview ? 'Analyzing...' : 'Generate Preview'}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
      <div className="mt-2 w-full max-w-5xl mx-auto">
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
        contextPreview ? (
          <ContextPreview
            contextSummary={buildContextSummary(selectedCards.map(id => {
              const allCards = [...(developmentCards || []), ...(blueprintCards || []), ...(intelligenceCards || [])]
              return allCards.find(card => card.id === id)
            }).filter(Boolean) as Card[])}
            targetSection={config.sections.find(s => s.id === targetSection)?.name || targetSection}
            selectedCardsCount={selectedCards.length}
            onApprove={async () => {
              console.log('Preview approved, generating cards')
              await handleGenerate()
            }}
            onRegenerate={handleGeneratePreview}
            isGenerating={isGeneratingPreview || isGenerating}
            preview={contextPreview}
            error={previewError}
            plannedQuantity={plannedQuantity}
          />
        ) : (
          <OutputConfig
            config={config}
            targetSection={targetSection}
            onTargetSectionChange={setTargetSection}
            selectedCardsCount={selectedCards.length}
          />
        )
      )}
      </div>

    </div>
  )
}