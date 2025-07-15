'use client'

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { 
  Copy, Trash2, Sparkles, Pin, Hash, Calendar, User, 
  Tag, Shield, TrendingUp, ChevronDown, ChevronUp,
  Edit2, Check, X as XIcon
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { CardData } from '@/types/card'
import { getBlueprintConfig } from '@/components/blueprints/registry'
import { BlueprintField } from '@/components/blueprints/types'
import { 
  useValidation,
  useKeyboardShortcuts,
  ErrorBoundary,
  validators
} from '@/components/shared/cards'
import { useCardAnalytics, usePerformanceTracking } from '@/hooks/useAnalytics'
import styles from './EnhancedMasterCard.module.css'

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
  
  return prefixMap[cardType] || 'GEN'
}

// Generate formatted card ID
const getFormattedCardId = (cardData: CardData): string => {
  const prefix = getBlueprintPrefix(cardData.cardType)
  const numericId = cardData.id ? cardData.id.replace(/\D/g, '') : '1'
  return `${prefix}-${numericId || '1'}`
}

// Get category theme colors
const getCategoryTheme = (cardType: string) => {
  const themes: Record<string, any> = {
    'strategic': { background: '#fef3c7', dot: 'bg-yellow-500' },
    'vision': { background: '#ddd6fe', dot: 'bg-purple-500' },
    'customer': { background: '#fce7f3', dot: 'bg-pink-500' },
    'market': { background: '#dbeafe', dot: 'bg-blue-500' },
    'risk': { background: '#fee2e2', dot: 'bg-red-500' },
    'financial': { background: '#d1fae5', dot: 'bg-green-500' },
    'operational': { background: '#e0e7ff', dot: 'bg-indigo-500' },
    'technical': { background: '#f3e8ff', dot: 'bg-purple-500' }
  }
  
  // Try to match category
  for (const [key, theme] of Object.entries(themes)) {
    if (cardType.toLowerCase().includes(key)) {
      return theme
    }
  }
  
  // Default theme
  return { background: '#f3f4f6', dot: 'bg-gray-500' }
}

interface EnhancedMasterCardProps {
  cardData: CardData
  onUpdate: (updatedCard: Partial<CardData>) => Promise<void>
  onDelete: () => void
  onDuplicate: () => void
  onAIEnhance: () => void
  isSelected?: boolean
  onSelect?: () => void
  availableCards?: Array<{ id: string; title: string; cardType: string }>
  forceEnhanced?: boolean
}

// Inline editable field component
interface EditableFieldProps {
  value: any
  onSave: (newValue: any) => void
  type?: 'text' | 'textarea' | 'select' | 'tags'
  options?: string[]
  placeholder?: string
  className?: string
  readOnly?: boolean
}

