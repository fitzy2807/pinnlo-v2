'use client'

import { useState, useEffect } from 'react'
import { 
  Edit3, 
  Trash2, 
  Pin, 
  Copy, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Calendar,
  User,
  Tag,
  Link2,
  Target,
  Hash,
  AlertTriangle,
  TrendingUp
} from 'lucide-react'
import TagEditor from './editors/TagEditor'
import RelationshipEditor from './editors/RelationshipEditor'
import { BlueprintFields } from '../blueprints/BlueprintFields'
import { CardData, Relationship } from '@/types/card'
import { supabase } from '@/lib/supabase'

interface MasterCardProps {
  cardData: CardData
  onUpdate: (updatedCard: Partial<CardData>) => Promise<void> | void
  onDelete: () => void
  onDuplicate: () => void
  onAIEnhance: () => void
  availableCards?: Array<{ id: string; title: string; cardType: string }>
}

// Blueprint ID prefix mapping
const getBlueprintPrefix = (cardType: string): string => {
  const prefixMap: { [key: string]: string } = {
    'strategic-context': 'STR',
    'vision': 'VIS',
    'value-proposition': 'VAL',
    'personas': 'PER',
    'okrs': 'OKR',
    'customer-journey': 'CJO',
    'competitive-analysis': 'COM',
    'swot-analysis': 'SWO',
    'business-model': 'BUS',
    'go-to-market': 'GTM',
    'financial-projections': 'FIN',
    'risk-assessment': 'RSK',
    'roadmap': 'ROA',
    'kpis': 'KPI',
    'stakeholder-map': 'STK',
    'strategy-analytics': 'ANA',
    'workspace-settings': 'SET',
    'template': 'TPL'
  }
  
  return prefixMap[cardType] || 'GEN' // Default to 'GEN' for generic
}

// Generate formatted card ID
const getFormattedCardId = (cardData: CardData): string => {
  const prefix = getBlueprintPrefix(cardData.cardType)
  const numericId = cardData.id.replace(/\D/g, '') || '1' // Extract numbers or default to 1
  return `${prefix}-${numericId}`
}

