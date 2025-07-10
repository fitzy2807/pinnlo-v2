/**
 * Intelligence-Driven Generation Controller
 * 
 * This component provides intelligence-aware generation buttons that integrate
 * with the Intelligence Bank and MCP sequencing system.
 */

'use client'

import { useState } from 'react'
import { Sparkles, Database, Zap, Settings, Play, Pause } from 'lucide-react'
import { intelligenceMCPSequencer, MCPGenerationRequest, GenerationSequence } from '@/utils/intelligenceMCPSequencing'
import { CardData } from '@/types/card'

interface IntelligenceGenerationControllerProps {
  strategyId: string
  blueprintType: string
  existingCards: CardData[]
  onCardGenerated: (card: CardData) => void
  onGenerationComplete: (cards: CardData[]) => void
}

export default function IntelligenceGenerationController({
  strategyId,
  blueprintType,
  existingCards,
  onCardGenerated,
  onGenerationComplete
}: IntelligenceGenerationControllerProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationMode, setGenerationMode] = useState<'single' | 'batch' | 'sequential'>('single')
  const [contextDepth, setContextDepth] = useState<'minimal' | 'standard' | 'comprehensive'>('standard')
  const [generationProgress, setGenerationProgress] = useState<{
    currentStep: number
    totalSteps: number
    currentBlueprint: string
    estimatedTimeRemaining: number
  } | null>(null)

  /**
   * Generate a single card with Intelligence Bank context
   */
  const handleSingleGeneration = async () => {
    setIsGenerating(true)
    
    try {
      const request: MCPGenerationRequest = {
        blueprintType,
        strategyId,
        intelligenceContext: await intelligenceMCPSequencer['getIntelligenceContext'](strategyId),
        existingCards,
        generationMode: 'single',
        contextDepth
      }

      // Get the generation step for this blueprint
      const sequence = await intelligenceMCPSequencer.generateIntelligenceDrivenStrategy(request)
      const step = sequence.steps.find(s => s.blueprintType === blueprintType)
      
      if (!step) {
        throw new Error(`No generation configuration found for ${blueprintType}`)
      }

      // Execute generation with Intelligence Bank context
      const generatedCard = await intelligenceMCPSequencer.executeGenerationStep(
        step,
        request.intelligenceContext,
        existingCards
      )

      onCardGenerated(generatedCard)
      
    } catch (error) {
      console.error('Single generation failed:', error)
      alert(`Generation failed: ${error.message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  /**
   * Generate multiple cards in intelligent sequence
   */
  const handleBatchGeneration = async () => {
    setIsGenerating(true)
    
    try {
      const request: MCPGenerationRequest = {
        blueprintType: 'all', // Generate all missing blueprints
        strategyId,
        intelligenceContext: await intelligenceMCPSequencer['getIntelligenceContext'](strategyId),
        existingCards,
        generationMode: 'batch',
        contextDepth
      }

      const sequence = await intelligenceMCPSequencer.generateIntelligenceDrivenStrategy(request)
      const generatedCards: CardData[] = []

      // Execute generation sequence
      setGenerationProgress({
        currentStep: 0,
        totalSteps: sequence.steps.length,
        currentBlueprint: sequence.steps[0]?.blueprintType || '',
        estimatedTimeRemaining: sequence.estimatedDuration
      })

      for (let i = 0; i < sequence.steps.length; i++) {
        const step = sequence.steps[i]
        
        setGenerationProgress(prev => prev ? {
          ...prev,
          currentStep: i + 1,
          currentBlueprint: step.blueprintType,
          estimatedTimeRemaining: Math.max(0, prev.estimatedTimeRemaining - 45) // Reduce by ~45s per step
        } : null)

        try {
          const generatedCard = await intelligenceMCPSequencer.executeGenerationStep(
            step,
            request.intelligenceContext,
            [...existingCards, ...generatedCards] // Include previously generated cards as context
          )

          generatedCards.push(generatedCard)
          onCardGenerated(generatedCard)
          
          // Add delay between generations to avoid rate limiting
          if (i < sequence.steps.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000))
          }
          
        } catch (stepError) {
          console.error(`Generation failed for ${step.blueprintType}:`, stepError)
          // Continue with other steps even if one fails
        }
      }

      onGenerationComplete(generatedCards)
      
    } catch (error) {
      console.error('Batch generation failed:', error)
      alert(`Batch generation failed: ${error.message}`)
    } finally {
      setIsGenerating(false)
      setGenerationProgress(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Generation Mode Selector */}
      <div className="bg-gray-50 p-4 rounded-lg border">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Intelligence-Driven Generation</h4>
        
        {/* Mode Selection */}
        <div className="space-y-3">
          <div>
            <label className="form-label">Generation Mode</label>
            <select
              value={generationMode}
              onChange={(e) => setGenerationMode(e.target.value as any)}
              className="input input-sm"
              disabled={isGenerating}
            >
              <option value="single">Single Card (Current Blueprint)</option>
              <option value="batch">Batch Generate (All Missing Cards)</option>
              <option value="sequential">Sequential (Dependency-Aware)</option>
            </select>
          </div>

          <div>
            <label className="form-label">Intelligence Context Depth</label>
            <select
              value={contextDepth}
              onChange={(e) => setContextDepth(e.target.value as any)}
              className="input input-sm"
              disabled={isGenerating}
            >
              <option value="minimal">Minimal (Core intelligence only)</option>
              <option value="standard">Standard (Comprehensive intelligence)</option>
              <option value="comprehensive">Comprehensive (Full context + MCP research)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Generation Progress */}
      {generationProgress && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-4 h-4 text-blue-600 animate-pulse" />
            <span className="text-sm font-medium text-blue-900">
              Generating {generationProgress.currentBlueprint}...
            </span>
          </div>
          
          <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(generationProgress.currentStep / generationProgress.totalSteps) * 100}%` }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-blue-700">
            <span>Step {generationProgress.currentStep} of {generationProgress.totalSteps}</span>
            <span>~{Math.round(generationProgress.estimatedTimeRemaining / 60)}min remaining</span>
          </div>
        </div>
      )}

      {/* Generation Buttons */}
      <div className="flex space-x-2">
        {generationMode === 'single' && (
          <button
            onClick={handleSingleGeneration}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate with Intelligence</span>
              </>
            )}
          </button>
        )}

        {(generationMode === 'batch' || generationMode === 'sequential') && (
          <button
            onClick={handleBatchGeneration}
            disabled={isGenerating}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Generating Sequence...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Generate Strategy Sequence</span>
              </>
            )}
          </button>
        )}

        {/* Intelligence Bank Status */}
        <button
          className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors"
          title="View Intelligence Bank Status"
        >
          <Database className="w-4 h-4" />
          <span>Intelligence Bank</span>
        </button>
      </div>

      {/* Generation Info */}
      <div className="text-xs text-gray-600 space-y-1">
        <p>
          <strong>Intelligence-Driven Generation</strong> uses your Intelligence Bank to provide market insights, 
          competitive analysis, and strategic context for more relevant and informed card generation.
        </p>
        
        {generationMode === 'batch' && (
          <p className="text-amber-600">
            <strong>Batch Mode:</strong> Generates multiple cards in dependency-aware sequence. 
            This may take 15-30 minutes depending on the number of missing blueprints.
          </p>
        )}
        
        {contextDepth === 'comprehensive' && (
          <p className="text-blue-600">
            <strong>Comprehensive Mode:</strong> Includes additional MCP research calls for enhanced context. 
            This provides the highest quality but takes longer.
          </p>
        )}
      </div>
    </div>
  )
}

