'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { Plus, GripVertical, Edit, Trash2, Save, X } from 'lucide-react'
import { MultiItemFieldConfig, MultiItemOperation } from '@/types/prd-multi-item'

interface MultiItemFieldProps<T> {
  items: T[]
  config: MultiItemFieldConfig<T>
  onItemsChange: (operations: MultiItemOperation<T>[]) => void
  isEditMode: boolean
  maxHeight?: string
  aiContext?: string
  error?: string
  isRequired?: boolean
}

export default function MultiItemField<T>({
  items,
  config,
  onItemsChange,
  isEditMode,
  maxHeight = '400px',
  aiContext,
  error,
  isRequired = false
}: MultiItemFieldProps<T>) {
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [newItem, setNewItem] = useState<T>(config.createNew())
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null)

  // Sort items by order_index
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const aOrder = (a as any).order_index || 0
      const bOrder = (b as any).order_index || 0
      return aOrder - bOrder
    })
  }, [items])

  const handleAddNew = useCallback(() => {
    setIsAddingNew(true)
    setNewItem(config.createNew())
  }, [config])

  const handleSaveNew = useCallback(() => {
    const validation = config.validate(newItem)
    if (validation) {
      // Show validation error
      return
    }

    const operation: MultiItemOperation<T> = {
      type: 'create',
      item: {
        ...newItem,
        order_index: items.length
      } as T
    }

    onItemsChange([operation])
    setIsAddingNew(false)
    setNewItem(config.createNew())
  }, [newItem, config, onItemsChange, items.length])

  const handleCancelNew = useCallback(() => {
    setIsAddingNew(false)
    setNewItem(config.createNew())
  }, [config])

  const handleEdit = useCallback((itemId: string) => {
    setEditingItemId(itemId)
  }, [])

  const handleSaveEdit = useCallback((itemId: string, updates: Partial<T>) => {
    const operation: MultiItemOperation<T> = {
      type: 'update',
      itemId,
      updates
    }

    onItemsChange([operation])
    setEditingItemId(null)
  }, [onItemsChange])

  const handleDelete = useCallback((itemId: string) => {
    const operation: MultiItemOperation<T> = {
      type: 'delete',
      itemId
    }

    onItemsChange([operation])
  }, [onItemsChange])

  const handleDragStart = useCallback((index: number) => {
    if (!config.canReorder) return
    setDraggedIndex(index)
  }, [config.canReorder])

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDraggedOverIndex(index)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === dropIndex) return

    const newOrder = [...sortedItems]
    const draggedItem = newOrder[draggedIndex]
    newOrder.splice(draggedIndex, 1)
    newOrder.splice(dropIndex, 0, draggedItem)

    // Update order_index for all items
    const reorderedItems = newOrder.map((item, index) => ({
      ...item,
      order_index: index
    }))

    const operations: MultiItemOperation<T>[] = reorderedItems.map(item => ({
      type: 'update',
      itemId: (item as any).id,
      updates: { order_index: (item as any).order_index } as Partial<T>
    }))

    onItemsChange(operations)
    setDraggedIndex(null)
    setDraggedOverIndex(null)
  }, [draggedIndex, sortedItems, onItemsChange])

  const canAddMore = !config.maxItems || items.length < config.maxItems

  return (
    <div className="space-y-3">
      {/* Field Header */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          {config.fieldName}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
        {isEditMode && canAddMore && (
          <button
            onClick={handleAddNew}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
            disabled={isAddingNew}
          >
            <Plus className="w-3 h-3" />
            Add {config.itemType}
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
          {error}
        </div>
      )}

      {/* Items List */}
      <div 
        className="space-y-2 overflow-y-auto"
        style={{ maxHeight }}
      >
        {sortedItems.map((item, index) => (
          <MultiItemCard
            key={(item as any).id}
            item={item}
            config={config}
            isEditMode={isEditMode}
            isEditing={editingItemId === (item as any).id}
            onEdit={() => handleEdit((item as any).id)}
            onSave={(updates) => handleSaveEdit((item as any).id, updates)}
            onCancel={() => setEditingItemId(null)}
            onDelete={() => handleDelete((item as any).id)}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            isDragging={draggedIndex === index}
            isDraggedOver={draggedOverIndex === index}
            canReorder={config.canReorder}
          />
        ))}

        {/* Add New Item Form */}
        {isAddingNew && (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700">
                New {config.itemType}
              </h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveNew}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <Save className="w-3 h-3" />
                  Save
                </button>
                <button
                  onClick={handleCancelNew}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  <X className="w-3 h-3" />
                  Cancel
                </button>
              </div>
            </div>
            <MultiItemForm
              item={newItem}
              config={config}
              onChange={setNewItem}
              aiContext={aiContext}
            />
          </div>
        )}

        {/* Empty State */}
        {!isAddingNew && items.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No {config.itemType}s added yet</p>
            {isEditMode && canAddMore && (
              <button
                onClick={handleAddNew}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700"
              >
                Add your first {config.itemType}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Individual item card component
interface MultiItemCardProps<T> {
  item: T
  config: MultiItemFieldConfig<T>
  isEditMode: boolean
  isEditing: boolean
  onEdit: () => void
  onSave: (updates: Partial<T>) => void
  onCancel: () => void
  onDelete: () => void
  onDragStart: () => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  isDragging: boolean
  isDraggedOver: boolean
  canReorder: boolean
}

function MultiItemCard<T>({
  item,
  config,
  isEditMode,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging,
  isDraggedOver,
  canReorder
}: MultiItemCardProps<T>) {
  const [editedItem, setEditedItem] = useState<T>(item)

  const handleSave = useCallback(() => {
    const validation = config.validate(editedItem)
    if (validation) {
      // Show validation error
      return
    }
    onSave(editedItem)
  }, [editedItem, config, onSave])

  const handleCancel = useCallback(() => {
    setEditedItem(item)
    onCancel()
  }, [item, onCancel])

  return (
    <div
      className={`p-3 border rounded-md transition-all ${
        isDragging
          ? 'opacity-50 scale-95'
          : isDraggedOver
          ? 'border-blue-300 bg-blue-50'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
      draggable={canReorder && isEditMode}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {isEditing ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">
              Edit {config.itemType}
            </h4>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Save className="w-3 h-3" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <X className="w-3 h-3" />
                Cancel
              </button>
            </div>
          </div>
          <MultiItemForm
            item={editedItem}
            config={config}
            onChange={setEditedItem}
          />
        </div>
      ) : (
        <div className="flex items-start gap-3">
          {canReorder && isEditMode && (
            <div className="flex-shrink-0 pt-0.5">
              <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {config.getDisplayTitle(item)}
                </h4>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {config.getDisplayPreview(item)}
                </p>
              </div>
              
              {isEditMode && (
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={onEdit}
                    className="p-1 text-gray-500 hover:text-blue-600 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                  <button
                    onClick={onDelete}
                    className="p-1 text-gray-500 hover:text-red-600 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Form component for creating/editing items
interface MultiItemFormProps<T> {
  item: T
  config: MultiItemFieldConfig<T>
  onChange: (item: T) => void
  aiContext?: string
}

function MultiItemForm<T>({
  item,
  config,
  onChange,
  aiContext
}: MultiItemFormProps<T>) {
  // Import form components dynamically based on item type
  const getFormComponent = () => {
    switch (config.itemType) {
      // PRD Form Components
      case 'User Story':
        const UserStoryForm = require('./forms/UserStoryForm').default
        return <UserStoryForm item={item} onChange={onChange} aiContext={aiContext} />
      
      case 'Functional Requirement':
        const FunctionalRequirementForm = require('./forms/FunctionalRequirementForm').default
        return <FunctionalRequirementForm item={item} onChange={onChange} aiContext={aiContext} />
      
      case 'Risk':
        const RiskForm = require('./forms/RiskForm').default
        return <RiskForm item={item} onChange={onChange} aiContext={aiContext} />
      
      // TRD Form Components
      case 'API Endpoint':
        const ApiEndpointForm = require('./forms/ApiEndpointForm').default
        return <ApiEndpointForm item={item} onChange={onChange} aiContext={aiContext} />
      
      case 'Security Control':
        const SecurityControlForm = require('./forms/SecurityControlForm').default
        return <SecurityControlForm item={item} onChange={onChange} aiContext={aiContext} />
      
      case 'Performance Requirement':
        const PerformanceRequirementForm = require('./forms/PerformanceRequirementForm').default
        return <PerformanceRequirementForm item={item} onChange={onChange} aiContext={aiContext} />
      
      case 'Test Case':
        const TestCaseForm = require('./forms/TestCaseForm').default
        return <TestCaseForm item={item} onChange={onChange} aiContext={aiContext} />
      
      case 'Implementation Standard':
        const ImplementationStandardForm = require('./forms/ImplementationStandardForm').default
        return <ImplementationStandardForm item={item} onChange={onChange} aiContext={aiContext} />
      
      case 'Infrastructure Component':
        const InfrastructureComponentForm = require('./forms/InfrastructureComponentForm').default
        return <InfrastructureComponentForm item={item} onChange={onChange} aiContext={aiContext} />
      
      case 'Data Model':
        const DataModelForm = require('./forms/DataModelForm').default
        return <DataModelForm item={item} onChange={onChange} aiContext={aiContext} />
      
      // Add more form types as needed
      default:
        return (
          <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-md">
            <p>Form component for {config.itemType} not implemented yet</p>
            <p>Please implement the specific form component</p>
          </div>
        )
    }
  }

  return <div>{getFormComponent()}</div>
}

export { MultiItemCard, MultiItemForm }