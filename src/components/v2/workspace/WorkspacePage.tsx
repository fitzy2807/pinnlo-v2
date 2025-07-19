'use client'

import { useState, useEffect } from 'react'
import { 
  Save, 
  Edit, 
  Copy,
  Trash2,
  Sparkles,
  Mic,
  X,
  Plus,
  Minus
} from 'lucide-react'
import { CardData } from '@/types/card'
import { BLUEPRINT_REGISTRY, getBlueprintConfig } from '@/components/blueprints/registry'
import { BlueprintField } from '@/components/blueprints/types'
import { useStrategy } from '@/contexts/StrategyContext'
import VoiceEditModal from '@/components/voice/VoiceEditModal'

interface WorkspacePageProps {
  page: CardData | null
  onUpdate: (updatedPage: Partial<CardData>) => Promise<void>
  onDelete: () => void
  onDuplicate: () => void
  onClose: () => void
}

function SafeValueRenderer({ value, className = '' }: { value: any, className?: string }) {
  if (value === null || value === undefined) {
    return <span className={`text-gray-400 italic ${className}`}>No value</span>
  }
  
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className={`text-gray-400 italic ${className}`}>No items</span>
      }
      return (
        <ul className={`list-disc list-inside space-y-1 ${className}`}>
          {value.map((item, index) => (
            <li key={index} className="text-gray-900">
              {String(item).trim() || <span className="text-gray-400 italic">Empty item</span>}
            </li>
          ))}
        </ul>
      )
    }
    return <span className={className}>{JSON.stringify(value)}</span>
  }
  
  return <span className={className}>{String(value)}</span>
}

