'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useAIProcessingModal, UseAIProcessingModalReturn } from '@/hooks/useAIProcessingModal'
import AIProcessingIndicator from '@/components/shared/AIProcessingIndicator'

// Create context
const AIProcessingContext = createContext<UseAIProcessingModalReturn | undefined>(undefined)

// Provider component
interface AIProcessingProviderProps {
  children: ReactNode
}

export function AIProcessingProvider({ children }: AIProcessingProviderProps) {
  const modalState = useAIProcessingModal()

  return (
    <AIProcessingContext.Provider value={modalState}>
      {children}
      
      {/* Render the processing indicator */}
      {modalState.isVisible && (
        <AIProcessingIndicator
          status={modalState.status}
          onClose={modalState.closeModal}
          defaultPosition={modalState.position}
          onPositionChange={modalState.updatePosition}
        />
      )}
    </AIProcessingContext.Provider>
  )
}

// Hook to use the context
export function useAIProcessing(): UseAIProcessingModalReturn {
  const context = useContext(AIProcessingContext)
  
  if (context === undefined) {
    throw new Error('useAIProcessing must be used within an AIProcessingProvider')
  }
  
  return context
}

// Helper hook for common AI processing patterns
export function useAIProcessingSession() {
  const aiProcessing = useAIProcessing()
  
  // Start a new processing session with automatic progress tracking
  const startSession = (title: string, totalSteps = 100) => {
    const sessionId = aiProcessing.startProcessing(title, 'Initializing...')
    let currentStep = 0
    
    const updateStep = (message?: string) => {
      currentStep++
      const progress = (currentStep / totalSteps) * 100
      aiProcessing.updateProgress(sessionId, progress, message)
    }
    
    const setProgress = (progress: number, message?: string) => {
      aiProcessing.updateProgress(sessionId, progress, message)
    }
    
    const complete = (message?: string) => {
      aiProcessing.completeProcessing(sessionId, message)
    }
    
    const error = (errorMessage: string) => {
      aiProcessing.errorProcessing(sessionId, errorMessage)
    }
    
    return {
      sessionId,
      updateStep,
      setProgress,
      complete,
      error
    }
  }
  
  return {
    startSession,
    closeModal: aiProcessing.closeModal,
    isVisible: aiProcessing.isVisible,
    currentSession: aiProcessing.currentSession
  }
}