'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useAutoSave, useValidation, useKeyboardShortcuts } from '@/components/shared/cards'
import { AlertCircle, CheckCircle, Clock, Save } from 'lucide-react'
import { CardData } from '@/types/card'
import { 
  TRDMultiItemData, 
  TRDApiEndpoint, 
  TRDSecurityControl, 
  TRDPerformanceRequirement,
  TRDTestCase,
  TRDImplementationStandard,
  TRDInfrastructureComponent,
  TRDDataModel,
  MultiItemOperation 
} from '@/types/trd-multi-item'
import { trdMultiItemConfigs } from '@/components/shared/multi-item-field/configs/trdConfigs'
import MultiItemField from '@/components/shared/multi-item-field/MultiItemField'

interface TRDCardMultiItemProps {
  card: CardData
  isEditMode: boolean
  onSave: (updates: Partial<CardData>) => void
  onCancel: () => void
  onToggleEdit: () => void
  className?: string
}

export default function TRDCardMultiItem({
  card,
  isEditMode,
  onSave,
  onCancel,
  onToggleEdit,
  className = ''
}: TRDCardMultiItemProps) {
  // State for all multi-item fields
  const [multiItemData, setMultiItemData] = useState<TRDMultiItemData>({
    api_endpoints: [],
    security_controls: [],
    performance_requirements: [],
    test_cases: [],
    implementation_standards: [],
    infrastructure_components: [],
    data_models: []
  })

  // Load existing multi-item data
  useEffect(() => {
    if (card.multi_item_data) {
      setMultiItemData(card.multi_item_data as TRDMultiItemData)
    }
  }, [card.multi_item_data])

  // Auto-save functionality
  const { lastSaved, saveStatus } = useAutoSave(
    { ...card, multi_item_data: multiItemData },
    onSave,
    { 
      enabled: isEditMode,
      debounceMs: 1000,
      arrayFields: ['api_endpoints', 'security_controls', 'performance_requirements', 'test_cases', 'implementation_standards', 'infrastructure_components', 'data_models']
    }
  )

  // Validation
  const { errors, validateField } = useValidation({
    title: { required: true, minLength: 3 },
    description: { required: true, minLength: 10 }
  })

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'mod+s': (e) => {
      e.preventDefault()
      if (isEditMode) {
        onSave({ ...card, multi_item_data: multiItemData })
      }
    },
    'mod+e': (e) => {
      e.preventDefault()
      onToggleEdit()
    },
    'escape': (e) => {
      e.preventDefault()
      if (isEditMode) {
        onCancel()
      }
    }
  })

  // Handle multi-item changes
  const handleMultiItemChange = useCallback((
    fieldName: keyof TRDMultiItemData,
    operations: MultiItemOperation<any>[]
  ) => {
    setMultiItemData(prev => {
      const newData = { ...prev }
      const currentItems = newData[fieldName] || []
      
      operations.forEach(op => {
        switch (op.type) {
          case 'create':
            newData[fieldName] = [...currentItems, op.item]
            break
          case 'update':
            newData[fieldName] = currentItems.map(item => 
              item.id === op.itemId ? { ...item, ...op.updates } : item
            )
            break
          case 'delete':
            newData[fieldName] = currentItems.filter(item => item.id !== op.itemId)
            break
        }
      })
      
      return newData
    })
  }, [])

  // Save status indicator
  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />
      case 'saved':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with save status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-gray-900">
            {card.title || 'Technical Requirements Document'}
          </h2>
          {getSaveStatusIcon()}
        </div>
        {lastSaved && (
          <span className="text-sm text-gray-500">
            Last saved: {new Date(lastSaved).toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Basic Information */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          {isEditMode ? (
            <input
              type="text"
              value={card.title || ''}
              onChange={(e) => {
                validateField('title', e.target.value)
                onSave({ title: e.target.value })
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter TRD title..."
            />
          ) : (
            <p className="text-gray-900 font-medium">{card.title || 'Untitled TRD'}</p>
          )}
          {errors.title && (
            <p className="text-red-600 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          {isEditMode ? (
            <textarea
              value={card.description || ''}
              onChange={(e) => {
                validateField('description', e.target.value)
                onSave({ description: e.target.value })
              }}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter TRD description..."
            />
          ) : (
            <p className="text-gray-700 whitespace-pre-wrap">{card.description || 'No description provided'}</p>
          )}
          {errors.description && (
            <p className="text-red-600 text-sm mt-1">{errors.description}</p>
          )}
        </div>
      </div>

      {/* Multi-Item Fields */}
      <div className="space-y-6">
        {/* API Endpoints */}
        <MultiItemField<TRDApiEndpoint>
          items={multiItemData.api_endpoints}
          config={trdMultiItemConfigs.api_endpoints}
          onItemsChange={(operations) => handleMultiItemChange('api_endpoints', operations)}
          isEditMode={isEditMode}
          maxHeight="500px"
          aiContext={`TRD: ${card.title} - API Endpoints section`}
        />

        {/* Security Controls */}
        <MultiItemField<TRDSecurityControl>
          items={multiItemData.security_controls}
          config={trdMultiItemConfigs.security_controls}
          onItemsChange={(operations) => handleMultiItemChange('security_controls', operations)}
          isEditMode={isEditMode}
          maxHeight="500px"
          aiContext={`TRD: ${card.title} - Security Controls section`}
        />

        {/* Performance Requirements */}
        <MultiItemField<TRDPerformanceRequirement>
          items={multiItemData.performance_requirements}
          config={trdMultiItemConfigs.performance_requirements}
          onItemsChange={(operations) => handleMultiItemChange('performance_requirements', operations)}
          isEditMode={isEditMode}
          maxHeight="500px"
          aiContext={`TRD: ${card.title} - Performance Requirements section`}
        />

        {/* Test Cases */}
        <MultiItemField<TRDTestCase>
          items={multiItemData.test_cases}
          config={trdMultiItemConfigs.test_cases}
          onItemsChange={(operations) => handleMultiItemChange('test_cases', operations)}
          isEditMode={isEditMode}
          maxHeight="500px"
          aiContext={`TRD: ${card.title} - Test Cases section`}
        />

        {/* Implementation Standards */}
        <MultiItemField<TRDImplementationStandard>
          items={multiItemData.implementation_standards}
          config={trdMultiItemConfigs.implementation_standards}
          onItemsChange={(operations) => handleMultiItemChange('implementation_standards', operations)}
          isEditMode={isEditMode}
          maxHeight="500px"
          aiContext={`TRD: ${card.title} - Implementation Standards section`}
        />

        {/* Infrastructure Components */}
        <MultiItemField<TRDInfrastructureComponent>
          items={multiItemData.infrastructure_components}
          config={trdMultiItemConfigs.infrastructure_components}
          onItemsChange={(operations) => handleMultiItemChange('infrastructure_components', operations)}
          isEditMode={isEditMode}
          maxHeight="500px"
          aiContext={`TRD: ${card.title} - Infrastructure Components section`}
        />

        {/* Data Models */}
        <MultiItemField<TRDDataModel>
          items={multiItemData.data_models}
          config={trdMultiItemConfigs.data_models}
          onItemsChange={(operations) => handleMultiItemChange('data_models', operations)}
          isEditMode={isEditMode}
          maxHeight="500px"
          aiContext={`TRD: ${card.title} - Data Models section`}
        />
      </div>

      {/* Technical Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Technical Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">API Endpoints:</span>
            <p className="text-gray-900">{multiItemData.api_endpoints.length}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Security Controls:</span>
            <p className="text-gray-900">{multiItemData.security_controls.length}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Performance Requirements:</span>
            <p className="text-gray-900">{multiItemData.performance_requirements.length}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Test Cases:</span>
            <p className="text-gray-900">{multiItemData.test_cases.length}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Implementation Standards:</span>
            <p className="text-gray-900">{multiItemData.implementation_standards.length}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Infrastructure Components:</span>
            <p className="text-gray-900">{multiItemData.infrastructure_components.length}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Data Models:</span>
            <p className="text-gray-900">{multiItemData.data_models.length}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Total Items:</span>
            <p className="text-gray-900 font-semibold">
              {Object.values(multiItemData).reduce((total, items) => total + items.length, 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      {isEditMode && (
        <div className="bg-blue-50 p-3 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Keyboard shortcuts:</strong> Ctrl+S (Save), Ctrl+E (Edit), Escape (Cancel)
          </p>
        </div>
      )}
    </div>
  )
}