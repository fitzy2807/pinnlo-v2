'use client'

import React, { useState, useEffect } from 'react'
import { X, Save, Plus, Trash2, CheckCircle, Edit, Target, User, Calendar, Flag } from 'lucide-react'

interface TaskEditModalProps {
  task: any
  isOpen: boolean
  onClose: () => void
  onSave: (updates: any) => void
  onDelete?: () => void
}

export default function TaskEditModal({ task, isOpen, onClose, onSave, onDelete }: TaskEditModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: { objective: '', businessValue: '' },
    metadata: {
      status: 'Not Started',
      priority: 'Medium',
      effort: 3,
      assignee: '',
      taskId: '',
      tags: []
    },
    acceptanceCriteria: [],
    dependencies: { blocks: [], blockedBy: [] },
    technicalImplementation: { filesToCreate: [] },
    definitionOfDone: []
  })

  const [newCriteria, setNewCriteria] = useState('')
  const [newDependency, setNewDependency] = useState({ type: 'blocks', value: '' })
  const [newFile, setNewFile] = useState('')
  const [newDod, setNewDod] = useState('')

  useEffect(() => {
    if (task && isOpen) {
      // Extract data from both top level and card_data
      const cardData = task.card_data || {}
      
      setFormData({
        title: task.title || '',
        description: {
          objective: cardData.description?.objective || task.description || '',
          businessValue: cardData.description?.businessValue || ''
        },
        metadata: {
          status: cardData.metadata?.status || task.status || 'Not Started',
          priority: cardData.metadata?.priority || task.priority || 'Medium',
          effort: cardData.metadata?.effort || task.effort || 3,
          assignee: cardData.metadata?.assignee || task.assignee || '',
          taskId: cardData.taskId || task.id || '',
          tags: cardData.metadata?.tags || cardData.tags || task.tags || []
        },
        acceptanceCriteria: cardData.acceptanceCriteria || task.acceptanceCriteria || [],
        dependencies: {
          blocks: cardData.dependencies?.blocks || task.dependencies?.blocks || [],
          blockedBy: cardData.dependencies?.blockedBy || task.dependencies?.blockedBy || []
        },
        technicalImplementation: {
          filesToCreate: cardData.technicalImplementation?.filesToCreate || task.technicalImplementation?.filesToCreate || []
        },
        definitionOfDone: cardData.definitionOfDone || task.definitionOfDone || []
      })
    }
  }, [task, isOpen])

  const handleSave = () => {
    onSave(formData)
    onClose()
  }

  const addCriteria = () => {
    if (newCriteria.trim()) {
      setFormData(prev => ({
        ...prev,
        acceptanceCriteria: [...prev.acceptanceCriteria, {
          criterion: newCriteria.trim(),
          status: 'Pending'
        }]
      }))
      setNewCriteria('')
    }
  }

  const removeCriteria = (index: number) => {
    setFormData(prev => ({
      ...prev,
      acceptanceCriteria: prev.acceptanceCriteria.filter((_, i) => i !== index)
    }))
  }

  const updateCriteria = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      acceptanceCriteria: prev.acceptanceCriteria.map((criteria, i) => 
        i === index ? { ...criteria, [field]: value } : criteria
      )
    }))
  }

  const addDependency = () => {
    if (newDependency.value.trim()) {
      setFormData(prev => ({
        ...prev,
        dependencies: {
          ...prev.dependencies,
          [newDependency.type]: [...prev.dependencies[newDependency.type as keyof typeof prev.dependencies], newDependency.value.trim()]
        }
      }))
      setNewDependency({ ...newDependency, value: '' })
    }
  }

  const removeDependency = (type: 'blocks' | 'blockedBy', index: number) => {
    setFormData(prev => ({
      ...prev,
      dependencies: {
        ...prev.dependencies,
        [type]: prev.dependencies[type].filter((_, i) => i !== index)
      }
    }))
  }

  const addFile = () => {
    if (newFile.trim()) {
      setFormData(prev => ({
        ...prev,
        technicalImplementation: {
          ...prev.technicalImplementation,
          filesToCreate: [...prev.technicalImplementation.filesToCreate, {
            path: newFile.trim(),
            status: 'Pending'
          }]
        }
      }))
      setNewFile('')
    }
  }

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      technicalImplementation: {
        ...prev.technicalImplementation,
        filesToCreate: prev.technicalImplementation.filesToCreate.filter((_, i) => i !== index)
      }
    }))
  }

  const updateFile = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      technicalImplementation: {
        ...prev.technicalImplementation,
        filesToCreate: prev.technicalImplementation.filesToCreate.map((file, i) => 
          i === index ? { ...file, [field]: value } : file
        )
      }
    }))
  }

  const addDod = () => {
    if (newDod.trim()) {
      setFormData(prev => ({
        ...prev,
        definitionOfDone: [...prev.definitionOfDone, {
          criterion: newDod.trim(),
          status: 'Pending'
        }]
      }))
      setNewDod('')
    }
  }

  const removeDod = (index: number) => {
    setFormData(prev => ({
      ...prev,
      definitionOfDone: prev.definitionOfDone.filter((_, i) => i !== index)
    }))
  }

  const updateDod = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      definitionOfDone: prev.definitionOfDone.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Target className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-black">Edit Task</h2>
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                {formData.metadata.taskId || 'No ID'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="px-3 py-1.5 text-sm text-red-600 border border-red-300 rounded-md hover:bg-red-50"
                >
                  Delete Task
                </button>
              )}
              <button
                onClick={handleSave}
                className="px-4 py-1.5 text-sm bg-black text-white rounded-md hover:bg-gray-800 flex items-center space-x-1"
              >
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-black mb-2">Task Title</label>
                <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black"
                placeholder="Enter task title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Status</label>
                <select
                  value={formData.metadata.status}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    metadata: { ...prev.metadata, status: e.target.value }
                  }))}
                  className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Review">Review</option>
                  <option value="Done">Done</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Priority</label>
                <select
                  value={formData.metadata.priority}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    metadata: { ...prev.metadata, priority: e.target.value }
                  }))}
                  className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Effort (Story Points)</label>
                <input
                  type="number"
                  min="1"
                  max="21"
                  value={formData.metadata.effort}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    metadata: { ...prev.metadata, effort: parseInt(e.target.value) || 1 }
                  }))}
                  className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Assignee</label>
                <input
                  type="text"
                  value={formData.metadata.assignee}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    metadata: { ...prev.metadata, assignee: e.target.value }
                  }))}
                  className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black"
                  placeholder="Enter assignee name..."
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">Description</label>
              <textarea
                value={formData.description.objective}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  description: { ...prev.description, objective: e.target.value }
                }))}
                rows={3}
                className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black"
                placeholder="Enter task description..."
              />
            </div>

            {/* Business Value */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">Business Value</label>
              <input
                type="text"
                value={formData.description.businessValue}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  description: { ...prev.description, businessValue: e.target.value }
                }))}
                className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black"
                placeholder="Enter business value..."
              />
            </div>

            {/* Acceptance Criteria */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-black">Acceptance Criteria</label>
              </div>
              <div className="space-y-2 mb-3">
                {formData.acceptanceCriteria.map((criteria: any, index: number) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                    <button
                      onClick={() => updateCriteria(index, 'status', criteria.status === 'Complete' ? 'Pending' : 'Complete')}
                      className={`w-5 h-5 ${criteria.status === 'Complete' ? 'text-green-600' : 'text-gray-400'}`}
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <input
                      type="text"
                      value={criteria.criterion || criteria}
                      onChange={(e) => updateCriteria(index, 'criterion', e.target.value)}
                      className={`flex-1 px-2 py-1 text-sm bg-white border border-gray-300 rounded ${
                        criteria.status === 'Complete' ? 'line-through text-gray-500' : 'text-black'
                      }`}
                    />
                    <button
                      onClick={() => removeCriteria(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newCriteria}
                  onChange={(e) => setNewCriteria(e.target.value)}
                  placeholder="Add new acceptance criteria..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black"
                  onKeyPress={(e) => e.key === 'Enter' && addCriteria()}
                />
                <button
                  onClick={addCriteria}
                  className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Dependencies */}
            <div>
              <label className="block text-sm font-medium text-black mb-3">Dependencies</label>
              
              {/* Blocked By */}
              <div className="mb-4">
                <div className="text-sm font-medium text-red-700 mb-2">Blocked By:</div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.dependencies.blockedBy.map((dep: string, index: number) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                      {dep}
                      <button
                        onClick={() => removeDependency('blockedBy', index)}
                        className="ml-1 text-red-600 hover:text-red-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Blocks */}
              <div className="mb-4">
                <div className="text-sm font-medium text-yellow-700 mb-2">Blocks:</div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.dependencies.blocks.map((dep: string, index: number) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                      {dep}
                      <button
                        onClick={() => removeDependency('blocks', index)}
                        className="ml-1 text-yellow-600 hover:text-yellow-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Add Dependency */}
              <div className="flex space-x-2">
                <select
                  value={newDependency.type}
                  onChange={(e) => setNewDependency(prev => ({ ...prev, type: e.target.value }))}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black"
                >
                  <option value="blocks">This blocks</option>
                  <option value="blockedBy">Blocked by</option>
                </select>
                <input
                  type="text"
                  value={newDependency.value}
                  onChange={(e) => setNewDependency(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="Enter task ID..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black"
                  onKeyPress={(e) => e.key === 'Enter' && addDependency()}
                />
                <button
                  onClick={addDependency}
                  className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Files to Create */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-black">Files to Create</label>
              </div>
              <div className="space-y-2 mb-3">
                {formData.technicalImplementation.filesToCreate.map((file: any, index: number) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                    <button
                      onClick={() => updateFile(index, 'status', file.status === 'Complete' ? 'Pending' : 'Complete')}
                      className={`w-5 h-5 ${file.status === 'Complete' ? 'text-green-600' : 'text-gray-400'}`}
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <input
                      type="text"
                      value={file.path || file}
                      onChange={(e) => updateFile(index, 'path', e.target.value)}
                      className={`flex-1 px-2 py-1 text-sm bg-white border border-gray-300 rounded ${
                        file.status === 'Complete' ? 'line-through text-gray-500' : 'text-black'
                      }`}
                    />
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newFile}
                  onChange={(e) => setNewFile(e.target.value)}
                  placeholder="Add file path..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black"
                  onKeyPress={(e) => e.key === 'Enter' && addFile()}
                />
                <button
                  onClick={addFile}
                  className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Definition of Done */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-black">Definition of Done</label>
              </div>
              <div className="space-y-2 mb-3">
                {formData.definitionOfDone.map((item: any, index: number) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                    <button
                      onClick={() => updateDod(index, 'status', item.status === 'Complete' ? 'Pending' : 'Complete')}
                      className={`w-5 h-5 ${item.status === 'Complete' ? 'text-green-600' : 'text-gray-400'}`}
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <input
                      type="text"
                      value={item.criterion || item}
                      onChange={(e) => updateDod(index, 'criterion', e.target.value)}
                      className={`flex-1 px-2 py-1 text-sm bg-white border border-gray-300 rounded ${
                        item.status === 'Complete' ? 'line-through text-gray-500' : 'text-black'
                      }`}
                    />
                    <button
                      onClick={() => removeDod(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newDod}
                  onChange={(e) => setNewDod(e.target.value)}
                  placeholder="Add definition of done item..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-black focus:border-black"
                  onKeyPress={(e) => e.key === 'Enter' && addDod()}
                />
                <button
                  onClick={addDod}
                  className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
