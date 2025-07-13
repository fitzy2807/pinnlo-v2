'use client'

import React, { useState, useEffect } from 'react'
import { 
  getFeatureFlags, 
  toggleFeature, 
  resetFeatureFlags,
  debugFeatureFlags,
  FEATURE_FLAGS,
  type FeatureFlags,
  type FeatureFlagKey
} from '@/lib/featureFlags'
import { useAuth } from '@/providers/AuthProvider'
import { Settings, ToggleLeft, ToggleRight, RefreshCw, Bug } from 'lucide-react'

export function FeatureFlagsAdmin() {
  const { user } = useAuth()
  const [flags, setFlags] = useState<FeatureFlags>(() => getFeatureFlags(user?.id))
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Update flags when they change
    const handleUpdate = () => {
      setFlags(getFeatureFlags(user?.id))
    }
    
    window.addEventListener('featureFlagsUpdated', handleUpdate)
    
    return () => {
      window.removeEventListener('featureFlagsUpdated', handleUpdate)
    }
  }, [user?.id])

  const handleToggle = (flag: FeatureFlagKey) => {
    toggleFeature(flag, !flags[flag])
    setFlags(getFeatureFlags(user?.id))
  }

  const handleReset = () => {
    if (confirm('Reset all feature flags to defaults?')) {
      resetFeatureFlags()
    }
  }

  const handleDebug = () => {
    debugFeatureFlags(user?.id)
  }

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 p-3 bg-gray-900 text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors"
        title="Feature Flags"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Feature flags panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-96 bg-white rounded-lg shadow-xl border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Feature Flags</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Development only</p>
          </div>

          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {Object.entries(flags).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700">
                    {formatFlagName(key)}
                  </label>
                  <p className="text-xs text-gray-500">{getFlagDescription(key as FeatureFlagKey)}</p>
                </div>
                <button
                  onClick={() => handleToggle(key as FeatureFlagKey)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    value ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className="sr-only">{value ? 'Disable' : 'Enable'} {key}</span>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      value ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-200 space-y-2">
            <button
              onClick={handleDebug}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              <Bug className="w-4 h-4" />
              Debug Flags (Console)
            </button>
            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reset to Defaults
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function formatFlagName(flag: string): string {
  return flag
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
}

function getFlagDescription(flag: FeatureFlagKey): string {
  const descriptions: Record<FeatureFlagKey, string> = {
    MASTERCARD_NEW_UI: 'Enable the new MasterCard UI with auto-save and enhanced features',
    MASTERCARD_AUTO_SAVE: 'Automatically save changes as you type',
    ENABLE_UNDO_REDO: 'Enable undo/redo functionality with keyboard shortcuts',
    ENABLE_OFFLINE_MODE: 'Queue changes when offline and sync when connected',
    ENABLE_AI_ENHANCEMENT: 'Show AI enhancement options in cards',
    ENABLE_VALIDATION: 'Enable real-time field validation',
    ENABLE_KEYBOARD_SHORTCUTS: 'Enable keyboard shortcuts (Cmd+S, Cmd+Z, etc.)'
  }
  
  return descriptions[flag] || 'No description available'
}