export default function MasterCard({
  cardData,
  onUpdate,
  onDelete,
  onDuplicate,
  onAIEnhance,
  availableCards = []
}: MasterCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const [editData, setEditData] = useState(cardData)
  const [isEnhancing, setIsEnhancing] = useState(false)

  // Sync editData when cardData changes
  useEffect(() => {
    setEditData(cardData)
  }, [cardData])

  const formattedId = getFormattedCardId(cardData)

  const handleSave = async () => {
    console.log('🔄 Saving card:', editData)
    
    // Transform CardData to TemplateCard format
    const updateData = {
      title: editData.title,
      description: editData.description,
      priority: editData.priority?.toLowerCase() as 'high' | 'medium' | 'low',
      card_data: {
        ...editData,
        // Include all the CardData fields in card_data
        confidenceLevel: editData.confidenceLevel,
        priorityRationale: editData.priorityRationale,
        confidenceRationale: editData.confidenceRationale,
        tags: editData.tags,
        relationships: editData.relationships,
        strategicAlignment: editData.strategicAlignment
      }
    }
    
    await onUpdate(updateData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    console.log('❌ Canceling edit')
    setEditData(cardData)
    setIsEditing(false)
  }

  const handleExpand = () => {
    console.log('📖 Toggling expand:', !isExpanded)
    setIsExpanded(!isExpanded)
  }

  const handleEdit = () => {
    console.log('✏️ Starting edit mode')
    setIsEditing(true)
  }

  const handlePin = () => {
    console.log('📌 Toggling pin:', !isPinned)
    setIsPinned(!isPinned)
  }

  const handleDelete = () => {
    console.log('🗑️ Deleting card')
    onDelete()
  }

  const handleDuplicate = () => {
    console.log('📋 Duplicating card')
    onDuplicate()
  }

  const handleAIEnhance = async () => {
    console.log('🤖 AI Enhancing card')
    setIsEnhancing(true)
    
    try {
      // Get current user for context
      const { data: { user } } = await supabase.auth.getUser()
      
      // Identify fields that could be enhanced (empty or short fields)
      const fieldsToEnhance = getEnhanceableFields(editData)
      
      if (fieldsToEnhance.length === 0) {
        console.log('No fields identified for enhancement')
        setIsEnhancing(false)
        return
      }
      
      console.log('Fields to enhance:', fieldsToEnhance)
      
      // Prepare context from existing data
      const context = {
        companyName: extractCompanyName(editData),
        industry: extractIndustry(editData),
        targetMarket: extractTargetMarket(editData)
      }
      
      // Call the AI Enhancement Edge Function
      const { data, error } = await supabase.functions.invoke('enhance-field', {
        body: {
          blueprintType: cardData.cardType,
          currentData: editData,
          fieldsToEnhance,
          context
        }
      })
      
      if (error) {
        console.error('AI Enhancement error:', error)
        alert('AI Enhancement failed. Please try again.')
        return
      }
      
      if (data.success && data.enhancedData) {
        console.log('AI Enhancement successful:', data.enhancedData)
        
        // Merge enhanced data into editData
        const updatedData = { ...editData }
        
        for (const [field, value] of Object.entries(data.enhancedData)) {
          if (value) {
            // Handle array fields (convert comma-separated strings to arrays)
            if (['keyTrends', 'stakeholders', 'constraints', 'opportunities', 'keyResults', 'initiatives', 'behaviors'].includes(field)) {
              if (typeof value === 'string') {
                updatedData[field] = value.split(',').map(item => item.trim()).filter(item => item.length > 0)
              } else if (Array.isArray(value)) {
                updatedData[field] = value
              }
            } else if (typeof value === 'string' && value.trim()) {
              updatedData[field] = value
            }
          }
        }
        
        setEditData(updatedData)
        console.log('✨ Card enhanced with AI suggestions')
      }
      
    } catch (error) {
      console.error('AI Enhancement error:', error)
      alert('AI Enhancement failed. Please try again.')
    } finally {
      setIsEnhancing(false)
    }
  }

  const handleBlueprintFieldChange = (field: string, value: any) => {
    console.log(`🔧 Updating field ${field}:`, value)
    setEditData(prev => ({
      ...prev,
      [field]: value
    }))
  }

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className={`card transition-all duration-200 group ${isPinned ? 'ring-2 ring-yellow-400' : ''}`}>
      {/* Card Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          {/* Card ID with Blueprint Prefix - Only show when expanded */}
          {isExpanded && (
            <div className="flex items-center space-x-1 mb-2">
              <Hash size={10} className="text-gray-400" />
              <span className="text-xs text-gray-500 font-mono font-semibold">{formattedId}</span>
              {isPinned && <Pin size={12} className="text-yellow-500 flex-shrink-0 ml-2" />}
            </div>
          )}
          
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">
              {cardData.title}
            </h3>
            {/* Show pin indicator when collapsed */}
            {isPinned && !isExpanded && <Pin size={12} className="text-yellow-500 flex-shrink-0" />}
          </div>

          {/* Description - Moved directly under title */}
          <div className="mb-3">
            <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
              {cardData.description || 'No description provided'}
            </p>
          </div>
          
          {/* Priority and Confidence with Labels */}
          <div className="flex items-center space-x-4 mb-2">
            <div className="flex items-center space-x-1">
              <AlertTriangle size={10} className="text-gray-400" />
              <span className="text-xs text-gray-500">Priority:</span>
              <span className={`badge text-xs px-2 py-0.5 rounded-full ${getPriorityColor(cardData.priority)}`}>
                {cardData.priority}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <TrendingUp size={10} className="text-gray-400" />
              <span className="text-xs text-gray-500">Confidence:</span>
              <span className={`badge text-xs px-2 py-0.5 rounded-full ${getConfidenceColor(cardData.confidenceLevel)}`}>
                {cardData.confidenceLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons - Always Visible */}
        <div className="flex items-center space-x-1 ml-2">
          <button
            onClick={handleExpand}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-500 hover:text-gray-700"
            title={isExpanded ? 'Collapse' : 'Expand'}
            type="button"
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          
          <button
            onClick={handlePin}
            className={`p-1.5 hover:bg-gray-100 rounded transition-colors ${isPinned ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-gray-600'}`}
            title={isPinned ? 'Unpin' : 'Pin'}
            type="button"
          >
            <Pin size={14} />
          </button>

          <button
            onClick={handleEdit}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-400 hover:text-blue-600"
            title="Edit Card"
            type="button"
          >
            <Edit3 size={14} />
          </button>

          <button
            onClick={handleDuplicate}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-400 hover:text-green-600"
            title="Duplicate Card"
            type="button"
          >
            <Copy size={14} />
          </button>

          <button
            onClick={handleDelete}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-400 hover:text-red-600"
            title="Delete Card"
            type="button"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* PINNLO AI Button - Only shows in Edit Mode */}
      {isEditing && (
        <div className="mb-4">
          <button
            onClick={handleAIEnhance}
            disabled={isEnhancing}
            className="flex items-center space-x-2 px-4 py-2 text-xs font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-md transition-colors"
            type="button"
          >
            <Sparkles size={14} className={isEnhancing ? 'animate-spin' : ''} />
            <span>{isEnhancing ? 'Enhancing...' : 'PINNLO AI'}</span>
          </button>
        </div>
      )}

      {/* Collapsed Content */}
      {!isExpanded && (
        <div className="space-y-3">
          {/* Tags Section - Only show in collapsed if tags exist */}
          {cardData.tags && cardData.tags.length > 0 && (
            <div className="bg-blue-50 p-2 rounded-md border-l-2 border-blue-200">
              <div className="flex flex-wrap gap-1">
                {cardData.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
                {cardData.tags.length > 3 && (
                  <span className="text-xs text-blue-600">+{cardData.tags.length - 3} more</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Expanded Content - NEW ORDER: Strategic Alignment → Relationships → Assessment → Tags → Blueprint Fields */}
      {isExpanded && !isEditing && (
        <div className="space-y-4">
          {/* 1. Strategic Alignment Section */}
          {cardData.strategicAlignment && (
            <div className="bg-green-50 p-3 rounded-md border-l-3 border-green-300">
              <div className="flex items-center space-x-1 mb-2">
                <Target size={12} className="text-green-600" />
                <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Strategic Alignment</span>
              </div>
              <p className="text-xs text-green-700 leading-relaxed">
                {cardData.strategicAlignment}
              </p>
            </div>
          )}

          {/* 2. Relationships Section */}
          {cardData.relationships && cardData.relationships.length > 0 && (
            <div className="bg-purple-50 p-3 rounded-md border-l-3 border-purple-300">
              <div className="flex items-center space-x-1 mb-2">
                <Link2 size={12} className="text-purple-600" />
                <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Relationships</span>
              </div>
              <div className="space-y-1">
                {cardData.relationships.map((rel, index) => (
                  <div key={index} className="text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded">
                    <span className="font-medium">{rel.type}</span> {rel.title}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Assessment Section (Priority & Confidence) with Rationale */}
          <div className="bg-yellow-50 p-3 rounded-md border-l-3 border-yellow-300">
            <div className="flex items-center space-x-1 mb-3">
              <span className="text-xs font-semibold text-yellow-700 uppercase tracking-wide">Assessment</span>
            </div>
            
            <div className="space-y-3">
              {/* Priority */}
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <AlertTriangle size={12} className="text-yellow-600" />
                  <span className="text-xs text-yellow-700">Priority:</span>
                  <span className={`badge text-xs px-2 py-0.5 rounded-full ${getPriorityColor(cardData.priority)}`}>
                    {cardData.priority}
                  </span>
                </div>
                {cardData.priorityRationale && (
                  <p className="text-xs text-yellow-700 bg-yellow-100 p-2 rounded mt-1">
                    {cardData.priorityRationale}
                  </p>
                )}
              </div>

              {/* Confidence */}
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <TrendingUp size={12} className="text-yellow-600" />
                  <span className="text-xs text-yellow-700">Confidence:</span>
                  <span className={`badge text-xs px-2 py-0.5 rounded-full ${getConfidenceColor(cardData.confidenceLevel)}`}>
                    {cardData.confidenceLevel}
                  </span>
                </div>
                {cardData.confidenceRationale && (
                  <p className="text-xs text-yellow-700 bg-yellow-100 p-2 rounded mt-1">
                    {cardData.confidenceRationale}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 4. Tags Section */}
          {cardData.tags && cardData.tags.length > 0 && (
            <div className="bg-blue-50 p-3 rounded-md border-l-3 border-blue-300">
              <div className="flex items-center space-x-1 mb-2">
                <Tag size={12} className="text-blue-600" />
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Tags</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {cardData.tags.map((tag, index) => (
                  <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 5. Blueprint-Specific Fields Section */}
          <BlueprintFields
            cardType={cardData.cardType}
            cardData={cardData}
            isEditing={false}
            onChange={handleBlueprintFieldChange}
          />

          {/* Metadata Section */}
          <div className="bg-gray-50 p-3 rounded-md border-l-3 border-gray-300">
            <div className="flex items-center space-x-1 mb-2">
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Details</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <User size={10} />
                  <span>{cardData.creator}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar size={10} />
                  <span>{formatDate(cardData.lastModified)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Mode */}
      {isEditing && (
        <div className="space-y-4">
          {/* Header with ID */}
          <div className="bg-indigo-50 p-3 rounded-md border-l-3 border-indigo-300">
            <div className="flex items-center space-x-2">
              <Hash size={12} className="text-indigo-600" />
              <span className="text-xs text-indigo-700 font-mono font-semibold">{formattedId}</span>
              <span className="text-xs text-indigo-600">({cardData.cardType})</span>
            </div>
          </div>

          {/* Edit Form */}
          <div className="space-y-4">
            {/* Basic Info Section */}
            <div className="bg-gray-50 p-3 rounded-md border-l-3 border-gray-300 space-y-3">
              <div>
                <label className="form-label">Title</label>
                <input
                  type="text"
                  value={editData.title || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                  className="input input-sm text-black"
                />
              </div>

              <div>
                <label className="form-label">Description</label>
                <textarea
                  value={editData.description || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                  className="input input-sm text-black"
                  rows={3}
                />
              </div>
            </div>

            {/* Strategic Alignment Section */}
            <div className="bg-green-50 p-3 rounded-md border-l-3 border-green-300">
              <div>
                <label className="form-label">Strategic Alignment</label>
                <textarea
                  value={editData.strategicAlignment || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, strategicAlignment: e.target.value }))}
                  className="input input-sm text-black"
                  rows={2}
                  placeholder="How does this card align with your overall strategy?"
                />
              </div>
            </div>

            {/* Relationships Section */}
            <div className="bg-purple-50 p-3 rounded-md border-l-3 border-purple-300">
              <RelationshipEditor
                relationships={editData.relationships || []}
                onChange={(relationships) => setEditData(prev => ({ ...prev, relationships }))}
                availableCards={availableCards}
                currentCardId={cardData.id}
              />
            </div>

            {/* Priority & Confidence Section with Rationale */}
            <div className="bg-yellow-50 p-3 rounded-md border-l-3 border-yellow-300">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Priority</label>
                    <select
                      value={editData.priority || 'Medium'}
                      onChange={(e) => setEditData(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="input input-sm text-black"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Confidence</label>
                    <select
                      value={editData.confidenceLevel || 'Medium'}
                      onChange={(e) => setEditData(prev => ({ ...prev, confidenceLevel: e.target.value as any }))}
                      className="input input-sm text-black"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Priority Rationale</label>
                    <textarea
                      value={editData.priorityRationale || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, priorityRationale: e.target.value }))}
                      className="input input-sm text-black"
                      rows={2}
                      placeholder="Why is this priority level appropriate?"
                    />
                  </div>

                  <div>
                    <label className="form-label">Confidence Rationale</label>
                    <textarea
                      value={editData.confidenceRationale || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, confidenceRationale: e.target.value }))}
                      className="input input-sm text-black"
                      rows={2}
                      placeholder="Why is this confidence level appropriate?"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tags Section */}
            <div className="bg-blue-50 p-3 rounded-md border-l-3 border-blue-300">
              <TagEditor
                tags={editData.tags || []}
                onChange={(tags) => setEditData(prev => ({ ...prev, tags }))}
              />
            </div>

            {/* Blueprint-Specific Fields Section */}
            <BlueprintFields
              cardType={cardData.cardType}
              cardData={editData}
              isEditing={true}
              onChange={handleBlueprintFieldChange}
            />

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-200">
              <button
                onClick={handleCancel}
                className="btn btn-secondary btn-sm"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn btn-primary btn-sm"
                type="button"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper functions for AI Enhancement
function getEnhanceableFields(cardData: CardData): string[] {
  const commonFields = [
    'description',
    'strategicAlignment',
    'priorityRationale',
    'confidenceRationale'
  ]
  
  // Blueprint-specific fields based on card type
  const blueprintFields = getBlueprintSpecificFields(cardData.cardType)
  
  const allFields = [...commonFields, ...blueprintFields]
  
  return allFields.filter(field => {
    const value = cardData[field as keyof CardData]
    return !value || (typeof value === 'string' && value.length < 50) || (Array.isArray(value) && value.length === 0)
  })
}

function getBlueprintSpecificFields(cardType: string): string[] {
  switch (cardType) {
    case 'strategic-context':
      return ['marketContext', 'competitiveLandscape', 'keyTrends', 'stakeholders', 'constraints', 'opportunities']
    
    case 'vision':
      return ['visionStatement', 'missionStatement', 'coreValues', 'purpose']
    
    case 'value-proposition':
      return ['customerSegment', 'problemStatement', 'solution', 'uniqueValue', 'benefits']
    
    case 'okrs':
      return ['objective', 'keyResults', 'initiatives', 'metrics']
    
    case 'personas':
      return ['demographics', 'psychographics', 'painPoints', 'goals', 'behaviors']
    
    default:
      return ['implementation', 'dependencies', 'timeline', 'budget', 'resources', 'expectedOutcome', 'challenges']
  }
}

function extractCompanyName(cardData: CardData): string {
  // Try to extract company name from various fields
  const searchFields = [cardData.title, cardData.description, cardData.strategicAlignment]
  for (const field of searchFields) {
    if (typeof field === 'string' && field.includes('PINNLO')) return 'PINNLO'
    if (typeof field === 'string' && field.includes('Inc.')) {
      const match = field.match(/([A-Z][a-zA-Z\s]+)\s+Inc\./)
      if (match) return match[1].trim()
    }
  }
  return 'Company'
}

function extractIndustry(cardData: CardData): string {
  // Try to extract industry from card content
  const content = [cardData.title, cardData.description, cardData.strategicAlignment].join(' ').toLowerCase()
  
  if (content.includes('ai') || content.includes('artificial intelligence')) return 'AI/Technology'
  if (content.includes('software') || content.includes('saas')) return 'Software'
  if (content.includes('fintech') || content.includes('financial')) return 'Financial Technology'
  if (content.includes('health') || content.includes('medical')) return 'Healthcare'
  if (content.includes('ecommerce') || content.includes('retail')) return 'Retail/E-commerce'
  
  return 'Technology'
}

function extractTargetMarket(cardData: CardData): string {
  const content = [cardData.title, cardData.description, cardData.strategicAlignment].join(' ').toLowerCase()
  
  if (content.includes('founder') || content.includes('startup')) return 'Founders and Startups'
  if (content.includes('enterprise') || content.includes('corporation')) return 'Enterprise'
  if (content.includes('small business') || content.includes('smb')) return 'Small Business'
  if (content.includes('consumer') || content.includes('b2c')) return 'Consumers'
  
  return 'Business Leaders'
}