function EditableField({ 
  value, 
  onSave, 
  type = 'text', 
  options = [], 
  placeholder = 'Click to edit', 
  className = '',
  readOnly = false
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)

  React.useEffect(() => {
    setEditValue(value)
  }, [value])

  const handleSave = () => {
    onSave(editValue)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  if (readOnly) {
    return <span className={`${className} text-black`}>{value || placeholder}</span>
  }

  if (isEditing) {
    if (type === 'select') {
      return (
        <select
          value={editValue || ''}
          onChange={(e) => {
            setEditValue(e.target.value)
            onSave(e.target.value)
            setIsEditing(false)
          }}
          onBlur={() => setIsEditing(false)}
          className={styles.editableSelect}
          autoFocus
        >
          {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )
    }

    if (type === 'textarea') {
      return (
        <div className="relative">
          <textarea
            value={editValue || ''}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') handleCancel()
              if (e.key === 'Enter' && e.metaKey) handleSave()
            }}
            className={styles.editableTextarea}
            rows={4}
            autoFocus
          />
          <div className="flex gap-1 mt-1">
            <button onClick={handleSave} className="text-green-600 hover:text-green-700">
              <Check className="w-3 h-3" />
            </button>
            <button onClick={handleCancel} className="text-gray-600 hover:text-gray-700">
              <XIcon className="w-3 h-3" />
            </button>
          </div>
        </div>
      )
    }

    return (
      <input
        type="text"
        value={editValue || ''}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave()
          if (e.key === 'Escape') handleCancel()
        }}
        className={styles.editableField}
        autoFocus
      />
    )
  }

  return (
    <div 
      className={`group cursor-pointer inline-flex items-center gap-1 ${className}`}
      onClick={() => !readOnly && setIsEditing(true)}
    >
      <span className={value ? 'text-black' : 'text-gray-400 italic'}>
        {value || placeholder}
      </span>
      {!readOnly && (
        <Edit2 className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </div>
  )
}

function EnhancedMasterCardInternal({
  cardData,
  onUpdate,
  onDelete,
  onDuplicate,
  onAIEnhance,
  isSelected,
  onSelect,
  availableCards,
  forceEnhanced = false
}: EnhancedMasterCardProps) {
  // Get blueprint and theme first
  const blueprint = getBlueprintConfig(cardData.cardType)
  const theme = getCategoryTheme(cardData.cardType)
  
  // Initialize with all sections expanded
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview', 'Content', 'Details', 'Status', 'Timeline', 'Organization']))
  const [isEditMode, setIsEditMode] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const [editData, setEditData] = useState(cardData)
  const [hasChanges, setHasChanges] = useState(false)
  
  // Analytics
  const { trackAction } = useCardAnalytics(cardData.cardType, cardData.id)
  const { trackSavePerformance } = usePerformanceTracking('EnhancedMasterCard')
  const displayCardType = (cardData.cardType || 'unknown')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
  
  // Update edit data when card data changes (new card loaded)
  useEffect(() => {
    setEditData(cardData)
    setHasChanges(false)
  }, [cardData.id])
  
  // Track if we're currently saving
  const [isSaving, setIsSaving] = useState(false)
  
  // For now, we'll use editData as our local data
  const localData = isEditMode ? editData : cardData
  
  // Validation
  const validationRules = useMemo(() => {
    const rules: any[] = []
    
    // Add blueprint field validation
    if (blueprint?.fields) {
      blueprint.fields.forEach(field => {
        if (field.required) {
          rules.push({
            field: field.id,
            validate: validators.required(`${field.name} is required`)
          })
        }
      })
    }
    
    // Add common validation
    rules.push({
      field: 'title',
      validate: validators.required('Title is required')
    })
    
    return rules
  }, [blueprint])

  const { errors, isValid, validateField, touchField, getFieldError } = useValidation(
    localData, 
    { rules: validationRules }
  )
  
  // Handle save
  const handleSave = async () => {
    try {
      setIsSaving(true)
      await onUpdate(editData)
      // After successful save, editData becomes the new "truth"
      // This ensures the UI reflects the saved changes
      setIsEditMode(false)
      setHasChanges(false)
      toast.success('Changes saved!')
      trackAction('saved_changes')
    } catch (error) {
      console.error('Failed to save:', error)
      toast.error('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }
  
  // Handle cancel
  const handleCancel = () => {
    setEditData(cardData)
    setHasChanges(false)
    setIsEditMode(false)
    trackAction('cancelled_edit')
  }
  
  // Keyboard shortcuts
  useKeyboardShortcuts({
    'cmd+s': () => {
      if (isEditMode && hasChanges) {
        handleSave()
      }
    },
    'cmd+e': () => setIsEditMode(!isEditMode)
  })
  
  // Handle field updates
  const handleFieldUpdate = useCallback((field: string, value: any) => {
    console.log('[EnhancedMasterCard] Field update:', field, value)
    setEditData(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
    validateField(field, value)
    trackAction('field_updated', { field })
  }, [validateField, trackAction])
  
  // Toggle section
  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }
  
  // Format date
  const formatDate = (date: string | Date | undefined) => {
    if (!date) return 'Unknown'
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (e) {
      return 'Invalid date'
    }
  }
  
  // Group blueprint fields by type
  const groupedFields = useMemo(() => {
    if (!blueprint?.fields) return {}
    
    return blueprint.fields.reduce((acc, field) => {
      const section = getFieldSection(field)
      if (!acc[section]) acc[section] = []
      acc[section].push(field)
      return acc
    }, {} as Record<string, BlueprintField[]>)
  }, [blueprint])
  
  function getFieldSection(field: BlueprintField): string {
    // Group fields logically based on type or name
    if (field.type === 'textarea' || field.id.includes('description') || field.id.includes('summary')) {
      return 'Content'
    }
    if (field.type === 'enum' || field.id.includes('status') || field.id.includes('priority')) {
      return 'Status'
    }
    if (field.type === 'date' || field.id.includes('date') || field.id.includes('deadline')) {
      return 'Timeline'
    }
    if (field.type === 'array' || field.id.includes('tags') || field.id.includes('categories')) {
      return 'Organization'
    }
    return 'Details'
  }
  
  // Render field value in magazine style
  const renderFieldValue = (field: BlueprintField) => {
    const value = localData[field.id]
    const error = getFieldError(field.id)
    
    if (field.type === 'enum' && field.options) {
      return (
        <EditableField
          value={value}
          onSave={(v) => handleFieldUpdate(field.id, v)}
          type="select"
          options={field.options}
          placeholder={field.placeholder}
          readOnly={!isEditMode}
        />
      )
    }
    
    if (field.type === 'textarea') {
      return (
        <EditableField
          value={value}
          onSave={(v) => handleFieldUpdate(field.id, v)}
          type="textarea"
          placeholder={field.placeholder}
          className="whitespace-pre-wrap"
          readOnly={!isEditMode}
        />
      )
    }
    
    if (field.type === 'array') {
      return (
        <div className={styles.tagContainer}>
          {value?.map((item: string, idx: number) => (
            <span key={idx} className={styles.tag}>
              {item}
              {isEditMode && (
                <span
                  onClick={() => {
                    const newValue = value.filter((_: string, i: number) => i !== idx)
                    handleFieldUpdate(field.id, newValue)
                  }}
                  className={styles.tagRemove}
                >
                  ×
                </span>
              )}
            </span>
          ))}
          {isEditMode && (
            <button
              onClick={() => {
                const newItem = prompt(`Add ${field.name}:`)
                if (newItem) {
                  handleFieldUpdate(field.id, [...(value || []), newItem])
                }
              }}
              className={styles.addTagButton}
            >
              + Add
            </button>
          )}
        </div>
      )
    }
    
    return (
      <EditableField
        value={value}
        onSave={(v) => handleFieldUpdate(field.id, v)}
        placeholder={field.placeholder}
        readOnly={!isEditMode}
      />
    )
  }
  
  return (
    <div className={styles.masterCard}>
      {/* Header with gradient */}
      <div 
        className={styles.cardHeader}
        style={{
          background: `linear-gradient(135deg, #ffffff 0%, ${theme.background} 100%)`
        }}
      >
        <div className={styles.headerContent}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className={`${styles.categoryDot} ${theme.dot}`}></div>
                <span className="text-[12px] font-medium text-gray-600">
                  {displayCardType}
                </span>
                {hasChanges && <span className="text-[11px] text-orange-500">• Unsaved changes</span>}
                {isPinned && <Pin className="w-3 h-3 text-yellow-500" />}
              </div>
              <h2 className={styles.cardTitle}>
                <EditableField
                  value={localData.title}
                  onSave={(v) => handleFieldUpdate('title', v)}
                  placeholder="Untitled"
                  className="text-[20px] font-semibold text-black"
                  readOnly={!isEditMode}
                />
              </h2>
              {/* Card ID */}
              {localData.id && (
                <div className="flex items-center gap-1 mt-2 text-[11px] text-gray-500">
                  <Hash className="w-3 h-3" />
                  <span className="font-mono">{getFormattedCardId(localData)}</span>
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setIsCollapsed(!isCollapsed)
                  trackAction(isCollapsed ? 'expanded' : 'collapsed')
                }}
                className={styles.actionButton}
                title={isCollapsed ? 'Expand' : 'Collapse'}
              >
                {isCollapsed ? <ChevronDown /> : <ChevronUp />}
              </button>
              {!isEditMode ? (
                <button
                  onClick={() => {
                    setIsEditMode(true)
                    trackAction('entered_edit_mode')
                  }}
                  className={styles.actionButton}
                >
                  <Edit2 /> Edit
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleCancel}
                    className={styles.actionButton}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className={`${styles.actionButton} ${styles.editModeIndicator}`}
                    disabled={isSaving || !hasChanges}
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
              <button 
                onClick={() => {
                  onAIEnhance()
                  trackAction('ai_enhanced')
                }} 
                className={styles.actionButton}
              >
                <Sparkles />
              </button>
              <button 
                onClick={() => {
                  setIsPinned(!isPinned)
                  trackAction(isPinned ? 'unpinned' : 'pinned')
                }} 
                className={styles.actionButton}
              >
                <Pin className={isPinned ? 'text-yellow-500' : ''} />
              </button>
              <button 
                onClick={() => {
                  onDuplicate()
                  trackAction('duplicated')
                }} 
                className={styles.actionButton}
              >
                <Copy />
              </button>
              <button 
                onClick={() => {
                  onDelete()
                  trackAction('deleted')
                }} 
                className={`${styles.actionButton} hover:text-red-600`}
              >
                <Trash2 />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {!isCollapsed && (
        <>
          {/* Overview Section - Always visible */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <div className={`w-2 h-2 rounded-full ${theme.dot}`}></div>
              Overview
            </h3>
            
            {/* Description */}
            <div className="mb-6">
              <p className={styles.fieldLabel}>Description</p>
              <div className={styles.fieldValue}>
                <EditableField
                  value={localData.description}
                  onSave={(v) => handleFieldUpdate('description', v)}
                  type="textarea"
                  placeholder="Add a description..."
                  readOnly={!isEditMode}
                />
              </div>
            </div>
            
            {/* Intelligence Content - if available */}
            {(localData.intelligence_content || localData.card_data?.intelligence_content) && (
              <div className="mb-6">
                <p className={styles.fieldLabel}>Intelligence Content</p>
                <div className={styles.fieldValue}>
                  <EditableField
                    value={localData.intelligence_content || localData.card_data?.intelligence_content}
                    onSave={(v) => handleFieldUpdate('intelligence_content', v)}
                    type="textarea"
                    placeholder="Add intelligence content..."
                    readOnly={!isEditMode}
                  />
                </div>
              </div>
            )}
            
            {/* Key Findings - if available */}
            {localData.key_findings && localData.key_findings.length > 0 && (
              <div className="mb-6">
                <p className={styles.fieldLabel}>Key Findings</p>
                <ul className="space-y-2">
                  {localData.key_findings.map((finding: any, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-gray-400 mt-0.5">•</span>
                      <span className="text-black">{typeof finding === 'string' ? finding : finding.text || finding.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Metadata Grid */}
            <div className={styles.metadataGrid}>
              <div className={styles.metadataItem}>
                <p className={styles.fieldLabel}>Priority</p>
                <EditableField
                  value={localData.priority}
                  onSave={(v) => handleFieldUpdate('priority', v)}
                  type="select"
                  options={['High', 'Medium', 'Low']}
                  readOnly={!isEditMode}
                />
              </div>
              
              <div className={styles.metadataItem}>
                <p className={styles.fieldLabel}>Confidence</p>
                <EditableField
                  value={localData.confidenceLevel}
                  onSave={(v) => handleFieldUpdate('confidenceLevel', v)}
                  type="select"
                  options={['High', 'Medium', 'Low']}
                  readOnly={!isEditMode}
                />
              </div>
              
              <div className={styles.metadataItem}>
                <p className={styles.fieldLabel}>Owner</p>
                <EditableField
                  value={localData.owner || localData.creator}
                  onSave={(v) => handleFieldUpdate('owner', v)}
                  placeholder="Assign owner..."
                  readOnly={!isEditMode}
                />
              </div>
              
              <div className={styles.metadataItem}>
                <p className={styles.fieldLabel}>Strategic Alignment</p>
                <EditableField
                  value={localData.strategicAlignment}
                  onSave={(v) => handleFieldUpdate('strategicAlignment', v)}
                  placeholder="Add strategic context..."
                  readOnly={!isEditMode}
                />
              </div>
            </div>
            
            {/* Intelligence Metrics - if applicable */}
            {(localData.relevance_score !== undefined || localData.credibility_score !== undefined) && (
              <div className="mt-6 space-y-4">
                {localData.relevance_score !== undefined && (
                  <div>
                    <p className={styles.fieldLabel}>Relevance Score</p>
                    <div className="flex items-center gap-3">
                      <span className="text-black font-medium">{localData.relevance_score}/10</span>
                      <div className={styles.progressBar} style={{ width: '200px' }}>
                        <div 
                          className={styles.progressFill}
                          style={{ width: `${(localData.relevance_score || 0) * 10}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {localData.credibility_score !== undefined && (
                  <div>
                    <p className={styles.fieldLabel}>Credibility Score</p>
                    <div className="flex items-center gap-3">
                      <span className="text-black font-medium">{localData.credibility_score}/10</span>
                      <div className={styles.progressBar} style={{ width: '200px' }}>
                        <div 
                          className={styles.progressFill}
                          style={{ 
                            width: `${(localData.credibility_score || 0) * 10}%`,
                            background: 'linear-gradient(to right, #10b981, #059669)'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Blueprint Fields Sections */}
          {Object.entries(groupedFields).map(([section, fields]) => (
            <div key={section} className={styles.section}>
              <div 
                className={styles.collapsibleHeader}
                onClick={() => toggleSection(section)}
              >
                <h3 className={styles.sectionTitle}>
                  {expandedSections.has(section) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  {section}
                </h3>
              </div>
              
              {expandedSections.has(section) && (
                <div className={styles.collapsibleContent}>
                  <div className={styles.sectionGrid}>
                    {fields.map(field => (
                      <div key={field.id} className={styles.fieldGroup}>
                        <p className={styles.fieldLabel}>{field.name}</p>
                        <div className={styles.fieldValue}>
                          {renderFieldValue(field)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {/* Tags Section */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <Tag className="w-4 h-4" />
              Tags
            </h3>
            <div className={styles.tagContainer}>
              {localData.tags?.map((tag: string, idx: number) => (
                <span key={idx} className={styles.tag}>
                  {tag}
                  {isEditMode && (
                    <span
                      onClick={() => {
                        const newTags = localData.tags.filter((_: string, i: number) => i !== idx)
                        handleFieldUpdate('tags', newTags)
                      }}
                      className={styles.tagRemove}
                    >
                      ×
                    </span>
                  )}
                </span>
              ))}
              {isEditMode && (
                <button
                  onClick={() => {
                    const newTag = prompt('Add a tag:')
                    if (newTag) {
                      handleFieldUpdate('tags', [...(localData.tags || []), newTag])
                    }
                  }}
                  className={styles.addTagButton}
                >
                  + Add tag
                </button>
              )}
            </div>
          </div>
          
          {/* Footer */}
          <div className={styles.section}>
            <div className="flex items-center justify-between text-[11px] text-gray-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Created {formatDate(localData.created_at || localData.createdDate)}
                </span>
                <span>
                  Last updated {formatDate(localData.updated_at || localData.lastModified)}
                </span>
              </div>
              {/* Removed offline queue indicator */}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export function EnhancedMasterCard(props: EnhancedMasterCardProps) {
  return (
    <ErrorBoundary>
      <EnhancedMasterCardInternal {...props} />
    </ErrorBoundary>
  )
}