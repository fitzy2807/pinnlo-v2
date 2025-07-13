'use client'

import React, { useEffect } from 'react'
import { EnhancedMasterCard } from './EnhancedMasterCard'
import LegacyMasterCard from './LegacyMasterCard'
import { FeatureFlagErrorBoundary } from './FeatureFlagErrorBoundary'
import { getFeatureFlags, useFeatureFlags } from '@/lib/featureFlags'
import { CardData } from '@/types/card'
import { useAuth } from '@/providers/AuthProvider'

interface MasterCardProps {
  cardData: CardData
  onUpdate: (updatedCard: Partial<CardData>) => Promise<void>
  onDelete: () => void
  onDuplicate: () => void
  onAIEnhance: () => void
  isSelected?: boolean
  onSelect?: () => void
  availableCards?: Array<{ id: string; title: string; cardType: string }>
  forceEnhanced?: boolean
  forceLegacy?: boolean
}

function MasterCardInternal(props: MasterCardProps) {
  // Get user context for feature flags
  const { user } = useAuth()
  const userId = user?.id
  
  // Use feature flags hook for reactive updates
  const flags = useFeatureFlags(userId)
  
  // Add logging for debugging in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('MasterCard render:', {
        enhanced: flags.MASTERCARD_NEW_UI,
        forced: props.forceEnhanced || props.forceLegacy,
        userId,
        cardType: props.cardData.cardType,
        flags
      })
    }
  }, [flags, props.forceEnhanced, props.forceLegacy, userId, props.cardData.cardType])
  
  // Allow override via prop (useful for testing and gradual rollout)
  if (props.forceEnhanced) {
    return <EnhancedMasterCard {...props} />
  }
  
  if (props.forceLegacy) {
    return <LegacyMasterCard {...props} />
  }
  
  // 🚀 FULL ENABLEMENT - Enhanced UI for ALL card types
  if (flags.MASTERCARD_NEW_UI) {
    return <EnhancedMasterCard {...props} />
  }
  
  // Fallback to legacy (should rarely happen now)
  return <LegacyMasterCard {...props} />
}

export default function MasterCard(props: MasterCardProps) {
  return (
    <FeatureFlagErrorBoundary fallback={<LegacyMasterCard {...props} />}>
      <MasterCardInternal {...props} />
    </FeatureFlagErrorBoundary>
  )
}

// Export a utility component for development/testing
export function MasterCardDebug(props: MasterCardProps) {
  const [showEnhanced, setShowEnhanced] = React.useState(false)
  
  if (process.env.NODE_ENV !== 'development') {
    return <MasterCard {...props} />
  }
  
  return (
    <div>
      <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showEnhanced}
            onChange={(e) => setShowEnhanced(e.target.checked)}
          />
          Use Enhanced MasterCard (Dev Only)
        </label>
      </div>
      {showEnhanced ? (
        <EnhancedMasterCard {...props} />
      ) : (
        <LegacyMasterCard {...props} />
      )}
    </div>
  )
}