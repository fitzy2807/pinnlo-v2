'use client'

import React, { useState, useEffect } from 'react'
import { X, Sparkles, Edit, Save, XCircle } from 'lucide-react'
import { CardData } from '@/types/card'
import { toast } from 'react-hot-toast'
import { useEditModeGeneratorWithModal } from '@/hooks/useEditModeGeneratorWithModal'
import PRDCard from '@/components/development-bank-v2/PRDCard'
import TechnicalRequirementCard from '@/components/development-bank-v2/TechnicalRequirementCard'
import { getDevelopmentTheme } from './utils/developmentThemes'
import { getBlueprintConfig } from '@/components/blueprints/registry'
import { BlueprintFields } from '@/components/blueprints/BlueprintFields'
import { commitToTaskList, markTrdAsCommitted, triggerTaskListRefresh } from '@/utils/commitToTaskList'
import TaskList from '@/components/development-bank/TaskList'

interface DevelopmentCardModalProps {
  card: CardData | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (id: string, updates: Partial<CardData>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  currentStrategyId?: string
  onCommitToTasks?: (requirement: any) => Promise<void>
}

export default function DevelopmentCardModal({
  card,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  currentStrategyId,
  onCommitToTasks
}: DevelopmentCardModalProps) {
  const [isClosing, setIsClosing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState<Record<string, any>>({})
  const [editedTitle, setEditedTitle] = useState('')
  const [editedDescription, setEditedDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isCommitting, setIsCommitting] = useState(false)
  
  // Initialize edited data when card changes
  useEffect(() => {
    if (card) {
      setEditedData(card.card_data || {})
      setEditedTitle(card.title || '')
      setEditedDescription(card.description || '')
      setIsEditing(false)
    }
  }, [card])
  
  // Add AI generation hook with modal
  const { 
    isGenerating: aiGenerating, 
    progress: aiProgress, 
    error: generationError, 
    fields: generatedFields, 
    generate, 
    cancel 
  } = useEditModeGeneratorWithModal()
  
  // Handle close with animation
  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
      setIsEditing(false)
      setEditedData(card?.card_data || {})
      setEditedTitle(card?.title || '')
      setEditedDescription(card?.description || '')
    }, 300)
  }

  // Handle save changes
  const handleSave = async () => {
    if (!card) return
    
    setIsSaving(true)
    try {
      await onUpdate(card.id, { 
        title: editedTitle,
        description: editedDescription,
        card_data: editedData 
      })
      setIsEditing(false)
      toast.success('Changes saved successfully')
    } catch (error) {
      console.error('Failed to save changes:', error)
      toast.error('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle cancel changes
  const handleCancel = () => {
    setEditedData(card?.card_data || {})
    setEditedTitle(card?.title || '')
    setEditedDescription(card?.description || '')
    setIsEditing(false)
  }

  // Handle commit TRD to task list
  const handleCommitToTasks = async (trd: any) => {
    if (onCommitToTasks) {
      // Use the passed handler from parent component
      await onCommitToTasks(trd)
    } else {
      // Fallback to local implementation
      if (!card || !currentStrategyId) {
        toast.error('Missing required data for task list creation')
        return
      }

      setIsCommitting(true)
      try {
        console.log('🚀 MODAL: Starting TRD commit to task list')
        
        const result = await commitToTaskList({
          requirementId: card.id,
          requirementTitle: card.title,
          requirementCardData: card.card_data || {},
          strategyId: currentStrategyId,
          userId: card.created_by || 'unknown'
        })

        if (result.success && result.taskList && result.tasks) {
          // Mark TRD as committed
          await markTrdAsCommitted(card.id, card.card_data || {}, result)
          
          // Update the card data locally to reflect the committed state
          await onUpdate(card.id, {
            card_data: {
              ...card.card_data,
              implementationRoadmap: {
                ...card.card_data?.implementationRoadmap,
                committedToTasks: true,
                committedAt: new Date().toISOString(),
                taskListId: result.taskList.id,
                taskIds: result.tasks.map((task: any) => task.id),
                totalTasks: result.metadata?.totalTasks || 0,
                totalEffort: result.metadata?.totalEffort || 0
              }
            }
          })
          
          // Trigger task list refresh
          triggerTaskListRefresh(result)
          
          // Show success message
          toast.success(
            `Successfully created ${result.metadata?.totalTasks || 0} tasks! Switch to the Task Lists tab to see them.`,
            { duration: 5000 }
          )
          
          console.log('🎉 MODAL: TRD committed successfully!')
          console.log(`📋 MODAL: Created ${result.metadata?.totalTasks} tasks across ${result.metadata?.categories} categories`)
          
        } else {
          throw new Error(result.error || 'Failed to create task list')
        }
      } catch (error: any) {
        console.error('❌ MODAL: Error committing TRD to task list:', error)
        toast.error(`Error creating task list: ${error.message}`)
      } finally {
        setIsCommitting(false)
      }
    }
  }

  // Handle start editing
  const handleStartEdit = () => {
    setIsEditing(true)
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
                // PRD to Tasks conversion - different from TRD commit
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
              onCommitToTasks={handleCommitToTasks}
              isSelected={false}
              onSelect={() => {}}
            />
          </div>
        )
      
      case 'tech-stack':
        const techStackConfig = getBlueprintConfig('tech-stack')
        if (!techStackConfig) {
          return (
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Technology Stack</h3>
              <p className="text-red-600 mb-4">
                Error: Could not load tech stack configuration. Please check the blueprint registry.
              </p>
            </div>
          )
        }

        return (
          <div className="p-6">
            {/* Header with Edit/Save/Cancel buttons */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold text-black">Technology Stack</h3>
                <p className="text-gray-600 text-sm">
                  {isEditing 
                    ? "Edit your technology stack using the tag-based structure" 
                    : "Document your technology stack using the tag-based structure for easy scanning and management"
                  }
                </p>
              </div>
              <div className="flex gap-2">
                {!isEditing ? (
                  <button
                    onClick={handleStartEdit}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Card Title and Description */}
            <div className="mb-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Card Title</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                    placeholder="Enter tech stack name..."
                  />
                ) : (
                  <p className="text-black font-medium">{card.title || 'Untitled Tech Stack'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-black mb-2">Description</label>
                {isEditing ? (
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white resize-none"
                    placeholder="Enter description..."
                  />
                ) : (
                  <p className="text-black">{card.description || 'No description provided'}</p>
                )}
              </div>
            </div>

            {/* Blueprint Fields */}
            <div className="border-t pt-6">
              <h4 className="text-md font-semibold text-black mb-4">Technology Details</h4>
              <BlueprintFields
                cardType="tech-stack"
                cardData={isEditing ? editedData : (card.card_data || {})}
                isEditing={isEditing}
                onChange={(fieldId, value) => {
                  if (isEditing) {
                    setEditedData(prev => ({ ...prev, [fieldId]: value }))
                  }
                }}
              />
            </div>
          </div>
        )
      
      case 'task-list':
        return (
          <div className="max-h-[80vh] overflow-y-auto">
            <TaskList strategyId={currentStrategyId || card.strategy_id?.toString() || '0'} />
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