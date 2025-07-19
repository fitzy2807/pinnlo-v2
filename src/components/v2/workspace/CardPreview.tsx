'use client'

import { useState } from 'react'
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
  Mic
} from 'lucide-react'

interface CardPreviewProps {
  card: any
  selectedHub: string
  selectedSection: string
  onCardUpdate: (updatedCard: any) => void
}

export default function CardPreview({ 
  card, 
  selectedHub, 
  selectedSection,
  onCardUpdate 
}: CardPreviewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedCard, setEditedCard] = useState(card)

  if (!card) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Edit3 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No card selected</h3>
          <p className="text-gray-600">
            Select a card from the left to view and edit its content.
          </p>
        </div>
      </div>
    )
  }

  const handleEdit = () => {
    setEditedCard(card)
    setIsEditing(true)
  }

  const handleSave = () => {
    onCardUpdate(editedCard)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedCard(card)
    setIsEditing(false)
  }

  const handleFieldChange = (field: string, value: any) => {
    setEditedCard({
      ...editedCard,
      [field]: value
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const renderField = (label: string, field: string, type: 'text' | 'textarea' | 'select' = 'text', options?: string[]) => {
    const value = isEditing ? editedCard[field] : card[field]
    
    if (isEditing) {
      if (type === 'textarea') {
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <textarea
              value={value || ''}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
          </div>
        )
      } else if (type === 'select' && options) {
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <select
              value={value || ''}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        )
      } else {
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <input
              type="text"
              value={value || ''}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )
      }
    } else {
      return (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">{label}</label>
          <div className="text-gray-900">
            {value || <span className="text-gray-500 italic">No {label.toLowerCase()} provided</span>}
          </div>
        </div>
      )
    }
  }

  const renderBlueprintFields = () => {
    if (selectedHub === 'strategy') {
      if (selectedSection === 'valuePropositions') {
        return (
          <div className="space-y-6">
            {renderField('Customer Segment', 'customerSegment', 'textarea')}
            {renderField('Problem Solved', 'problemSolved', 'textarea')}
            {renderField('Gain Created', 'gainCreated', 'textarea')}
            {renderField('Key Differentiator', 'differentiator', 'textarea')}
            {renderField('Alternative Solutions', 'alternativeSolutions', 'textarea')}
          </div>
        )
      } else if (selectedSection === 'strategicContext') {
        return (
          <div className="space-y-6">
            {renderField('Strategic Context', 'strategicContext', 'textarea')}
            {renderField('Business Rationale', 'businessRationale', 'textarea')}
            {renderField('Market Opportunity', 'marketOpportunity', 'textarea')}
            {renderField('Success Metrics', 'successMetrics', 'textarea')}
          </div>
        )
      } else if (selectedSection === 'personas') {
        return (
          <div className="space-y-6">
            {renderField('Demographics', 'demographics', 'textarea')}
            {renderField('Pain Points', 'painPoints', 'textarea')}
            {renderField('Goals', 'goals', 'textarea')}
            {renderField('Behaviors', 'behaviors', 'textarea')}
          </div>
        )
      }
    } else if (selectedHub === 'intelligence') {
      return (
        <div className="space-y-6">
          {renderField('Key Findings', 'keyFindings', 'textarea')}
          {renderField('Data Sources', 'dataSources', 'textarea')}
          {renderField('Confidence Level', 'confidenceLevel', 'select', ['High', 'Medium', 'Low'])}
          {renderField('Action Items', 'actionItems', 'textarea')}
        </div>
      )
    }

    return null
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-xl font-semibold text-gray-900">
                {card.title}
              </h1>
              {card.pinned && (
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
              )}
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Updated {new Date(card.updatedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>{card.createdBy || 'Unknown'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 text-sm rounded-full ${getPriorityColor(card.priority)}`}>
              {card.priority}
            </span>
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    // TODO: Implement voice editor functionality
                    alert('Voice editing coming soon!')
                  }}
                  className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                  title="Voice editing"
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSave}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Save changes"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleEdit}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit card"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Basic Fields */}
        <div className="space-y-6">
          {renderField('Description', 'description', 'textarea')}
          {renderField('Priority', 'priority', 'select', ['High', 'Medium', 'Low'])}
        </div>

        {/* Blueprint-specific Fields */}
        {renderBlueprintFields()}

        {/* Metadata */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Metadata</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Card Type:</span>
              <span className="ml-2 text-gray-900">{card.cardType}</span>
            </div>
            <div>
              <span className="text-gray-500">Confidence:</span>
              <span className="ml-2 text-gray-900">
                {card.confidence ? Math.round(card.confidence * 100) + '%' : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Created:</span>
              <span className="ml-2 text-gray-900">
                {new Date(card.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Source:</span>
              <span className="ml-2 text-gray-900">{card.source || 'Manual'}</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        {card.tags && card.tags.length > 0 && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {card.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Relationships */}
        {card.relationships && card.relationships.length > 0 && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Related Cards</h3>
            <div className="space-y-2">
              {card.relationships.map((rel: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg"
                >
                  <Link className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-900">{rel.title}</span>
                  <span className="text-xs text-gray-500">({rel.type})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}