export default function WorkspacePage({ page, onUpdate, onDelete, onDuplicate, onClose }: WorkspacePageProps) {
  const { currentStrategy } = useStrategy()
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<CardData | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [isAiEnhancing, setIsAiEnhancing] = useState(false)
  const [aiProgress, setAiProgress] = useState<{
    phase: string
    message: string
    progress: number
  } | null>(null)
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false)
  const [isVoiceProcessing, setIsVoiceProcessing] = useState(false)

  useEffect(() => {
    if (page) {
      setEditData(page)
      setHasChanges(false)
    }
  }, [page])

  if (!page) {
    return (
      <div className="h-full flex items-center justify-center bg-white font-sans">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-1">No page selected</h3>
          <p className="text-sm text-gray-600">
            Select a page from the preview to start editing
          </p>
        </div>
      </div>
    )
  }

  const blueprint = getBlueprintConfig(page.cardType)
  const blueprintRegistry = BLUEPRINT_REGISTRY[page.cardType]

  const handleSave = async () => {
    if (!editData) return
    
    try {
      setIsSaving(true)
      await onUpdate(editData)
      setIsEditing(false)
      setHasChanges(false)
    } catch (error) {
      console.error('Failed to save page:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditData(page)
    setIsEditing(false)
    setHasChanges(false)
  }

  const handleFieldUpdate = (field: string, value: any) => {
    if (!editData) return
    
    const updated = { ...editData, [field]: value }
    setEditData(updated)
    setHasChanges(true)
  }

  const handleArrayAdd = (fieldId: string) => {
    if (!editData) return
    const currentArray = Array.isArray(editData[fieldId]) ? editData[fieldId] : []
    handleFieldUpdate(fieldId, [...currentArray, ''])
  }

  const handleArrayRemove = (fieldId: string, index: number) => {
    if (!editData) return
    const currentArray = Array.isArray(editData[fieldId]) ? editData[fieldId] : []
    const newArray = currentArray.filter((_, i) => i !== index)
    handleFieldUpdate(fieldId, newArray)
  }

  const handleArrayItemUpdate = (fieldId: string, index: number, value: string) => {
    if (!editData) return
    const currentArray = Array.isArray(editData[fieldId]) ? editData[fieldId] : []
    const newArray = [...currentArray]
    newArray[index] = value
    handleFieldUpdate(fieldId, newArray)
  }

  const handleAiEnhancement = async () => {
    if (!editData || !currentStrategy) {
      setAiProgress({ 
        phase: 'error', 
        message: 'No card or strategy available for enhancement', 
        progress: 0 
      })
      return
    }

    // Validate required fields
    if (!editData.id || !editData.cardType || !editData.title) {
      setAiProgress({ 
        phase: 'error', 
        message: 'Card is missing required information for AI enhancement', 
        progress: 0 
      })
      return
    }
    
    try {
      setIsAiEnhancing(true)
      setAiProgress({ phase: 'starting', message: 'Starting AI enhancement...', progress: 0 })
      
      // Prepare request payload
      const payload = {
        cardId: editData.id,
        blueprintType: editData.cardType,
        cardTitle: editData.title,
        strategyId: currentStrategy.id,
        existingFields: editData
      }
      
      // Call the AI enhancement API with Server-Sent Events
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout
      
      const response = await fetch('/api/ai/edit-mode/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please refresh the page and try again.')
        } else if (response.status === 500) {
          throw new Error('Server error. Please try again later.')
        } else {
          throw new Error(`AI enhancement failed (${response.status}). Please try again.`)
        }
      }
      
      // Handle Server-Sent Events for progress updates
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      
      if (!reader) {
        throw new Error('Unable to read response stream')
      }

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')
          
          for (const line of lines) {
            if (line.startsWith('data: ') && line.length > 6) {
              try {
                const data = JSON.parse(line.slice(6))
                
                if (data.type === 'progress') {
                  setAiProgress({
                    phase: data.phase || 'processing',
                    message: data.message || 'Processing...',
                    progress: Math.min(Math.max(data.progress || 0, 0), 100)
                  })
                } else if (data.type === 'complete') {
                  // AI enhancement completed, merge the results
                  if (data.success && data.fields) {
                    const enhancedData = { ...editData, ...data.fields }
                    setEditData(enhancedData)
                    setHasChanges(true)
                    setAiProgress({ phase: 'complete', message: 'Enhancement completed!', progress: 100 })
                  } else {
                    throw new Error('AI enhancement completed but no valid data received')
                  }
                } else if (data.type === 'error') {
                  throw new Error(data.error || 'AI enhancement failed')
                }
              } catch (parseError) {
                console.error('Failed to parse SSE data:', parseError, 'Line:', line)
                // Don't throw here, just log and continue
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }
      
    } catch (error) {
      console.error('AI enhancement error:', error)
      
      let errorMessage = 'AI enhancement failed'
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'AI enhancement timed out. Please try again.'
        } else if (error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.'
        } else {
          errorMessage = error.message
        }
      }
      
      setAiProgress({ 
        phase: 'error', 
        message: errorMessage, 
        progress: 0 
      })
    } finally {
      setIsAiEnhancing(false)
      // Clear progress after a delay (longer for errors to let user read)
      setTimeout(() => {
        if (aiProgress?.phase !== 'error') {
          setAiProgress(null)
        }
      }, aiProgress?.phase === 'complete' ? 3000 : 5000)
    }
  }

  const handleVoiceEdit = async (transcript: string) => {
    if (!editData || !currentStrategy) {
      console.error('No edit data or strategy available for voice edit')
      return
    }

    try {
      setIsVoiceProcessing(true)
      setIsVoiceModalOpen(false)
      
      // Prepare request payload
      const payload = {
        cardId: editData.id,
        blueprintType: editData.cardType,
        cardTitle: editData.title,
        transcript: transcript,
        existingFields: editData
      }
      
      // Call the voice edit API with Server-Sent Events
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 120000) // 2 minute timeout
      
      const response = await fetch('/api/voice/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please refresh the page and try again.')
        } else if (response.status === 500) {
          throw new Error('Server error. Please try again later.')
        } else {
          throw new Error(`Voice edit failed (${response.status}). Please try again.`)
        }
      }
      
      // Handle Server-Sent Events for progress updates
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      
      if (!reader) {
        throw new Error('Unable to read response stream')
      }

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value)
          const lines = chunk.split('\\n')
          
          for (const line of lines) {
            if (line.startsWith('data: ') && line.length > 6) {
              try {
                const data = JSON.parse(line.slice(6))
                
                if (data.type === 'progress') {
                  console.log('=== VOICE EDIT PROGRESS ===', data)
                  setAiProgress({
                    phase: data.phase || 'processing',
                    message: data.message || 'Processing voice input...',
                    progress: Math.min(Math.max(data.progress || 0, 0), 100)
                  })
                } else if (data.type === 'complete') {
                  console.log('=== VOICE EDIT COMPLETE ===', data)
                  console.log('Data success:', data.success)
                  console.log('Data fields keys:', Object.keys(data.fields || {}))
                  console.log('Current editData keys:', Object.keys(editData || {}))
                  
                  // Voice edit completed, merge the results
                  if (data.success && data.fields) {
                    console.log('=== VOICE EDIT FIELD COMPARISON ===')
                    console.log('Original fields sample:', {
                      title: editData?.title,
                      description: editData?.description?.substring(0, 100) + '...',
                      priority: editData?.priority,
                      tags: editData?.tags
                    })
                    console.log('Returned fields sample:', {
                      title: data.fields.title,
                      description: data.fields.description?.substring(0, 100) + '...',
                      priority: data.fields.priority,
                      tags: data.fields.tags
                    })
                    console.log('Fields are identical?', {
                      title: editData?.title === data.fields.title,
                      description: editData?.description === data.fields.description,
                      priority: editData?.priority === data.fields.priority
                    })
                    
                    const updatedData = { ...editData, ...data.fields }
                    console.log('=== APPLYING VOICE EDIT UPDATES ===')
                    console.log('Updated data keys:', Object.keys(updatedData))
                    console.log('Sample updates:', {
                      title: updatedData.title,
                      description: updatedData.description?.substring(0, 100) + '...'
                    })
                    
                    setEditData(updatedData)
                    setHasChanges(true)
                    setAiProgress({ phase: 'complete', message: 'Voice edit completed!', progress: 100 })
                  } else {
                    console.error('Voice edit missing success or fields:', { success: data.success, hasFields: !!data.fields })
                    throw new Error('Voice edit completed but no valid data received')
                  }
                } else if (data.type === 'error') {
                  console.error('=== VOICE EDIT ERROR ===', data)
                  throw new Error(data.error || 'Voice edit failed')
                }
              } catch (parseError) {
                console.error('Failed to parse SSE data:', parseError, 'Line:', line)
                // Don't throw here, just log and continue
              }
            }
          }
        }
      } finally {
        reader.releaseLock()
      }
      
    } catch (error) {
      console.error('Voice edit error:', error)
      
      let errorMessage = 'Voice edit failed'
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Voice edit timed out. Please try again.'
        } else if (error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.'
        } else {
          errorMessage = error.message
        }
      }
      
      setAiProgress({ 
        phase: 'error', 
        message: errorMessage, 
        progress: 0 
      })
    } finally {
      setIsVoiceProcessing(false)
      // Clear progress after a delay (longer for errors to let user read)
      setTimeout(() => {
        if (aiProgress?.phase !== 'error') {
          setAiProgress(null)
        }
      }, aiProgress?.phase === 'complete' ? 3000 : 5000)
    }
  }

  return (
    <div className="h-full flex flex-col bg-white font-sans">
      {/* Header with Title and Action Buttons */}
      <div className="p-8 border-b border-gray-200">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
              {isEditing ? (
                <input
                  type="text"
                  value={editData?.title || ''}
                  onChange={(e) => handleFieldUpdate('title', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md text-3xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Page title"
                />
              ) : (
                page.title || 'Untitled Page'
              )}
            </h1>
            <p className="text-base text-gray-600">
              {blueprint?.name || page.cardType}
            </p>
          </div>
          
          <div className="flex items-center space-x-2 ml-6">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  title="Edit this page"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={onDuplicate}
                  className="p-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  title="Duplicate this page"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={onDelete}
                  className="p-2 border border-gray-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                  title="Delete this page"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !hasChanges}
                  className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  title={isSaving ? 'Saving changes...' : 'Save changes'}
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={handleAiEnhancement}
                  disabled={isAiEnhancing || !editData}
                  className="p-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  title={isAiEnhancing ? 'Enhancing with AI...' : 'Enhance with AI'}
                >
                  <Sparkles className={`w-4 h-4 ${isAiEnhancing ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => setIsVoiceModalOpen(true)}
                  disabled={isAiEnhancing || isVoiceProcessing || !editData}
                  className="p-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  title="Voice editing"
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  title="Cancel editing"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* AI Progress Indicator */}
      {aiProgress && (
        <div className={`px-8 py-4 border-b ${
          aiProgress.phase === 'error' 
            ? 'bg-red-50 border-red-200' 
            : aiProgress.phase === 'complete'
            ? 'bg-green-50 border-green-200'
            : 'bg-purple-50 border-purple-200'
        }`}>
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-3">
              {aiProgress.phase === 'error' ? (
                <X className="w-5 h-5 text-red-600" />
              ) : aiProgress.phase === 'complete' ? (
                <Sparkles className="w-5 h-5 text-green-600" />
              ) : (
                <Sparkles className="w-5 h-5 text-purple-600 animate-spin" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${
                    aiProgress.phase === 'error' 
                      ? 'text-red-900' 
                      : aiProgress.phase === 'complete'
                      ? 'text-green-900'
                      : 'text-purple-900'
                  }`}>{aiProgress.message}</span>
                  {aiProgress.phase !== 'error' && (
                    <span className={`text-xs ${
                      aiProgress.phase === 'complete' ? 'text-green-700' : 'text-purple-700'
                    }`}>{aiProgress.progress}%</span>
                  )}
                </div>
                {aiProgress.phase !== 'error' && (
                  <div className={`w-full rounded-full h-2 ${
                    aiProgress.phase === 'complete' ? 'bg-green-200' : 'bg-purple-200'
                  }`}>
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ease-out ${
                        aiProgress.phase === 'complete' ? 'bg-green-600' : 'bg-purple-600'
                      }`}
                      style={{ width: `${aiProgress.progress}%` }}
                    ></div>
                  </div>
                )}
              </div>
              {aiProgress.phase === 'error' && (
                <button
                  onClick={() => setAiProgress(null)}
                  className="p-1 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                  title="Dismiss error"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Blueprint Fields */}
          {blueprint?.fields?.map((field) => (
            <div key={field.id} className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">{field.name}</h3>
              
              {isEditing ? (
                <div>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={editData?.[field.id] || ''}
                      onChange={(e) => handleFieldUpdate(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full p-4 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={6}
                    />
                  ) : field.type === 'enum' ? (
                    <select
                      value={editData?.[field.id] || ''}
                      onChange={(e) => handleFieldUpdate(field.id, e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select {field.name}</option>
                      {field.options?.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : field.type === 'array' ? (
                    <div className="space-y-3">
                      {(() => {
                        const arrayValue = Array.isArray(editData?.[field.id]) ? editData[field.id] : []
                        return (
                          <>
                            {arrayValue.map((item: string, index: number) => (
                              <div key={index} className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={item || ''}
                                  onChange={(e) => handleArrayItemUpdate(field.id, index, e.target.value)}
                                  placeholder={`${field.name} item ${index + 1}`}
                                  className="flex-1 p-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleArrayRemove(field.id, index)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                  title="Remove item"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => handleArrayAdd(field.id)}
                              className="flex items-center space-x-2 p-3 text-blue-600 border border-blue-300 border-dashed rounded-md hover:bg-blue-50 transition-colors w-full justify-center"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Add {field.name}</span>
                            </button>
                          </>
                        )
                      })()}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={editData?.[field.id] || ''}
                      onChange={(e) => handleFieldUpdate(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full p-3 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}
                </div>
              ) : (
                <div className="prose prose-lg max-w-none">
                  <SafeValueRenderer 
                    value={page[field.id]} 
                    className="text-base text-gray-900 leading-relaxed"
                  />
                </div>
              )}
              
              {isEditing && field.description && (
                <p className="text-sm text-gray-500">{field.description}</p>
              )}
            </div>
          ))}

          {/* Tags */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">Tags</h3>
            <div className="prose prose-lg max-w-none">
              {page.tags?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {page.tags.map((tag: string, idx: number) => (
                    <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-gray-400 italic">No tags</span>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="space-y-3 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Metadata</h3>
            <div className="grid grid-cols-2 gap-6 text-base text-gray-600">
              <div>
                <span className="font-medium">Created:</span> {new Date(page.created_at || page.createdDate || '').toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Updated:</span> {new Date(page.updated_at || page.lastModified || '').toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Creator:</span> {page.creator || 'Unknown'}
              </div>
              <div>
                <span className="font-medium">ID:</span> {page.id}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Voice Edit Modal */}
      <VoiceEditModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onEditPage={handleVoiceEdit}
        isProcessing={isVoiceProcessing}
      />
    </div>
  )
}