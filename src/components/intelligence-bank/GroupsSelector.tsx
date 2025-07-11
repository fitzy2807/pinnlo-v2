/**
 * Intelligence Groups Selector
 * 
 * Add-on component for selecting target groups during text processing
 */

'use client'

import React, { useState } from 'react'
import { Plus, Folder, X } from 'lucide-react'
import { useIntelligenceGroups } from '@/hooks/useIntelligenceGroups'

interface GroupsSelectorProps {
  selectedGroups: string[]
  onGroupsChange: (groups: string[]) => void
  className?: string
}

export default function GroupsSelector({ 
  selectedGroups, 
  onGroupsChange, 
  className = '' 
}: GroupsSelectorProps) {
  const { groups, isLoading, createGroup } = useIntelligenceGroups()
  const [showNewGroupInput, setShowNewGroupInput] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || isCreating) return
    
    setIsCreating(true)
    try {
      const newGroup = await createGroup({
        name: newGroupName,
        description: `Group created during text processing`,
        color: '#3B82F6'
      })
      
      if (newGroup) {
        onGroupsChange([...selectedGroups, newGroup.id])
      }
      
      setNewGroupName('')
      setShowNewGroupInput(false)
    } catch (error) {
      console.error('Failed to create group:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const toggleGroup = (groupId: string) => {
    if (selectedGroups.includes(groupId)) {
      onGroupsChange(selectedGroups.filter(id => id !== groupId))
    } else {
      onGroupsChange([...selectedGroups, groupId])
    }
  }

  const removeGroup = (groupId: string) => {
    onGroupsChange(selectedGroups.filter(id => id !== groupId))
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-900">
          Add to Groups (Optional)
        </label>
        {selectedGroups.length > 0 && (
          <span className="text-xs text-blue-600">
            {selectedGroups.length} selected
          </span>
        )}
      </div>

      {/* Selected Groups Display */}
      {selectedGroups.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedGroups.map(groupId => {
            const group = groups.find(g => g.id === groupId)
            return group ? (
              <span 
                key={groupId}
                className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800"
              >
                <Folder className="h-3 w-3 mr-1" />
                {group.name}
                <button
                  onClick={() => removeGroup(groupId)}
                  className="ml-1 hover:text-blue-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ) : null
          })}
        </div>
      )}

      {/* Groups Selection */}
      <div className="border border-gray-200 rounded-md p-3 bg-white">
        {/* Existing Groups */}
        {!isLoading && groups.length > 0 ? (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {groups.map(group => (
              <label key={group.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedGroups.includes(group.id)}
                  onChange={() => toggleGroup(group.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-900">{group.name}</span>
                <span className="text-xs text-gray-600">({group.card_count} cards)</span>
              </label>
            ))}
          </div>
        ) : !isLoading ? (
          <p className="text-sm text-gray-600 text-center py-2">
            No groups available
          </p>
        ) : (
          <p className="text-sm text-gray-600 text-center py-2">
            Loading groups...
          </p>
        )}

        {/* Create New Group */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          {!showNewGroupInput ? (
            <button
              onClick={() => setShowNewGroupInput(true)}
              className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Group</span>
            </button>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Group name..."
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded text-gray-900 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateGroup()}
                autoFocus
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleCreateGroup}
                  disabled={!newGroupName.trim() || isCreating}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
                <button
                  onClick={() => {
                    setShowNewGroupInput(false)
                    setNewGroupName('')
                  }}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Helper Text */}
      {selectedGroups.length === 0 && (
        <p className="text-xs text-gray-600">
          Cards will be created in the target category only. Select groups to organize cards further.
        </p>
      )}
    </div>
  )
}
