import { useState, useEffect } from 'react'

interface FeatureFlags {
  MASTERCARD_NEW_UI: boolean
  MASTERCARD_AUTO_SAVE: boolean
  ENABLE_UNDO_REDO: boolean
  ENABLE_OFFLINE_MODE: boolean
  ENABLE_AI_ENHANCEMENT: boolean
  ENABLE_VALIDATION: boolean
  ENABLE_KEYBOARD_SHORTCUTS: boolean
}

const DEFAULT_FLAGS: FeatureFlags = {
  MASTERCARD_NEW_UI: false, // Start with false, enable gradually
  MASTERCARD_AUTO_SAVE: true,
  ENABLE_UNDO_REDO: true,
  ENABLE_OFFLINE_MODE: true,
  ENABLE_AI_ENHANCEMENT: true,
  ENABLE_VALIDATION: true,
  ENABLE_KEYBOARD_SHORTCUTS: true
}

// Secure localStorage retrieval with validation
function getStoredFlags(): Partial<FeatureFlags> {
  if (typeof window === 'undefined') return {}
  
  try {
    const stored = localStorage.getItem('featureFlags')
    if (!stored) return {}
    
    const parsed = JSON.parse(stored)
    
    // Validate that parsed is an object
    if (typeof parsed !== 'object' || parsed === null) {
      console.warn('Invalid feature flags format in localStorage')
      return {}
    }
    
    // Validate structure and types
    const validated: Partial<FeatureFlags> = {}
    
    Object.keys(DEFAULT_FLAGS).forEach(key => {
      const typedKey = key as keyof FeatureFlags
      if (typedKey in parsed && typeof parsed[typedKey] === 'boolean') {
        validated[typedKey] = parsed[typedKey]
      }
    })
    
    return validated
  } catch (error) {
    console.warn('Failed to load feature flags from localStorage:', error)
    return {}
  }
}

// Get feature flags from various sources
export function getFeatureFlags(userId?: string): FeatureFlags {
  // 1. Check environment variables
  const envFlags: Partial<FeatureFlags> = {}
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.NEXT_PUBLIC_MASTERCARD_NEW_UI === 'true') {
      envFlags.MASTERCARD_NEW_UI = true
    }
    if (process.env.NEXT_PUBLIC_MASTERCARD_AUTO_SAVE === 'false') {
      envFlags.MASTERCARD_AUTO_SAVE = false
    }
    if (process.env.NEXT_PUBLIC_ENABLE_UNDO_REDO === 'false') {
      envFlags.ENABLE_UNDO_REDO = false
    }
    if (process.env.NEXT_PUBLIC_ENABLE_OFFLINE_MODE === 'false') {
      envFlags.ENABLE_OFFLINE_MODE = false
    }
  }
  
  // 2. Beta users list (add user IDs here for early access)
  const betaUsers = [
    'beta-user-1',
    'beta-user-2',
    'early-adopter-123'
  ]
  const isBetaUser = userId && betaUsers.includes(userId)
  
  // 3. A/B test groups (can be determined by user ID hash)
  const isInTestGroup = userId ? hashUserId(userId) % 100 < 10 : false // 10% test group
  
  // 4. Org-wide overrides (could be fetched from database)
  const orgOverrides: Partial<FeatureFlags> = {
    // Add org-specific overrides here
  }
  
  // 5. User preferences (stored in localStorage or database)
  const userPreferences: Partial<FeatureFlags> = getStoredFlags()
  
  // 6. URL parameters (for testing)
  const urlFlags: Partial<FeatureFlags> = {}
  if (typeof window !== 'undefined' && window.location) {
    const params = new URLSearchParams(window.location.search)
    if (params.get('mastercard_new_ui') === 'true') {
      urlFlags.MASTERCARD_NEW_UI = true
    }
    if (params.get('debug_features') === 'true') {
      // Enable all features in debug mode
      Object.keys(DEFAULT_FLAGS).forEach(key => {
        urlFlags[key as keyof FeatureFlags] = true
      })
    }
  }
  
  // Merge all sources with priority
  return {
    ...DEFAULT_FLAGS,
    ...orgOverrides,
    ...(isBetaUser ? { MASTERCARD_NEW_UI: true } : {}),
    ...(isInTestGroup ? { MASTERCARD_NEW_UI: true } : {}),
    ...envFlags,
    ...userPreferences,
    ...urlFlags // URL params have highest priority for testing
  }
}

// Helper to toggle features in development
export function toggleFeature(flag: keyof FeatureFlags, value: boolean) {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('featureFlags')
      const current = stored ? JSON.parse(stored) : {}
      const updated = { ...current, [flag]: value }
      localStorage.setItem('featureFlags', JSON.stringify(updated))
      
      // Trigger a custom event so components can react
      window.dispatchEvent(new CustomEvent('featureFlagsUpdated', { 
        detail: { flag, value } 
      }))
      
      return true
    } catch (error) {
      console.error('Failed to toggle feature flag:', error)
      return false
    }
  }
  return false
}

// Helper to reset all feature flags to defaults
export function resetFeatureFlags() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('featureFlags')
    window.location.reload()
  }
}

// Development helper to show current flags
export function debugFeatureFlags(userId?: string) {
  const flags = getFeatureFlags(userId)
  console.table(flags)
  return flags
}

// Simple hash function for user ID
function hashUserId(userId: string): number {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

// React hook for using feature flags
export function useFeatureFlags(userId?: string) {
  const [flags, setFlags] = useState(() => getFeatureFlags(userId))
  
  useEffect(() => {
    // Update flags when user ID changes
    setFlags(getFeatureFlags(userId))
    
    // Listen for flag updates
    const handleUpdate = () => {
      setFlags(getFeatureFlags(userId))
    }
    
    window.addEventListener('featureFlagsUpdated', handleUpdate)
    
    return () => {
      window.removeEventListener('featureFlagsUpdated', handleUpdate)
    }
  }, [userId])
  
  return flags
}

// Feature flag names as constants to avoid typos
export const FEATURE_FLAGS = {
  MASTERCARD_NEW_UI: 'MASTERCARD_NEW_UI',
  MASTERCARD_AUTO_SAVE: 'MASTERCARD_AUTO_SAVE',
  ENABLE_UNDO_REDO: 'ENABLE_UNDO_REDO',
  ENABLE_OFFLINE_MODE: 'ENABLE_OFFLINE_MODE',
  ENABLE_AI_ENHANCEMENT: 'ENABLE_AI_ENHANCEMENT',
  ENABLE_VALIDATION: 'ENABLE_VALIDATION',
  ENABLE_KEYBOARD_SHORTCUTS: 'ENABLE_KEYBOARD_SHORTCUTS'
} as const

// Export types
export type { FeatureFlags }
export type FeatureFlagKey = keyof FeatureFlags