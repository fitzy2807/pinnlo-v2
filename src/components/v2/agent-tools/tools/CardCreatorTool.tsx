'use client'

import React from 'react'
import { Plus } from 'lucide-react'
import AgentToolTemplate from '../AgentToolTemplate'
import { AgentToolProps } from '../types/agentTools'
import CardCreator from '@/components/shared/card-creator/CardCreator'
import { CardCreatorConfig } from '@/components/shared/card-creator/types'

export default function CardCreatorTool({ 
  selectedHub, 
  selectedSection, 
  selectedCard, 
  onClose, 
  onComplete 
}: AgentToolProps) {
  
  // Create card creator config based on current context
  const config: CardCreatorConfig = {
    mode: 'guided',
    targetSection: selectedSection,
    strategy: null, // This would be passed from parent
    sourceSections: ['strategy', 'intelligence', 'development'],
    enablePreview: true,
    autoSave: false
  }

  const handleCardsCreated = (cards: any[], metadata?: any) => {
    if (onComplete) {
      onComplete({
        type: 'cards',
        data: cards,
        metadata: {
          source: 'card-creator',
          timestamp: new Date().toISOString(),
          context: `${selectedHub}/${selectedSection}`,
          ...metadata
        }
      })
    }
    onClose()
  }

  return (
    <div className="h-full flex flex-col">
      {/* We'll directly embed the CardCreator since it already has its own UI */}
      <CardCreator
        config={config}
        onClose={onClose}
        onCardsCreated={handleCardsCreated}
      />
    </div>
  )
}