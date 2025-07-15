'use client'

import React from 'react'
import { CardData } from '@/types/card'
import MagazineStyleMasterCard from '@/components/cards/MagazineStyleMasterCard'

interface IntelligenceCardPreviewV2Props {
  card: CardData
  onClick: () => void
  isSelected?: boolean
  onSelect?: (e: React.MouseEvent) => void
  viewDensity?: 'compact' | 'comfortable' | 'expanded'
}

export default function IntelligenceCardPreviewV2({
  card,
  onClick,
  isSelected = false,
  onSelect,
  viewDensity = 'comfortable'
}: IntelligenceCardPreviewV2Props) {
  
  // Wrap the card in a preview container
  return (
    <div 
      className={`
        intelligence-card-preview-wrapper
        transition-all duration-200 cursor-pointer
        ${isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
        ${viewDensity === 'compact' ? 'max-h-[200px]' : viewDensity === 'expanded' ? 'max-h-none' : 'max-h-[280px]'}
        overflow-hidden relative group
      `}
      onClick={(e) => {
        e.preventDefault()
        onClick()
      }}
    >
      <MagazineStyleMasterCard
        cardData={card}
        onUpdate={async () => {}} // No-op in preview
        onDelete={() => {}} // No-op in preview
        onDuplicate={() => {}} // No-op in preview
        onAIEnhance={() => {}} // No-op in preview
        isSelected={isSelected}
        onSelect={onSelect}
        forceEnhanced={false}
      />
      
      {/* Gradient overlay at bottom for truncated content */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      
      {/* Click to expand overlay */}
      <div className="absolute inset-0 bg-transparent group-hover:bg-black group-hover:bg-opacity-5 transition-colors pointer-events-none" />
    </div>
  )
}