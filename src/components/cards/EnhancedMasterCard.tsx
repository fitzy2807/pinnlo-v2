'use client'

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { Copy, Trash2, Sparkles, Archive, Pin, Hash, AlertTriangle, TrendingUp, Calendar, User } from 'lucide-react'
import { toast } from 'react-hot-toast'

// Import all shared components
import { 
  useAutoSave,
  useUndo,
  useValidation,
  useKeyboardShortcuts,
  CardContainer,
  CardHeader,
  CollapsibleSection,
  AIEnhancedField,
  SaveIndicator,
  ErrorBoundary,
  SectionPreview,
  validators
} from '@/components/shared/cards'

// Import blueprint library and types
import { getBlueprintConfig, BLUEPRINT_REGISTRY } from '@/components/blueprints/registry'
import { BlueprintField, BlueprintConfig } from '@/components/blueprints/types'
import { CardData } from '@/types/card'

// Import field components for blueprint fields
import { BlueprintFieldAdapter, getDefaultValue } from './BlueprintFieldAdapter'

// Import analytics hooks
import { useCardAnalytics, usePerformanceTracking } from '@/hooks/useAnalytics'

interface EnhancedMasterCardProps {
  cardData: CardData
  onUpdate: (updatedCard: Partial<CardData>) => Promise<void>
  onDelete: () => void
  onDuplicate: () => void
  onAIEnhance: () => void
  isSelected?: boolean
  onSelect?: () => void
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
  
  return prefixMap[cardType] || 'GEN'
}

// Generate formatted card ID
const getFormattedCardId = (cardData: CardData): string => {
  const prefix = getBlueprintPrefix(cardData.cardType)
  const numericId = cardData.id.replace(/\D/g, '') || '1'
  return `${prefix}-${numericId}`
}

// Section color mapping
const getSectionColor = (index: number): any => {
  const colors = ['blue', 'green', 'purple', 'orange', 'yellow', 'cyan', 'indigo', 'pink']
  return colors[index % colors.length] as any
}

// Group fields by section
const groupFieldsBySection = (fields: BlueprintField[]): Record<string, BlueprintField[]> => {
  const sections: Record<string, BlueprintField[]> = {}
  
  // For now, put all fields in a single section
  // In the future, we can add section metadata to BlueprintField
  sections['Blueprint Fields'] = fields
  
  return sections
}