/**
 * Simple generation button for individual blueprint pages
 */
export function QuickIntelligenceGeneration({ 
  strategyId, 
  blueprintType, 
  existingCards, 
  onCardGenerated 
}: Omit<IntelligenceGenerationControllerProps, 'onGenerationComplete'>) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleQuickGeneration = async () => {
    setIsGenerating(true)
    
    try {
      const request: MCPGenerationRequest = {
        blueprintType,
        strategyId,
        intelligenceContext: await intelligenceMCPSequencer['getIntelligenceContext'](strategyId),
        existingCards,
        generationMode: 'single',
        contextDepth: 'standard'
      }

      const sequence = await intelligenceMCPSequencer.generateIntelligenceDrivenStrategy(request)
      const step = sequence.steps.find(s => s.blueprintType === blueprintType)
      
      if (!step) {
        throw new Error(`No generation configuration found for ${blueprintType}`)
      }

      const generatedCard = await intelligenceMCPSequencer.executeGenerationStep(
        step,
        request.intelligenceContext,
        existingCards
      )

      onCardGenerated(generatedCard)
      
    } catch (error) {
      console.error('Quick generation failed:', error)
      alert(`Generation failed: ${error.message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <button
      onClick={handleQuickGeneration}
      disabled={isGenerating}
      className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
    >
      {isGenerating ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>Generating...</span>
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4" />
          <span>AI Generate</span>
        </>
      )}
    </button>
  )
}
