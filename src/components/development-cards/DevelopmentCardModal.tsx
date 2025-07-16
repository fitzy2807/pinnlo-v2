'use client'

import React, { useState, useEffect } from 'react'
import { X, Sparkles } from 'lucide-react'
import { CardData } from '@/types/card'
import { toast } from 'react-hot-toast'
import { useEditModeGenerator } from '@/hooks/useEditModeGenerator'
import PRDCard from '@/components/development-bank-v2/PRDCard'
import TechnicalRequirementCard from '@/components/development-bank-v2/TechnicalRequirementCard'
import { getDevelopmentTheme } from './utils/developmentThemes'

interface DevelopmentCardModalProps {
  card: CardData | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (id: string, updates: Partial<CardData>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  currentStrategyId?: string
}

export default function DevelopmentCardModal({
  card,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  currentStrategyId
}: DevelopmentCardModalProps) {
  const [isClosing, setIsClosing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Add AI generation hook
  const { 
    isGenerating: aiGenerating, 
    progress: aiProgress, 
    error: generationError, 
    fields: generatedFields, 
    generate, 
    cancel 
  } = useEditModeGenerator()
  
  // Handle close with animation
  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
    }, 300)
  }
  
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }
    
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen])
  
  // Handle AI generation
  const handleAIGenerate = async () => {
    console.log('🚀 handleAIGenerate called for development card!')
    
    if (!card) {
      console.log('❌ No card provided - returning early')
      return
    }
    
    try {
      setIsGenerating(true)
      await generate({
        cardId: card.id,
        blueprintType: card.cardType,
        cardTitle: card.title || 'Untitled',
        strategyId: card.strategy_id || card.strategyId,
        existingFields: card.card_data || {}
      })
    } catch (error) {
      console.error('Generation failed:', error)
      toast.error('Failed to generate content')
    } finally {
      setIsGenerating(false)
    }
  }
  
  if (!isOpen || !card) return null
  
  const theme = getDevelopmentTheme(card.cardType || card.card_type || 'development')
  const cardType = card.cardType || card.card_type || 'development'
  
  // Route to appropriate component based on card type
  const renderCardContent = () => {
    switch (cardType) {
      case 'prd':
        return (
          <div className="max-h-[80vh] overflow-y-auto">
            <PRDCard
              prd={{
                id: card.id,
                title: card.title,
                description: card.description || '',
                card_data: card.card_data || {},
                created_at: card.created_at || card.createdDate,
                updated_at: card.updated_at || card.updatedDate
              }}
              onUpdate={async (id, updates) => {
                await onUpdate(id, updates)
                toast.success('PRD updated successfully!')
              }}
              onDelete={async (id) => {
                if (confirm('Are you sure you want to delete this PRD?')) {
                  await onDelete(id)
                  handleClose()
                  toast.success('PRD deleted successfully!')
                }
              }}
              onDuplicate={async (id) => {
                toast.info('Duplication available via Development Bank controls')
              }}
              onConvertToTRD={async (prd) => {
                toast.info('PRD to TRD conversion coming soon!')
              }}
              onConvertToTasks={async (prd) => {
                toast.info('PRD to Tasks conversion coming soon!')
              }}
              isSelected={false}
              onSelect={() => {}}
            />
          </div>
        )
      
      case 'technical-requirement':
      case 'technical-requirement-structured':
      case 'trd':
        return (
          <div className="max-h-[80vh] overflow-y-auto">
            <TechnicalRequirementCard
              requirement={{
                id: card.id,
                title: card.title,
                description: card.description || '',
                card_data: card.card_data || {},
                created_at: card.created_at || card.createdDate,
                updated_at: card.updated_at || card.updatedDate
              }}
              onUpdate={async (id, updates) => {
                await onUpdate(id, updates)
                toast.success('TRD updated successfully!')
              }}
              onDelete={async (id) => {
                if (confirm('Are you sure you want to delete this TRD?')) {
                  await onDelete(id)
                  handleClose()
                  toast.success('TRD deleted successfully!')
                }
              }}
              onDuplicate={async (id) => {
                toast.info('Duplication available via Development Bank controls')
              }}
              onCommitToTasks={async (trd) => {
                toast.info('TRD to Tasks conversion coming soon!')
              }}
              isSelected={false}
              onSelect={() => {}}
            />
          </div>
        )
      
      case 'tech-stack':
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Technology Stack</h3>
            <p className="text-gray-600 mb-4">
              Tech stack interface will be implemented here. Currently showing basic view.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stack Name</label>
                <input
                  type="text"
                  value={card.card_data?.stack_name || ''}
                  onChange={(e) => {
                    const updatedData = { ...card.card_data, stack_name: e.target.value }
                    onUpdate(card.id, { card_data: updatedData })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Name of the tech stack..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stack Type</label>
                <select
                  value={card.card_data?.stack_type || 'custom'}
                  onChange={(e) => {
                    const updatedData = { ...card.card_data, stack_type: e.target.value }
                    onUpdate(card.id, { card_data: updatedData })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ai-generated">AI Generated</option>
                  <option value="template">Template</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>
          </div>
        )
      
      default:
        return (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Development Asset</h3>
            <p className="text-gray-600 mb-4">
              Generic development card interface. Specific interfaces can be added for different card types.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={card.title || ''}
                  onChange={(e) => onUpdate(card.id, { title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={card.description || ''}
                  onChange={(e) => onUpdate(card.id, { description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )
    }
  }
  
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 z-40 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className={`
            bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden
            transition-all duration-300 transform
            ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div 
            className="px-6 py-4 border-b border-gray-200 flex items-center justify-between"
            style={{
              background: `linear-gradient(135deg, #ffffff 0%, ${theme.background} 100%)`
            }}
          >
            <div className="flex items-center gap-3">
              <theme.icon className={`w-5 h-5 ${theme.accent}`} />
              <h2 className="text-lg font-semibold text-gray-900">
                {card.title || 'Untitled Development Card'}
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              {/* AI Generate Button */}
              <button
                onClick={handleAIGenerate}
                disabled={isGenerating || aiGenerating}
                className={`
                  flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors
                  ${isGenerating || aiGenerating 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  }
                `}
              >
                <Sparkles className="w-4 h-4" />
                {isGenerating || aiGenerating ? 'Generating...' : 'AI Generate'}
              </button>
              
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* AI Generation Progress */}
          {(isGenerating || aiGenerating) && (
            <div className="px-6 py-2 bg-blue-50 border-b border-blue-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                <span className="text-sm text-blue-700">
                  {aiProgress || 'Generating content...'}
                </span>
              </div>
            </div>
          )}
          
          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            {renderCardContent()}
          </div>
        </div>
      </div>
    </>
  )
}