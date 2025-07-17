'use client'

import { useState, useCallback, useRef } from 'react'
import { AIProcessingStatus } from '@/components/shared/AIProcessingIndicator'

export interface AIProcessingSession {
  id: string
  title: string
  startTime: number
  endTime?: number
  status: AIProcessingStatus
}

export interface UseAIProcessingModalReturn {
  // Current status
  status: AIProcessingStatus
  isVisible: boolean
  
  // Control methods
  startProcessing: (title: string, initialMessage?: string) => string
  updateProgress: (sessionId: string, progress: number, message?: string) => void
  completeProcessing: (sessionId: string, message?: string) => void
  errorProcessing: (sessionId: string, error: string) => void
  closeModal: () => void
  
  // Position management
  position: { x: number; y: number }
  updatePosition: (position: { x: number; y: number }) => void
  
  // Session management
  currentSession: AIProcessingSession | null
  sessionHistory: AIProcessingSession[]
}

const DEFAULT_POSITION = { x: -140, y: -60 } // Bottom-right corner

export function useAIProcessingModal(): UseAIProcessingModalReturn {
  const [currentSession, setCurrentSession] = useState<AIProcessingSession | null>(null)
  const [sessionHistory, setSessionHistory] = useState<AIProcessingSession[]>([])
  const [position, setPosition] = useState(DEFAULT_POSITION)
  const [isVisible, setIsVisible] = useState(false)
  const sessionIdRef = useRef(0)

  // Generate unique session ID
  const generateSessionId = useCallback(() => {
    return `ai-session-${Date.now()}-${++sessionIdRef.current}`
  }, [])

  // Start new processing session
  const startProcessing = useCallback((title: string, initialMessage = 'Starting...') => {
    const sessionId = generateSessionId()
    const startTime = Date.now()
    
    const newSession: AIProcessingSession = {
      id: sessionId,
      title,
      startTime,
      status: {
        isActive: true,
        progress: 0,
        message: initialMessage,
        status: 'processing',
        startTime
      }
    }
    
    setCurrentSession(newSession)
    setIsVisible(true)
    
    return sessionId
  }, [generateSessionId])

  // Update progress for current session
  const updateProgress = useCallback((sessionId: string, progress: number, message?: string) => {
    setCurrentSession(prev => {
      if (!prev || prev.id !== sessionId) return prev
      
      return {
        ...prev,
        status: {
          ...prev.status,
          progress: Math.min(100, Math.max(0, progress)),
          message: message || prev.status.message
        }
      }
    })
  }, [])

  // Complete processing session
  const completeProcessing = useCallback((sessionId: string, message = 'Processing complete!') => {
    const endTime = Date.now()
    
    setCurrentSession(prev => {
      if (!prev || prev.id !== sessionId) return prev
      
      const completedSession = {
        ...prev,
        endTime,
        status: {
          ...prev.status,
          progress: 100,
          message,
          status: 'complete' as const,
          endTime
        }
      }
      
      // Add to history
      setSessionHistory(history => [completedSession, ...history.slice(0, 9)]) // Keep last 10
      
      return completedSession
    })
  }, [])

  // Error processing session
  const errorProcessing = useCallback((sessionId: string, error: string) => {
    const endTime = Date.now()
    
    setCurrentSession(prev => {
      if (!prev || prev.id !== sessionId) return prev
      
      const errorSession = {
        ...prev,
        endTime,
        status: {
          ...prev.status,
          message: error,
          status: 'error' as const,
          endTime
        }
      }
      
      // Add to history
      setSessionHistory(history => [errorSession, ...history.slice(0, 9)])
      
      return errorSession
    })
  }, [])

  // Close modal
  const closeModal = useCallback(() => {
    setIsVisible(false)
    // Clear current session after animation
    setTimeout(() => {
      setCurrentSession(null)
    }, 300)
  }, [])

  // Update position
  const updatePosition = useCallback((newPosition: { x: number; y: number }) => {
    setPosition(newPosition)
    
    // Save to localStorage for persistence
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ai-processing-modal-position', JSON.stringify(newPosition))
      } catch (error) {
        console.warn('Failed to save modal position:', error)
      }
    }
  }, [])

  // Load saved position on mount
  useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedPosition = localStorage.getItem('ai-processing-modal-position')
        if (savedPosition) {
          setPosition(JSON.parse(savedPosition))
        }
      } catch (error) {
        console.warn('Failed to load saved modal position:', error)
      }
    }
  })

  return {
    // Current status
    status: currentSession?.status || {
      isActive: false,
      progress: 0,
      message: '',
      status: 'idle'
    },
    isVisible,
    
    // Control methods
    startProcessing,
    updateProgress,
    completeProcessing,
    errorProcessing,
    closeModal,
    
    // Position management
    position,
    updatePosition,
    
    // Session management
    currentSession,
    sessionHistory
  }
}