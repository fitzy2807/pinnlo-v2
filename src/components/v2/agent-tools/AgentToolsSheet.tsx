'use client'

import React, { useState, useEffect } from 'react'
import { 
  Sheet, 
  SheetContent
} from '@/components/ui/sheet'
import { 
  Plus, 
  X
} from 'lucide-react'
import { CardData } from '@/types/card'
import { AgentTool } from './types/agentTools'

// Import tools
import CardCreatorTool from './tools/CardCreatorTool'

interface AgentToolsSheetProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedHub: string
  selectedSection: string
  selectedCard: CardData | null
  activeTool?: string | null
}

// Single Card Creator tool
const CARD_CREATOR_TOOL: AgentTool = {
  id: 'card-creator',
  name: 'Card Creator',
  description: 'Generate new cards using AI with contextual information from your existing strategy',
  icon: Plus,
  color: 'blue',
  category: 'content',
  component: CardCreatorTool
}

// Collapsible Card Creator Box
interface CardCreatorBoxProps {
  onOpenCreator: () => void
}

function CardCreatorBox({ onOpenCreator }: CardCreatorBoxProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm">
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <Plus className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-gray-900">Card Creator</span>
        </div>
        <div className="text-gray-400">
          {isExpanded ? '▲' : '▼'}
        </div>
      </button>

      {/* Expandable Content */}
      <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-48' : 'max-h-0'}`}>
        <div className="px-4 pb-4 border-t border-gray-100">
          <p className="text-sm text-gray-600 mb-4 mt-3">
            {CARD_CREATOR_TOOL.description}
          </p>
          <button
            onClick={onOpenCreator}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Open Card Creator
          </button>
        </div>
      </div>
    </div>
  )
}

// True Overlay Component (no backdrop)
interface OverlaySliderProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

function OverlaySlider({ isOpen, onClose, children }: OverlaySliderProps) {
  return (
    <div
      className={`fixed top-0 right-0 h-full w-[600px] bg-white shadow-2xl z-50 transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Content */}
      <div className="h-full overflow-y-auto">
        {children}
      </div>
    </div>
  )
}

export default function AgentToolsSheet({
  isOpen,
  onOpenChange,
  selectedHub,
  selectedSection,
  selectedCard,
  activeTool: externalActiveTool
}: AgentToolsSheetProps) {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)

  const handleOpenCreator = () => {
    setIsOverlayOpen(true)
  }

  const handleCloseCreator = () => {
    setIsOverlayOpen(false)
  }

  const handleComplete = (result: any) => {
    console.log('Card Creator completed with result:', result)
    // TODO: Handle card creation results
    setIsOverlayOpen(false)
  }

  return (
    <>
      {/* Sheet for the collapsible box */}
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-[400px] p-6">
          <CardCreatorBox onOpenCreator={handleOpenCreator} />
        </SheetContent>
      </Sheet>

      {/* True overlay slider - no backdrop */}
      <OverlaySlider isOpen={isOverlayOpen} onClose={handleCloseCreator}>
        {CARD_CREATOR_TOOL.component && (
          <CARD_CREATOR_TOOL.component
            selectedHub={selectedHub}
            selectedSection={selectedSection}
            selectedCard={selectedCard}
            onClose={handleCloseCreator}
            onComplete={handleComplete}
          />
        )}
      </OverlaySlider>
    </>
  )
}