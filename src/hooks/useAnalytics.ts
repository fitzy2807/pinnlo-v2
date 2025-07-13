import { useEffect, useCallback, useRef } from 'react'
import { useFeatureFlags } from '@/lib/featureFlags'
import { useAuth } from '@/providers/AuthProvider'

interface AnalyticsEvent {
  event: string
  properties?: Record<string, any>
  timestamp?: number
}

// Mock analytics service - replace with your actual analytics provider
const analytics = {
  track: (event: string, properties?: Record<string, any>) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', event, properties)
    }
    // In production, send to your analytics service
    // e.g., mixpanel.track(event, properties)
    // e.g., amplitude.track(event, properties)
    // e.g., segment.track(event, properties)
  },
  
  identify: (userId: string, traits?: Record<string, any>) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics] Identify:', userId, traits)
    }
    // In production, identify user
  }
}

// Hook for tracking feature adoption
export function useFeatureAdoptionTracking() {
  const { user } = useAuth()
  const flags = useFeatureFlags(user?.id)
  const trackedRef = useRef(false)
  
  useEffect(() => {
    if (!trackedRef.current && user?.id) {
      trackedRef.current = true
      
      // Track feature flag status
      analytics.track('feature_flags_loaded', {
        userId: user.id,
        version: flags.MASTERCARD_NEW_UI ? 'enhanced' : 'legacy',
        features: {
          autoSave: flags.MASTERCARD_AUTO_SAVE,
          undoRedo: flags.ENABLE_UNDO_REDO,
          offline: flags.ENABLE_OFFLINE_MODE,
          aiEnhancement: flags.ENABLE_AI_ENHANCEMENT,
          validation: flags.ENABLE_VALIDATION,
          keyboardShortcuts: flags.ENABLE_KEYBOARD_SHORTCUTS
        },
        timestamp: Date.now()
      })
    }
  }, [flags, user?.id])
}

// Hook for tracking card interactions
export function useCardAnalytics(cardType: string, cardId: string) {
  const { user } = useAuth()
  const interactionStartRef = useRef<number>(Date.now())
  
  // Track card view
  useEffect(() => {
    analytics.track('card_viewed', {
      userId: user?.id,
      cardType,
      cardId,
      timestamp: Date.now()
    })
    
    // Track time spent on card when component unmounts
    return () => {
      const timeSpent = Date.now() - interactionStartRef.current
      analytics.track('card_interaction_ended', {
        userId: user?.id,
        cardType,
        cardId,
        timeSpentMs: timeSpent,
        timestamp: Date.now()
      })
    }
  }, [cardType, cardId, user?.id])
  
  // Track specific actions
  const trackAction = useCallback((action: string, properties?: Record<string, any>) => {
    analytics.track(`card_${action}`, {
      userId: user?.id,
      cardType,
      cardId,
      ...properties,
      timestamp: Date.now()
    })
  }, [cardType, cardId, user?.id])
  
  return { trackAction }
}

// Hook for tracking performance metrics
export function usePerformanceTracking(componentName: string) {
  const renderStartRef = useRef<number>(Date.now())
  const renderCountRef = useRef<number>(0)
  
  useEffect(() => {
    renderCountRef.current++
    
    // Track render performance
    const renderTime = Date.now() - renderStartRef.current
    if (renderTime > 100) {
      console.warn(`[Performance] Slow render detected in ${componentName}: ${renderTime}ms`)
      
      analytics.track('slow_render_detected', {
        component: componentName,
        renderTimeMs: renderTime,
        renderCount: renderCountRef.current,
        timestamp: Date.now()
      })
    }
  })
  
  // Track save performance
  const trackSavePerformance = useCallback((startTime: number, success: boolean) => {
    const duration = Date.now() - startTime
    
    if (duration > 500) {
      console.warn(`[Performance] Slow save detected: ${duration}ms`)
    }
    
    analytics.track('save_performance', {
      component: componentName,
      durationMs: duration,
      success,
      slow: duration > 500,
      timestamp: Date.now()
    })
  }, [componentName])
  
  return { trackSavePerformance }
}

// Hook for tracking errors
export function useErrorTracking() {
  const trackError = useCallback((error: Error, context?: Record<string, any>) => {
    console.error('[Error]', error, context)
    
    analytics.track('error_occurred', {
      error: error.message,
      stack: error.stack,
      ...context,
      timestamp: Date.now()
    })
  }, [])
  
  return { trackError }
}

// Consolidated analytics hook
export function useAnalytics() {
  const featureAdoption = useFeatureAdoptionTracking()
  const { trackError } = useErrorTracking()
  
  const track = useCallback((event: string, properties?: Record<string, any>) => {
    analytics.track(event, properties)
  }, [])
  
  const identify = useCallback((userId: string, traits?: Record<string, any>) => {
    analytics.identify(userId, traits)
  }, [])
  
  return {
    track,
    identify,
    trackError
  }
}