function EnhancedMasterCardInternal({
  cardData,
  onUpdate,
  onDelete,
  onDuplicate,
  onAIEnhance,
  isSelected,
  onSelect,
  availableCards
}: EnhancedMasterCardProps) {
  // State
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isEditMode, setIsEditMode] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [isPinned, setIsPinned] = useState(false)

  // Analytics tracking
  const { trackAction } = useCardAnalytics(cardData.cardType, cardData.id)
  const { trackSavePerformance } = usePerformanceTracking('EnhancedMasterCard')

  // Get blueprint configuration
  const blueprint = getBlueprintConfig(cardData.cardType)
  
  if (!blueprint) {
    return (
      <CardContainer>
        <div className="p-4 text-red-600">
          Unknown card type: {cardData.cardType}
        </div>
      </CardContainer>
    )
  }

  // Initialize auto-save with all features
  const {
    data: localData,
    updateField,
    updateFields,
    forceSave,
    isDirty,
    isSaving,
    saveStatus,
    lastSaved,
    isOnline,
    offlineQueueSize,
    dirtyFields,
    version
  } = useAutoSave(cardData, async (updates) => {
    const saveStartTime = Date.now()
    
    try {
      // Transform data to match the expected format for specialized cards
      const { title, description, ...cardDataFields } = updates
      
      // Prepare the update in the same format as TRD/TaskList/PRD cards
      const updatePayload: any = {}
      
      // Only include changed fields
      if (title !== undefined) updatePayload.title = title
      if (description !== undefined) updatePayload.description = description
      
      // All other fields go into card_data
      if (Object.keys(cardDataFields).length > 0) {
        updatePayload.card_data = {
          ...cardData.card_data, // preserve existing card_data
          ...cardDataFields,
          // Ensure priority is lowercase for database
          priority: cardDataFields.priority?.toLowerCase() || cardData.priority?.toLowerCase()
        }
      }
      
      await onUpdate(updatePayload)
      
      // Track successful save
      trackSavePerformance(saveStartTime, true)
      trackAction('saved', { fieldsUpdated: Object.keys(updates).length })
      
      return { success: true, version: version + 1 }
    } catch (error) {
      // Track failed save
      trackSavePerformance(saveStartTime, false)
      trackAction('save_failed', { error: error.message })
      throw error
    }
  }, {
    debounceMs: 1000,
    enableConflictDetection: true,
    enableOfflineQueue: true,
    fieldDebounceMap: {
      title: 500,
      description: 1000
    }
  })

  // Initialize undo/redo
  const {
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo
  } = useUndo(localData)

  // Track changes for undo
  const handleFieldChange = useCallback((field: string, value: any) => {
    addToHistory(localData, `Changed ${field}`)
    updateField(field, value)
  }, [localData, addToHistory, updateField])

  // Initialize validation with async support
  const validationRules = useMemo(() => {
    const rules: any[] = []
    
    // Add validation for required fields
    blueprint.fields.forEach(field => {
      if (field.required) {
        rules.push({
          field: field.id,
          validate: validators.required(`${field.name} is required`)
        })
      }
      
      // Add field-specific validation
      if (field.validation) {
        if (field.validation.min !== undefined) {
          rules.push({
            field: field.id,
            validate: validators.min(field.validation.min)
          })
        }
        if (field.validation.max !== undefined) {
          rules.push({
            field: field.id,
            validate: validators.max(field.validation.max)
          })
        }
        if (field.validation.pattern) {
          rules.push({
            field: field.id,
            validate: validators.pattern(new RegExp(field.validation.pattern))
          })
        }
        
        // Add custom validation if provided
        if (field.validation.custom && typeof field.validation.custom === 'function') {
          rules.push({
            field: field.id,
            validate: (value: any) => {
              const result = field.validation!.custom!(value)
              return typeof result === 'string' ? result : (result ? null : 'Invalid value')
            }
          })
        }
      }
    })
    
    // Add common field validation
    rules.push({
      field: 'title',
      validate: validators.required('Title is required')
    })
    
    // Add async validation for title uniqueness (example)
    if (cardData.cardType && cardData.id) {
      rules.push({
        field: 'title',
        async: true,
        debounceMs: 500,
        validate: validators.unique(
          async (value: string) => {
            // This would typically check against your API
            // For now, we'll simulate it
            if (value === localData.title) return true // No change
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 300))
            
            // For demo purposes, reject titles containing "duplicate"
            return !value.toLowerCase().includes('duplicate')
          },
          'Title must be unique within this card type'
        )
      })
    }
    
    return rules
  }, [blueprint, cardData.cardType, cardData.id, localData.title])

  const { errors, isValid, validateField, touchField, getFieldError, isValidating } = useValidation(localData, {
    rules: validationRules
  })

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'cmd+s': () => {
      forceSave()
      toast.success('Saved!')
    },
    'cmd+z': () => {
      const previousData = undo()
      if (previousData) {
        updateFields(previousData)
        toast.success('Undone!')
      }
    },
    'cmd+shift+z': () => {
      const nextData = redo()
      if (nextData) {
        updateFields(nextData)
        toast.success('Redone!')
      }
    },
    'cmd+e': () => {
      setIsEditMode(!isEditMode)
    }
  })

  // Section color mapping - memoized for performance
  const sectionColorMap = useMemo(() => ({
    0: 'blue',
    1: 'green',
    2: 'purple',
    3: 'orange',
    4: 'yellow',
    5: 'cyan',
    6: 'indigo',
    7: 'pink'
  } as const), [])

  const getSectionColorMemoized = useCallback((index: number): any => {
    return sectionColorMap[index % 8 as keyof typeof sectionColorMap] || 'gray'
  }, [sectionColorMap])

  // Group fields by section
  const fieldsBySection = useMemo(() => 
    groupFieldsBySection(blueprint.fields),
    [blueprint]
  )

  // Handle title update
  const handleTitleUpdate = useCallback((newTitle: string) => {
    handleFieldChange('title', newTitle)
  }, [handleFieldChange])

  // Toggle section
  const toggleSection = useCallback((sectionName: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionName)) {
        newSet.delete(sectionName)
      } else {
        newSet.add(sectionName)
      }
      return newSet
    })
  }, [])

  // Actions with tracking
  const handleAIEnhance = () => {
    trackAction('ai_enhance_clicked')
    onAIEnhance()
  }

  const handlePin = () => {
    const newPinState = !isPinned
    setIsPinned(newPinState)
    trackAction(newPinState ? 'pinned' : 'unpinned')
  }

  const handleDuplicate = () => {
    trackAction('duplicated')
    onDuplicate()
  }

  const handleDelete = () => {
    trackAction('deleted')
    onDelete()
  }

  const cardActions = (
    <>
      <button
        onClick={handleAIEnhance}
        className="p-1.5 text-gray-600 hover:text-purple-600 rounded transition-colors"
        title="AI Enhance"
      >
        <Sparkles className="w-4 h-4" />
      </button>
      <button
        onClick={handlePin}
        className={`p-1.5 rounded transition-colors ${
          isPinned ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-600 hover:text-gray-700'
        }`}
        title={isPinned ? 'Unpin' : 'Pin'}
      >
        <Pin className="w-4 h-4" />
      </button>
      <button
        onClick={handleDuplicate}
        className="p-1.5 text-gray-600 hover:text-green-600 rounded transition-colors"
        title="Duplicate"
      >
        <Copy className="w-4 h-4" />
      </button>
      <button
        onClick={handleDelete}
        className="p-1.5 text-gray-600 hover:text-red-600 rounded transition-colors"
        title="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </>
  )

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Metadata display
  const metadata = (
    <div className="flex items-center gap-4 text-xs text-gray-500">
      <div className="flex items-center gap-1">
        <Hash className="w-3 h-3" />
        <span className="font-mono">{getFormattedCardId(localData)}</span>
      </div>
      <span>{localData.cardType}</span>
      {offlineQueueSize > 0 && (
        <span className="text-yellow-600">{offlineQueueSize} changes pending</span>
      )}
    </div>
  )

  // Priority/Confidence badges
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

  // Render blueprint field using adapter
  const renderBlueprintField = (field: BlueprintField) => {
    const value = localData[field.id] || getDefaultValue(field)
    const error = getFieldError(field.id)

    return (
      <BlueprintFieldAdapter
        key={field.id}
        field={field}
        value={value}
        onChange={(newValue) => {
          handleFieldChange(field.id, newValue)
          validateField(field.id, newValue)
        }}
        onBlur={() => touchField(field.id)}
        isEditMode={isEditMode}
        error={error}
      />
    )
  }

  return (
    <ErrorBoundary>
      <CardContainer 
        isSelected={isSelected}
        onClick={onSelect}
        className={isPinned ? 'ring-2 ring-yellow-400' : ''}
      >
        <CardHeader
          title={localData.title}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => {
            setIsCollapsed(!isCollapsed)
            trackAction(isCollapsed ? 'expanded' : 'collapsed')
          }}
          isEditMode={isEditMode}
          onToggleEditMode={() => {
            setIsEditMode(!isEditMode)
            trackAction(isEditMode ? 'exited_edit_mode' : 'entered_edit_mode')
          }}
          onTitleEdit={isEditMode ? handleTitleUpdate : undefined}
          metadata={metadata}
          saveStatus={saveStatus}
          actions={cardActions}
          onSelect={onSelect}
          isSelected={isSelected}
        />

        {!isCollapsed && (
          <>
            {/* Priority and Confidence Badges */}
            <div className="px-3 pb-3 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500">Priority:</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(localData.priority)}`}>
                  {localData.priority}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500">Confidence:</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getConfidenceColor(localData.confidenceLevel)}`}>
                  {localData.confidenceLevel}
                </span>
              </div>
            </div>

            {/* Description field - always visible */}
            <div className="p-3 border-b border-gray-100">
              <AIEnhancedField
                label="Description"
                value={localData.description || ''}
                onChange={(value) => handleFieldChange('description', value)}
                placeholder="Describe this card..."
                isEditMode={isEditMode}
                aiContext={`${cardData.cardType}_description`}
                error={errors.description}
              />
            </div>

            {/* Strategic Alignment Section */}
            <CollapsibleSection
              title="Strategic Alignment"
              colorScheme="green"
              defaultExpanded={false}
              preview={<SectionPreview 
                data={localData} 
                fields={['strategicAlignment']} 
              />}
            >
              <AIEnhancedField
                label="Strategic Alignment"
                value={localData.strategicAlignment || ''}
                onChange={(value) => handleFieldChange('strategicAlignment', value)}
                placeholder="How does this align with your overall strategy?"
                fieldType="textarea"
                isEditMode={isEditMode}
                aiContext={`${cardData.cardType}_strategic_alignment`}
              />
            </CollapsibleSection>

            {/* Blueprint-specific fields by section */}
            {Object.entries(fieldsBySection).map(([sectionName, fields], index) => (
              <CollapsibleSection
                key={sectionName}
                title={sectionName}
                colorScheme={getSectionColorMemoized(index)}
                defaultExpanded={index === 0}
                badge={
                  fields.some(f => errors[f.id]) && (
                    <span className="px-1.5 py-0.5 text-xs bg-red-100 text-red-700 rounded">
                      {fields.filter(f => errors[f.id]).length} errors
                    </span>
                  )
                }
                preview={<SectionPreview 
                  data={localData} 
                  fields={fields.slice(0, 2).map(f => f.id)} 
                />}
              >
                <div className="space-y-3">
                  {fields.map(field => renderBlueprintField(field))}
                </div>
              </CollapsibleSection>
            ))}

            {/* Assessment Section (Priority & Confidence with Rationale) */}
            <CollapsibleSection
              title="Assessment"
              colorScheme="yellow"
              defaultExpanded={false}
            >
              <div className="space-y-4">
                {/* Priority */}
                <div>
                  <AIEnhancedField
                    label="Priority"
                    value={localData.priority || ''}
                    onChange={(value) => handleFieldChange('priority', value)}
                    fieldType="select"
                    selectOptions={[
                      { value: 'High', label: 'High' },
                      { value: 'Medium', label: 'Medium' },
                      { value: 'Low', label: 'Low' }
                    ]}
                    isEditMode={isEditMode}
                    aiContext={`${cardData.cardType}_priority`}
                  />
                  <AIEnhancedField
                    label="Priority Rationale"
                    value={localData.priorityRationale || ''}
                    onChange={(value) => handleFieldChange('priorityRationale', value)}
                    placeholder="Why is this priority level appropriate?"
                    fieldType="textarea"
                    isEditMode={isEditMode}
                    aiContext={`${cardData.cardType}_priority_rationale`}
                  />
                </div>

                {/* Confidence */}
                <div>
                  <AIEnhancedField
                    label="Confidence Level"
                    value={localData.confidenceLevel || ''}
                    onChange={(value) => handleFieldChange('confidenceLevel', value)}
                    fieldType="select"
                    selectOptions={[
                      { value: 'High', label: 'High' },
                      { value: 'Medium', label: 'Medium' },
                      { value: 'Low', label: 'Low' }
                    ]}
                    isEditMode={isEditMode}
                    aiContext={`${cardData.cardType}_confidence`}
                  />
                  <AIEnhancedField
                    label="Confidence Rationale"
                    value={localData.confidenceRationale || ''}
                    onChange={(value) => handleFieldChange('confidenceRationale', value)}
                    placeholder="Why is this confidence level appropriate?"
                    fieldType="textarea"
                    isEditMode={isEditMode}
                    aiContext={`${cardData.cardType}_confidence_rationale`}
                  />
                </div>
              </div>
            </CollapsibleSection>

            {/* Metadata & Relationships section */}
            <CollapsibleSection
              title="Metadata & Relationships"
              colorScheme="gray"
              defaultExpanded={false}
            >
              <div className="space-y-3">
                <AIEnhancedField
                  label="Tags"
                  value={localData.tags?.join(', ') || ''}
                  onChange={(value) => 
                    handleFieldChange('tags', value.split(',').map(t => t.trim()).filter(Boolean))
                  }
                  placeholder="tag1, tag2, tag3..."
                  fieldType="text"
                  isEditMode={isEditMode}
                />
                
                {/* Relationships would go here - needs RelationshipEditor component */}
                
                {/* Metadata */}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{localData.creator}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(localData.lastModified)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* Debug info in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="p-2 bg-gray-50 text-xs text-gray-600">
                <div>Save Status: {saveStatus} | Dirty: {isDirty ? 'Yes' : 'No'} | Online: {isOnline ? 'Yes' : 'No'}</div>
                <div>Can Undo: {canUndo ? 'Yes' : 'No'} | Can Redo: {canRedo ? 'Yes' : 'No'}</div>
                <div>Validation: {isValid ? 'Valid' : 'Invalid'} | Version: {version}</div>
                <div>Dirty Fields: {Array.from(dirtyFields).join(', ') || 'None'}</div>
              </div>
            )}
          </>
        )}
      </CardContainer>
    </ErrorBoundary>
  )
}

// Import performance wrapper
import { PerformanceWrapper } from './PerformanceWrapper'

// Export with performance monitoring
export function EnhancedMasterCard(props: EnhancedMasterCardProps) {
  return (
    <PerformanceWrapper componentName="EnhancedMasterCard" warnThreshold={100}>
      <EnhancedMasterCardInternal {...props} />
    </PerformanceWrapper>
  )
}