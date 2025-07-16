'use client'

import React, { useState, useCallback } from 'react'
import { Plus, X, Database, Link, Shield } from 'lucide-react'
import { TRDDataModel, CreateTRDDataModel } from '@/types/trd-multi-item'

interface DataModelFormProps {
  item: TRDDataModel | CreateTRDDataModel
  onChange: (item: TRDDataModel | CreateTRDDataModel) => void
  aiContext?: string
}

export default function DataModelForm({ item, onChange, aiContext }: DataModelFormProps) {
  const [schemaDefinition, setSchemaDefinition] = useState(JSON.stringify(item.schema_definition || {}, null, 2))
  const [newRelationship, setNewRelationship] = useState('')

  const handleFieldChange = useCallback((field: keyof TRDDataModel, value: any) => {
    onChange({
      ...item,
      [field]: value
    })
  }, [item, onChange])

  const handleSchemaChange = useCallback((value: string) => {
    try {
      const parsed = JSON.parse(value)
      setSchemaDefinition(value)
      handleFieldChange('schema_definition', parsed)
    } catch (error) {
      // Keep the string value for editing, but don't update the object
      setSchemaDefinition(value)
    }
  }, [handleFieldChange])

  const handleAddRelationship = useCallback(() => {
    if (newRelationship.trim()) {
      const updatedRelationships = [...(item.relationships || []), newRelationship.trim()]
      handleFieldChange('relationships', updatedRelationships)
      setNewRelationship('')
    }
  }, [newRelationship, item.relationships, handleFieldChange])

  const handleRemoveRelationship = useCallback((index: number) => {
    const updatedRelationships = item.relationships?.filter((_, i) => i !== index) || []
    handleFieldChange('relationships', updatedRelationships)
  }, [item.relationships, handleFieldChange])

  const getModelTypeIcon = (type: string) => {
    switch (type) {
      case 'entity': return '📦'
      case 'aggregate': return '🔗'
      case 'value_object': return '💎'
      case 'domain_event': return '⚡'
      default: return '📋'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'implemented': return 'text-green-600 bg-green-50'
      case 'reviewed': return 'text-blue-600 bg-blue-50'
      case 'in_progress': return 'text-yellow-600 bg-yellow-50'
      case 'draft': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getVersionColor = (version: string) => {
    const [major, minor] = version.split('.')
    if (major === '1' && minor === '0') return 'bg-green-100 text-green-800'
    if (major === '1') return 'bg-blue-100 text-blue-800'
    return 'bg-purple-100 text-purple-800'
  }

  const formatRelationshipCount = () => {
    const count = item.relationships?.length || 0
    return count === 1 ? '1 relationship' : `${count} relationships`
  }

  return (
    <div className="space-y-4">
      {/* Model ID and Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Model ID *
          </label>
          <input
            type="text"
            value={item.model_id || ''}
            onChange={(e) => handleFieldChange('model_id', e.target.value)}
            placeholder="DM-001"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Model Name *
          </label>
          <input
            type="text"
            value={item.model_name || ''}
            onChange={(e) => handleFieldChange('model_name', e.target.value)}
            placeholder="User Account"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Model Type and Version */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Model Type
          </label>
          <select
            value={item.model_type || 'entity'}
            onChange={(e) => handleFieldChange('model_type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="entity">Entity {getModelTypeIcon('entity')}</option>
            <option value="aggregate">Aggregate {getModelTypeIcon('aggregate')}</option>
            <option value="value_object">Value Object {getModelTypeIcon('value_object')}</option>
            <option value="domain_event">Domain Event {getModelTypeIcon('domain_event')}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Version
          </label>
          <input
            type="text"
            value={item.version || '1.0'}
            onChange={(e) => handleFieldChange('version', e.target.value)}
            placeholder="1.0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <div className="mt-1">
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-md ${getVersionColor(item.version || '1.0')}`}>
              v{item.version || '1.0'}
            </span>
          </div>
        </div>
      </div>

      {/* Model Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Model Description *
        </label>
        <textarea
          value={item.model_description || ''}
          onChange={(e) => handleFieldChange('model_description', e.target.value)}
          placeholder="Detailed description of this data model..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Schema Definition */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Schema Definition (JSON)
        </label>
        <textarea
          value={schemaDefinition}
          onChange={(e) => handleSchemaChange(e.target.value)}
          placeholder='{"id": "string", "email": "string", "created_at": "datetime"}'
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
        />
      </div>

      {/* Relationships */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Relationships
        </label>
        <div className="space-y-2">
          {item.relationships?.map((relationship, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md text-sm">
                {relationship}
              </div>
              <button
                onClick={() => handleRemoveRelationship(index)}
                className="p-1 text-gray-500 hover:text-red-600 rounded transition-colors"
                title="Remove relationship"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newRelationship}
              onChange={(e) => setNewRelationship(e.target.value)}
              placeholder="Add relationship (e.g., belongs_to User, has_many Orders)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleAddRelationship()}
            />
            <button
              onClick={handleAddRelationship}
              className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              title="Add relationship"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Validation Rules */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Validation Rules *
        </label>
        <textarea
          value={item.validation_rules || ''}
          onChange={(e) => handleFieldChange('validation_rules', e.target.value)}
          placeholder="Validation rules and constraints for this data model..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Privacy Considerations */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Privacy Considerations
        </label>
        <textarea
          value={item.privacy_considerations || ''}
          onChange={(e) => handleFieldChange('privacy_considerations', e.target.value)}
          placeholder="Privacy, security, and compliance considerations..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Status and Owner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={item.status || 'draft'}
            onChange={(e) => handleFieldChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="draft">Draft</option>
            <option value="in_progress">In Progress</option>
            <option value="reviewed">Reviewed</option>
            <option value="implemented">Implemented</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Owner
          </label>
          <input
            type="text"
            value={item.owner || ''}
            onChange={(e) => handleFieldChange('owner', e.target.value)}
            placeholder="Data architect or team responsible"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Migration Strategy and Backup Strategy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Migration Strategy
          </label>
          <textarea
            value={item.migration_strategy || ''}
            onChange={(e) => handleFieldChange('migration_strategy', e.target.value)}
            placeholder="How to migrate existing data to this model..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Backup Strategy
          </label>
          <textarea
            value={item.backup_strategy || ''}
            onChange={(e) => handleFieldChange('backup_strategy', e.target.value)}
            placeholder="Backup and recovery strategy for this data..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Data Model Summary */}
      <div className={`p-3 border rounded-md ${getStatusColor(item.status || 'draft')}`}>
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4" />
          <span className="text-sm font-medium">
            Data Model Summary
          </span>
        </div>
        <div className="text-xs mt-1 space-y-1">
          <p>Type: {getModelTypeIcon(item.model_type || 'entity')} {item.model_type?.replace('_', ' ').toUpperCase()}</p>
          <p>Version: {item.version}</p>
          <p>Relationships: {formatRelationshipCount()}</p>
          <p>Privacy: {item.privacy_considerations ? 'Considerations documented' : 'No privacy notes'}</p>
          {item.owner && <p>Owner: {item.owner}</p>}
        </div>
      </div>
    </div>
  )
}