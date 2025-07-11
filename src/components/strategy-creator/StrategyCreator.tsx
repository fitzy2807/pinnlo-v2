'use client'

import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import CreatorSidebar from './CreatorSidebar'
import UnifiedContextSelector from './steps/UnifiedContextSelector'
import ContextSummaryReview from './steps/ContextSummaryReview'
import TargetBlueprintSelector from './steps/TargetBlueprintSelector'
import GeneratedCardsReview from './steps/GeneratedCardsReview'

interface StrategyCreatorProps {
  isOpen: boolean
  onClose: () => void
}

interface SessionState {
  id: string | null
  strategyId: string | null
  strategyName: string | null
  currentStep: number
  completedSteps: number[]
  selectedBlueprintCards: any[]
  selectedIntelligenceCards: any[]
  selectedIntelligenceGroups: any[]
  intelligenceGroupCards: any[]
  contextSummary: string | null
  targetBlueprint: string | null
  generationOptions: {
    count: number
    style: 'comprehensive' | 'focused' | 'innovative'
  }
  generatedCards: any[]
}

export default function StrategyCreator({ isOpen, onClose }: StrategyCreatorProps) {
  const [session, setSession] = useState<SessionState>({
    id: null,
    strategyId: null,
    strategyName: null,
    currentStep: 1,
    completedSteps: [],
    selectedBlueprintCards: [],
    selectedIntelligenceCards: [],
    selectedIntelligenceGroups: [],
    intelligenceGroupCards: [],
    contextSummary: null,
    targetBlueprint: null,
    generationOptions: { count: 3, style: 'comprehensive' },
    generatedCards: []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load or create session when modal opens
  useEffect(() => {
    if (isOpen) {
      // Always start fresh when opening the modal
      // The first step will handle strategy selection
    }
  }, [isOpen])

  const loadOrCreateSession = async (strategyId: string) => {
    if (!strategyId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/strategy-creator/session?strategyId=${strategyId}`)
      if (!response.ok) {
        // If no session exists, create a new one
        const createResponse = await fetch('/api/strategy-creator/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ strategyId })
        })
        
        if (!createResponse.ok) throw new Error('Failed to create session')
        
        const { session: newSession } = await createResponse.json()
        
        setSession(prev => ({
          ...prev,
          id: newSession.id,
          strategyId: strategyId,
          currentStep: 1,
          completedSteps: [],
          selectedBlueprintCards: [],
          selectedIntelligenceCards: [],
          selectedIntelligenceGroups: [],
          intelligenceGroupCards: [],
          contextSummary: null,
          targetBlueprint: null,
          generationOptions: { count: 3, style: 'comprehensive' },
          generatedCards: []
        }))
        
        return
      }
      
      const { session: savedSession } = await response.json()
      
      setSession(prev => ({
        ...prev,
        id: savedSession.id,
        strategyId: strategyId,
        currentStep: savedSession.current_step || 1,
        completedSteps: savedSession.completed_steps || [],
        selectedBlueprintCards: savedSession.selected_blueprint_cards || [],
        selectedIntelligenceCards: savedSession.selected_intelligence_cards || [],
        selectedIntelligenceGroups: savedSession.selected_intelligence_groups || [],
        intelligenceGroupCards: savedSession.intelligence_group_cards || [],
        contextSummary: savedSession.context_summary || null,
        targetBlueprint: savedSession.target_blueprint_id || null,
        generationOptions: savedSession.generation_options || { count: 3, style: 'comprehensive' },
        generatedCards: savedSession.generated_cards || []
      }))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateSession = async (updates: Partial<SessionState>) => {
    if (!session.id) return
    
    try {
      await fetch('/api/strategy-creator/session', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          updates: {
            current_step: updates.currentStep,
            completed_steps: updates.completedSteps,
            selected_blueprint_cards: updates.selectedBlueprintCards,
            selected_intelligence_cards: updates.selectedIntelligenceCards,
            selected_intelligence_groups: updates.selectedIntelligenceGroups,
            intelligence_group_cards: updates.intelligenceGroupCards,
            context_summary: updates.contextSummary,
            target_blueprint_id: updates.targetBlueprint,
            generation_options: updates.generationOptions,
            generated_cards: updates.generatedCards
          }
        })
      })
    } catch (err) {
      console.error('Failed to update session:', err)
    }
  }

  const handleStepComplete = (stepNumber: number) => {
    const newCompletedSteps = [...new Set([...session.completedSteps, stepNumber])]
    const updates = {
      completedSteps: newCompletedSteps,
      currentStep: Math.min(stepNumber + 1, 4)
    }
    
    setSession(prev => ({ ...prev, ...updates }))
    updateSession(updates)
  }

  const handleStepChange = (stepNumber: number) => {
    if (stepNumber <= session.currentStep || session.completedSteps.includes(stepNumber - 1)) {
      setSession(prev => ({ ...prev, currentStep: stepNumber }))
      updateSession({ currentStep: stepNumber })
    }
  }

  const handleClose = () => {
    // Reset session state
    setSession({
      id: null,
      strategyId: null,
      strategyName: null,
      currentStep: 1,
      completedSteps: [],
      selectedBlueprintCards: [],
      selectedIntelligenceCards: [],
      selectedIntelligenceGroups: [],
      intelligenceGroupCards: [],
      contextSummary: null,
      targetBlueprint: null,
      generationOptions: { count: 3, style: 'comprehensive' },
      generatedCards: []
    })
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  const renderStep = () => {
    switch (session.currentStep) {
      case 1:
        return (
          <UnifiedContextSelector
            sessionState={session}
            onUpdateSession={(updates) => {
              setSession(prev => ({ ...prev, ...updates }))
              updateSession(updates)
              
              // If a strategy was selected and we don't have a session yet, load/create one
              if (updates.strategyId && !session.id) {
                loadOrCreateSession(updates.strategyId)
              }
            }}
            onNext={() => handleStepComplete(1)}
            onPrevious={() => {}}
          />
        )
      
      case 2:
        return (
          <ContextSummaryReview
            sessionId={session.id!}
            blueprintCards={session.selectedBlueprintCards}
            intelligenceCards={session.selectedIntelligenceCards}
            intelligenceGroups={session.selectedIntelligenceGroups}
            strategyName={session.strategyName!}
            contextSummary={session.contextSummary}
            onSummaryGenerated={(summary) => {
              setSession(prev => ({ ...prev, contextSummary: summary }))
              updateSession({ contextSummary: summary })
            }}
            onContinue={() => handleStepComplete(2)}
          />
        )
      
      case 3:
        return (
          <TargetBlueprintSelector
            contextSummary={session.contextSummary!}
            selectedBlueprint={session.targetBlueprint}
            generationOptions={session.generationOptions}
            onUpdate={(blueprint, options) => {
              setSession(prev => ({ 
                ...prev, 
                targetBlueprint: blueprint,
                generationOptions: options 
              }))
              updateSession({ 
                targetBlueprint: blueprint,
                generationOptions: options 
              })
            }}
            onContinue={() => handleStepComplete(3)}
          />
        )
      
      case 4:
        return (
          <GeneratedCardsReview
            sessionId={session.id!}
            contextSummary={session.contextSummary!}
            targetBlueprint={session.targetBlueprint!}
            generationOptions={session.generationOptions}
            generatedCards={session.generatedCards}
            onCardsGenerated={(cards) => {
              setSession(prev => ({ ...prev, generatedCards: cards }))
              updateSession({ generatedCards: cards })
            }}
            onComplete={handleClose}
          />
        )
      
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[90vh] flex overflow-hidden">
        {/* Sidebar */}
        <CreatorSidebar
          currentStep={session.currentStep}
          completedSteps={session.completedSteps}
          onStepClick={handleStepChange}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Strategy Creator</h2>
              <p className="text-sm text-gray-500 mt-1">
                AI-powered strategy card generation
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Step Content */}
          <div className="flex-1 overflow-y-auto">
            {error && (
              <div className="p-4 bg-red-50 border-b border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              renderStep()
            )}
          </div>
        </div>
      </div>
    </div>
  )
}