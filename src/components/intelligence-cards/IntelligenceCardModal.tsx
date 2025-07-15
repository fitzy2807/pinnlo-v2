'use client'

import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { CardData } from '@/types/card'
import { getBlueprintConfig } from '@/components/blueprints/registry'
import { BlueprintField } from '@/components/blueprints/types'
import { getCategoryTheme } from './utils/categoryThemes'
import { toast } from 'react-hot-toast'
import styles from './IntelligenceCardModal.module.css'

interface IntelligenceCardModalProps {
  card: CardData | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (id: string, updates: Partial<CardData>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

// Field display component for read-only mode
const FieldRow = ({ label, value }: { label: string; value: any }) => {
  if (!value || (Array.isArray(value) && value.length === 0)) return null
  
  // Format the value for display
  const formatValue = (val: any): string => {
    if (Array.isArray(val)) {
      return val.join(', ')
    } else if (typeof val === 'object' && val !== null) {
      // Handle objects - could be relationships or other complex data
      if (val.text || val.description || val.title) {
        return val.text || val.description || val.title
      }
      // For other objects, try to extract meaningful values
      return Object.values(val).filter(v => typeof v === 'string').join(', ') || JSON.stringify(val)
    } else if (typeof val === 'boolean') {
      return val ? 'Yes' : 'No'
    } else if (val instanceof Date) {
      return val.toLocaleDateString()
    }
    return String(val)
  }
  
  return (
    <div className={styles.fieldRow}>
      <div className={styles.fieldLabel}>{label.toUpperCase()}</div>
      <div className={styles.fieldContent}>
        {formatValue(value)}
      </div>
    </div>
  )
}

// Field edit component for edit mode
const EditField = ({ 
  label, 
  value, 
  onChange, 
  type = 'text',
  options = []
}: { 
  label: string
  value: any
  onChange: (value: any) => void
  type?: 'text' | 'textarea' | 'select' | 'array' | 'multitext'
  options?: string[]
}) => {
  const [newTag, setNewTag] = useState('')
  
  // Normalize value for editing
  const normalizeValue = (val: any): any => {
    if (type === 'array' || type === 'multitext') {
      if (Array.isArray(val)) return val
      if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean)
      if (typeof val === 'object' && val !== null) {
        return Object.values(val).filter(v => typeof v === 'string')
      }
      return []
    } else if (type === 'text' || type === 'textarea' || type === 'select') {
      if (typeof val === 'object' && val !== null) {
        if (val.text || val.description || val.title || val.name) {
          return val.text || val.description || val.title || val.name
        }
        return ''
      }
      return val || ''
    }
    return val
  }
  
  const displayValue = normalizeValue(value)
  
  const handleAddTag = () => {
    if (newTag.trim() && type === 'array') {
      const currentTags = Array.isArray(displayValue) ? displayValue : []
      if (!currentTags.includes(newTag.trim())) {
        onChange([...currentTags, newTag.trim()])
        setNewTag('')
      }
    }
  }
  
  const handleRemoveTag = (tagToRemove: string) => {
    if (type === 'array' && Array.isArray(displayValue)) {
      onChange(displayValue.filter(tag => tag !== tagToRemove))
    }
  }
  
  return (
    <div className={styles.fieldRow}>
      <div className={styles.fieldLabel}>{label.toUpperCase()}</div>
      <div className={styles.fieldContent}>
        {type === 'textarea' ? (
          <textarea
            value={displayValue || ''}
            onChange={(e) => onChange(e.target.value)}
            className={`${styles.fieldInput} ${styles.fieldInputTextarea}`}
            rows={3}
          />
        ) : type === 'select' ? (
          <select
            value={displayValue || ''}
            onChange={(e) => onChange(e.target.value)}
            className={styles.fieldInput}
          >
            {options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : type === 'array' ? (
          <div className={styles.tagsContainer}>
            <div className={styles.tagsList}>
              {Array.isArray(displayValue) && displayValue.map((tag, idx) => (
                <span key={idx} className={styles.tag}>
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className={styles.tagRemove}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className={styles.tagInputWrapper}>
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
                placeholder="Add a tag"
                className={styles.tagInput}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className={styles.addTagButton}
              >
                + Add
              </button>
            </div>
          </div>
        ) : type === 'multitext' ? (
          <div className={styles.multitextContainer}>
            {Array.isArray(displayValue) && displayValue.map((text, idx) => (
              <div key={idx} className={styles.multitextItem}>
                <textarea
                  value={text}
                  onChange={(e) => {
                    const newValues = [...displayValue]
                    newValues[idx] = e.target.value
                    onChange(newValues)
                  }}
                  className={`${styles.fieldInput} ${styles.fieldInputTextarea}`}
                  rows={3}
                  placeholder={`${label} ${idx + 1}`}
                />
                <button
                  type="button"
                  onClick={() => {
                    const newValues = displayValue.filter((_, i) => i !== idx)
                    onChange(newValues)
                  }}
                  className={styles.multitextRemove}
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const currentValues = Array.isArray(displayValue) ? displayValue : []
                onChange([...currentValues, ''])
              }}
              className={styles.addMultitextButton}
            >
              + Add {label}
            </button>
          </div>
        ) : (
          <input
            type="text"
            value={displayValue || ''}
            onChange={(e) => onChange(e.target.value)}
            className={styles.fieldInput}
          />
        )}
      </div>
    </div>
  )
}

export default function IntelligenceCardModal({
  card,
  isOpen,
  onClose,
  onUpdate,
  onDelete
}: IntelligenceCardModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<CardData>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  
  // Reset state when card changes
  useEffect(() => {
    if (card) {
      setEditData(card)
      setIsEditing(false)
    }
  }, [card?.id])
  
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
  
  // Handle close with animation
  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
    }, 300)
  }
  
  if (!isOpen || !card) return null
  
  const theme = getCategoryTheme(card.cardType || 'market')
  const blueprint = getBlueprintConfig(card.cardType)
  
  const handleSave = async () => {
    try {
      setIsSaving(true)
      await onUpdate(card.id, editData)
      setIsEditing(false)
      toast.success('Changes saved!')
    } catch (error) {
      console.error('Failed to save:', error)
      toast.error('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }
  
  const handleCancel = () => {
    setEditData(card)
    setIsEditing(false)
  }
  
  const handleFieldChange = (field: string, value: any) => {
    // For TRD fields, store them in card_data
    const isTRDField = trdFields.some(f => f.id === field)
    
    if (isTRDField) {
      setEditData(prev => ({
        ...prev,
        card_data: {
          ...prev.card_data,
          [field]: value
        }
      }))
    } else {
      setEditData(prev => ({ ...prev, [field]: value }))
    }
  }
  
  // Define core fields to always show (reordered)
  const coreFields = [
    { id: 'title', label: 'Title', type: 'text' },
    { id: 'description', label: 'Description', type: 'textarea' },
    { id: 'strategicAlignment', label: 'Strategic Alignment', type: 'textarea' },
    { id: 'tags', label: 'Tags', type: 'array' }
  ]
  
  // Check if card has user stories or acceptance criteria fields
  if (card.userStories || card.user_stories) {
    coreFields.push({ id: 'userStories', label: 'User Stories', type: 'multitext' })
  }
  if (card.acceptanceCriteria || card.acceptance_criteria) {
    coreFields.push({ id: 'acceptanceCriteria', label: 'Acceptance Criteria', type: 'multitext' })
  }
  
  // Add intelligence-specific fields if applicable
  if (card.cardType === 'intelligence' || card.intelligence_content) {
    coreFields.push(
      { id: 'intelligence_content', label: 'Intelligence Content', type: 'textarea' },
      { id: 'key_findings', label: 'Key Findings', type: 'array' }
    )
  }
  
  // Add metadata fields at the end (but before timestamps)
  const metadataFields = [
    { id: 'priority', label: 'Priority', type: 'select', options: ['High', 'Medium', 'Low'] },
    { id: 'confidenceLevel', label: 'Confidence', type: 'select', options: ['High', 'Medium', 'Low'] },
    { id: 'owner', label: 'Owner', type: 'text' }
  ]
  
  // Add blueprint fields if available
  const blueprintFields = blueprint?.fields || []
  
  // Helper to create field definition
  const field = (id: string, label: string, type: string, options?: string[]) => ({ id, label, type, options })
  
  // TRD-specific fields for technical requirements
  const getTRDFields = () => {
    if (card.cardType === 'technical-requirement' || card.cardType === 'technical-requirement-structured') {
      return [
        // Document Control
        field('trd_id', 'TRD ID', 'text'),
        field('version', 'Version', 'text'),
        field('status', 'Status', 'select', ['Draft', 'Review', 'Approved', 'Deprecated']),
        field('assigned_team', 'Assigned Team', 'text'),
        
        // Executive Summary  
        field('system_overview', 'System Overview', 'textarea'),
        field('business_purpose', 'Business Purpose', 'textarea'),
        field('key_architectural_decisions', 'Key Architectural Decisions', 'textarea'),
        field('strategic_alignment', 'Strategic Alignment', 'textarea'),
        field('success_criteria', 'Success Criteria', 'textarea'),
        
        // System Architecture
        field('high_level_design', 'High Level Design', 'textarea'),
        field('component_interactions', 'Component Interactions', 'textarea'),
        field('technology_stack_frontend', 'Frontend Technologies', 'text'),
        field('technology_stack_backend', 'Backend Technologies', 'text'),
        field('technology_stack_database', 'Database Technologies', 'text'),
        field('technology_stack_other', 'Other Technologies', 'text'),
        field('integration_points', 'Integration Points', 'textarea'),
        field('data_flow', 'Data Flow', 'textarea'),
        
        // Feature Requirements
        field('feature_overview', 'Feature Overview', 'textarea'),
        field('technical_approach', 'Technical Approach', 'textarea'),
        field('required_components', 'Required Components', 'textarea'),
        field('data_flow_processing', 'Data Flow Processing', 'textarea'),
        field('business_logic', 'Business Logic', 'textarea'),
        field('ui_requirements', 'UI Requirements', 'textarea'),
        
        // Data Architecture
        field('database_schema', 'Database Schema', 'textarea'),
        field('data_relationships', 'Data Relationships', 'textarea'),
        field('validation_rules', 'Validation Rules', 'textarea'),
        field('migration_strategies', 'Migration Strategies', 'textarea'),
        field('data_governance', 'Data Governance', 'textarea'),
        
        // API Specifications
        field('endpoint_definitions', 'Endpoint Definitions', 'textarea'),
        field('request_response_formats', 'Request/Response Formats', 'textarea'),
        field('authentication_methods', 'Authentication Methods', 'textarea'),
        field('rate_limiting', 'Rate Limiting', 'textarea'),
        field('error_handling', 'Error Handling', 'textarea'),
        
        // Security Requirements
        field('authentication_authorization', 'Authentication/Authorization', 'textarea'),
        field('data_encryption', 'Data Encryption', 'textarea'),
        field('input_validation', 'Input Validation', 'textarea'),
        field('security_headers', 'Security Headers', 'textarea'),
        field('compliance_requirements', 'Compliance Requirements', 'textarea'),
        
        // Performance & Scalability
        field('performance_targets', 'Performance Targets', 'textarea'),
        field('caching_strategies', 'Caching Strategies', 'textarea'),
        field('load_balancing', 'Load Balancing', 'textarea'),
        field('database_optimization', 'Database Optimization', 'textarea'),
        field('scaling_plans', 'Scaling Plans', 'textarea'),
        
        // Infrastructure Requirements
        field('hosting_deployment', 'Hosting/Deployment', 'textarea'),
        field('environment_configurations', 'Environment Configurations', 'textarea'),
        field('monitoring_logging', 'Monitoring/Logging', 'textarea'),
        field('backup_recovery', 'Backup/Recovery', 'textarea'),
        field('resource_requirements', 'Resource Requirements', 'textarea'),
        
        // Testing Strategy
        field('unit_testing', 'Unit Testing', 'textarea'),
        field('integration_testing', 'Integration Testing', 'textarea'),
        field('performance_testing', 'Performance Testing', 'textarea'),
        field('security_testing', 'Security Testing', 'textarea'),
        field('user_acceptance_testing', 'User Acceptance Testing', 'textarea'),
        
        // Implementation Guidelines
        field('development_standards', 'Development Standards', 'textarea'),
        field('code_organization', 'Code Organization', 'textarea'),
        field('documentation_requirements', 'Documentation Requirements', 'textarea'),
        field('version_control', 'Version Control', 'textarea'),
        field('deployment_pipeline', 'Deployment Pipeline', 'textarea'),
        
        // Relationships & Meta
        field('linked_features', 'Linked Features', 'text'),
        field('dependencies', 'Dependencies', 'text'),
        field('implementation_notes', 'Implementation Notes', 'textarea')
      ]
    }
    return []
  }
  
  const trdFields = getTRDFields()
  
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`${styles.modalOverlay} ${isClosing ? styles.closing : ''}`}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className={styles.modalWrapper}>
        <div className={`${styles.modalContent} ${isClosing ? styles.closing : ''}`} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className={styles.modalHeader} style={{
            background: `linear-gradient(135deg, #ffffff 0%, ${theme.background} 100%)`
          }}>
            <h2 className={styles.modalTitle}>{editData.title || 'Untitled'}</h2>
            <div className={styles.modalActions}>
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className={styles.btnEdit}
                  >
                    Edit
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm('Are you sure you want to delete this card?')) {
                        try {
                          await onDelete(card.id)
                          handleClose()
                          toast.success('Card deleted!')
                        } catch (error) {
                          console.error('Failed to delete card:', error)
                          toast.error('Failed to delete card')
                        }
                      }
                    }}
                    className={styles.btnDelete}
                  >
                    Delete
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    className={styles.btnCancel}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className={styles.btnSave}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </>
              )}
              <button
                onClick={handleClose}
                className={styles.btnClose}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Body */}
          <div className={styles.modalBody}>
            {isEditing ? (
              // Edit mode
              <div className={styles.editForm}>
                {coreFields.map(field => (
                  <EditField
                    key={field.id}
                    label={field.label}
                    value={editData[field.id as keyof CardData]}
                    onChange={(value) => handleFieldChange(field.id, value)}
                    type={field.type as any}
                    options={field.options}
                  />
                ))}
                
                {/* TRD-specific fields */}
                {trdFields.map((field: any) => (
                  <EditField
                    key={field.id}
                    label={field.label}
                    value={editData.card_data?.[field.id]}
                    onChange={(value) => handleFieldChange(field.id, value)}
                    type={field.type as any}
                    options={field.options}
                  />
                ))}
                
                {/* Blueprint fields (only for non-TRD cards) */}
                {!trdFields.length && blueprintFields.map((field: BlueprintField) => (
                  <EditField
                    key={field.id}
                    label={field.name}
                    value={editData[field.id as keyof CardData]}
                    onChange={(value) => handleFieldChange(field.id, value)}
                    type={
                      field.type === 'enum' ? 'select' : 
                      field.type === 'array' ? (
                        // Check if this field should be multitext based on field name
                        field.id.includes('userStories') || 
                        field.id.includes('acceptanceCriteria') || 
                        field.id.includes('requirements') ||
                        field.name.toLowerCase().includes('user stories') ||
                        field.name.toLowerCase().includes('acceptance criteria') ||
                        field.name.toLowerCase().includes('requirements')
                        ? 'multitext' : 'array'
                      ) : 
                      field.type === 'textarea' ? 'textarea' : 
                      'text'
                    }
                    options={field.options}
                  />
                ))}
                
                {/* Metadata fields at the end */}
                {metadataFields.map(field => (
                  <EditField
                    key={field.id}
                    label={field.label}
                    value={editData[field.id as keyof CardData]}
                    onChange={(value) => handleFieldChange(field.id, value)}
                    type={field.type as any}
                    options={field.options}
                  />
                ))}
              </div>
            ) : (
              // Read-only mode
              <div className={styles.readOnlyContent}>
                {coreFields.map(field => (
                  <FieldRow
                    key={field.id}
                    label={field.label}
                    value={card[field.id as keyof CardData]}
                  />
                ))}
                
                {/* TRD-specific fields */}
                {trdFields.map((field: any) => (
                  <FieldRow
                    key={field.id}
                    label={field.label}
                    value={card.card_data?.[field.id]}
                  />
                ))}
                
                {/* Blueprint fields (only for non-TRD cards) */}
                {!trdFields.length && blueprintFields.map((field: BlueprintField) => (
                  <FieldRow
                    key={field.id}
                    label={field.name}
                    value={card[field.id as keyof CardData]}
                  />
                ))}
                
                {/* Metadata fields at the end */}
                {metadataFields.map(field => (
                  <FieldRow
                    key={field.id}
                    label={field.label}
                    value={card[field.id as keyof CardData]}
                  />
                ))}
                
                {/* Timestamps */}
                <FieldRow
                  label="Created"
                  value={new Date(card.created_at || card.createdDate).toLocaleDateString()}
                />
                <FieldRow
                  label="Updated"
                  value={new Date(card.updated_at || card.lastModified).toLocaleDateString()}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}