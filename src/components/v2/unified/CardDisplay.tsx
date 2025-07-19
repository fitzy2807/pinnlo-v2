'use client'

import { useState } from 'react'
import { useStrategy } from '@/contexts/StrategyContext'
import { 
  Edit3, 
  Save, 
  X, 
  Star, 
  Clock, 
  User,
  Tag,
  Link,
  MoreVertical,
  Eye,
  Copy,
  Trash2,
  AlertCircle,
  CheckCircle,
  Info,
  Sparkles
} from 'lucide-react'
import { CardData } from '@/types/card'

interface CardDisplayProps {
  selectedCard: CardData | null
  onCardUpdate: (card: CardData) => void
  hubId: string
  sectionId: string
}

export default function CardDisplay({ 
  selectedCard, 
  onCardUpdate, 
  hubId, 
  sectionId 
}: CardDisplayProps) {
  const { currentStrategy } = useStrategy()
  const [isEditing, setIsEditing] = useState(false)
  const [editedCard, setEditedCard] = useState<CardData | null>(null)
  const [isAiEnhancing, setIsAiEnhancing] = useState(false)
  const [aiProgress, setAiProgress] = useState<{
    phase: string
    message: string
    progress: number
  } | null>(null)

  // Special home view
  if (hubId === 'home') {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to PINNLO</h3>
          <p className="text-gray-600">
            Select a hub from the navigation to start working with your strategic content.
          </p>
        </div>
      </div>
    )
  }

  if (!selectedCard) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Edit3 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No card selected</h3>
          <p className="text-gray-600">
            Select a card from the controller to view and edit its content.
          </p>
        </div>
      </div>
    )
  }

  const handleEdit = () => {
    setEditedCard({ ...selectedCard })
    setIsEditing(true)
  }

  const handleSave = () => {
    if (editedCard) {
      onCardUpdate(editedCard)
      setIsEditing(false)
      setEditedCard(null)
    }
  }

  const handleCancel = () => {
    setEditedCard(null)
    setIsEditing(false)
  }

  const handleAiEnhancement = async () => {
    if (!editedCard || !currentStrategy) {
      setAiProgress({ 
        phase: 'error', 
        message: 'No card or strategy available for enhancement', 
        progress: 0 
      })
      return
    }

    // Validate required fields
    if (!editedCard.id || !editedCard.cardType || !editedCard.title) {
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
        cardId: editedCard.id,
        blueprintType: editedCard.cardType,
        cardTitle: editedCard.title,
        strategyId: currentStrategy.id,
        existingFields: editedCard
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
                    const enhancedData = { ...editedCard, ...data.fields }
                    setEditedCard(enhancedData)
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

  const handleFieldChange = (field: string, value: any) => {
    if (editedCard) {
      setEditedCard({
        ...editedCard,
        [field]: value
      })
    }
  }

  const currentCard = isEditing ? editedCard : selectedCard

  if (!currentCard) return null

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'High': return 'bg-green-100 text-green-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Low': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const renderField = (label: string, field: string, type: 'text' | 'textarea' | 'select' = 'text', options?: string[]) => {
    const value = currentCard[field as keyof CardData] || ''
    
    if (isEditing) {
      if (type === 'textarea') {
        return (
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-700">{label}</label>
            <textarea
              value={value as string}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
              rows={3}
            />
          </div>
        )
      } else if (type === 'select' && options) {
        return (
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-700">{label}</label>
            <select
              value={value as string}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              {options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        )
      } else {
        return (
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-700">{label}</label>
            <input
              type="text"
              value={value as string}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        )
      }
    } else {
      return (
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-700">{label}</label>
          <div className="text-sm text-gray-900 leading-relaxed">
            {value || <span className="text-gray-500 italic">No {label.toLowerCase()} provided</span>}
          </div>
        </div>
      )
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h1 className="text-base font-semibold text-gray-900 leading-tight">
                {currentCard.title}
              </h1>
              {selectedCard.group_ids && selectedCard.group_ids.includes('pinned') && (
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
              )}
            </div>
            <div className="flex items-center space-x-3 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>Updated {new Date(currentCard.lastModified).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>{currentCard.creator}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(currentCard.priority)}`}>
              {currentCard.priority}
            </span>
            <span className={`px-2 py-1 text-xs rounded-full ${getConfidenceColor(currentCard.confidenceLevel)}`}>
              {currentCard.confidenceLevel}
            </span>
            
            {/* Action Icons */}
            <div className="flex items-center space-x-0.5 ml-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="p-1 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                    title="Save changes"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleAiEnhancement}
                    disabled={isAiEnhancing || !editedCard}
                    className="p-1 text-purple-600 hover:bg-purple-50 rounded-md transition-colors disabled:text-gray-300 disabled:cursor-not-allowed"
                    title={isAiEnhancing ? 'Enhancing with AI...' : 'Enhance with AI'}
                  >
                    <Sparkles className={`w-4 h-4 ${isAiEnhancing ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleEdit}
                    className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Edit card"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      // Handle info action
                    }}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Card info"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      // Handle duplicate action
                    }}
                    className="p-1 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                    title="Duplicate card"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Progress Indicator */}
      {aiProgress && (
        <div className={`px-4 py-3 border-b ${
          aiProgress.phase === 'error' 
            ? 'bg-red-50 border-red-200' 
            : aiProgress.phase === 'complete'
            ? 'bg-green-50 border-green-200'
            : 'bg-purple-50 border-purple-200'
        }`}>
          <div className="flex items-center space-x-3">
            {aiProgress.phase === 'error' ? (
              <X className="w-4 h-4 text-red-600" />
            ) : aiProgress.phase === 'complete' ? (
              <Sparkles className="w-4 h-4 text-green-600" />
            ) : (
              <Sparkles className="w-4 h-4 text-purple-600 animate-spin" />
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
                <div className={`w-full rounded-full h-1.5 ${
                  aiProgress.phase === 'complete' ? 'bg-green-200' : 'bg-purple-200'
                }`}>
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ease-out ${
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
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Basic Fields */}
        <div className="space-y-3">
          {renderField('Card Title', 'title')}
          {renderField('Description', 'description', 'textarea')}
          {renderField('Priority', 'priority', 'select', ['High', 'Medium', 'Low'])}
          {renderField('Confidence Level', 'confidenceLevel', 'select', ['High', 'Medium', 'Low'])}
        </div>

        {/* Strategic Context */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Strategic Context</h3>
          <div className="space-y-3">
            {renderField('Strategic Alignment', 'strategicAlignment', 'textarea')}
            {renderField('Priority Rationale', 'priorityRationale', 'textarea')}
            {renderField('Confidence Rationale', 'confidenceRationale', 'textarea')}
          </div>
        </div>

        {/* Hub-specific Fields */}
        {hubId === 'strategy' && sectionId === 'valuePropositions' && (
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Value Proposition Details</h3>
            <div className="space-y-3">
              {renderField('Customer Segment', 'customerSegment', 'textarea')}
              {renderField('Problem Solved', 'problemSolved', 'textarea')}
              {renderField('Gain Created', 'gainCreated', 'textarea')}
              {renderField('Key Differentiator', 'keyDifferentiator', 'textarea')}
              {renderField('Alternative Solutions', 'alternativeSolutions', 'textarea')}
            </div>
          </div>
        )}

        {/* Tags */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-xs font-medium text-gray-700 mb-2">Tags</h3>
          <div className="flex flex-wrap gap-1">
            {currentCard.tags && currentCard.tags.length > 0 ? (
              currentCard.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-gray-500 italic text-xs">No tags assigned</span>
            )}
          </div>
        </div>

        {/* Relationships */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-xs font-medium text-gray-700 mb-2">Related Cards</h3>
          <div className="space-y-1">
            {currentCard.relationships && currentCard.relationships.length > 0 ? (
              currentCard.relationships.map((rel: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md"
                >
                  <Link className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-900">{rel.title}</span>
                  <span className="text-xs text-gray-500">({rel.type})</span>
                </div>
              ))
            ) : (
              <span className="text-gray-500 italic text-xs">No related cards</span>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-xs font-medium text-gray-700 mb-2">Metadata</h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-500">Card Type:</span>
              <span className="ml-1 text-gray-900">{currentCard.cardType}</span>
            </div>
            <div>
              <span className="text-gray-500">Owner:</span>
              <span className="ml-1 text-gray-900">{currentCard.owner}</span>
            </div>
            <div>
              <span className="text-gray-500">Created:</span>
              <span className="ml-1 text-gray-900">
                {new Date(currentCard.createdDate).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Last Modified:</span>
              <span className="ml-1 text-gray-900">
                {new Date(currentCard.lastModified).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}