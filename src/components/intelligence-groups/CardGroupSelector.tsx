'use client'

import React, { useState } from 'react'
import { Plus, Check, Folder } from 'lucide-react'
import { IntelligenceGroup } from '@/types/intelligence-groups'
import { useIntelligenceGroups } from '@/hooks/useIntelligenceGroups'

interface CardGroupSelectorProps {
  cardIds: string[]
  onClose: () => void
  onComplete?: () => void
}

export default function CardGroupSelector({ 
  cardIds, 
  onClose,
  onComplete 
}: CardGroupSelectorProps) {
  const { groups, addCardsToGroup } = useIntelligenceGroups()
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleGroup = (groupId: string) => {
    const newSelected = new Set(selectedGroups)
    if (newSelected.has(groupId)) {
      newSelected.delete(groupId)
    } else {
      newSelected.add(groupId)
    }
    setSelectedGroups(newSelected)
  }

  const handleAddToGroups = async () => {
    if (selectedGroups.size === 0) return

    setLoading(true)
    setError(null)

    try {
      // Add cards to each selected group
      const promises = Array.from(selectedGroups).map(groupId =>
        addCardsToGroup(groupId, cardIds)
      )
      
      await Promise.all(promises)
      
      onComplete?.()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to add cards to groups')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Add to Groups
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Select groups to add {cardIds.length} card{cardIds.length > 1 ? 's' : ''} to
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Group List */}
        <div className="flex-1 overflow-y-auto p-6">
          {groups.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No groups available. Create a group first.
            </div>
          ) : (
            <div className="space-y-2">
              {groups.map(group => {
                const isSelected = selectedGroups.has(group.id)
                
                return (
                  <label
                    key={group.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleGroup(group.id)}
                      className="sr-only"
                    />
                    
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-600'
                        : 'border-gray-300'
                    }`}>
                      {isSelected && <Check size={14} className="text-white" />}
                    </div>

                    <div 
                      className="w-8 h-8 rounded flex items-center justify-center"
                      style={{ backgroundColor: group.color + '20' }}
                    >
                      <Folder size={16} style={{ color: group.color }} />
                    </div>

                    <div className="flex-1">
                      <div className="font-medium text-sm text-black">{group.name}</div>
                      {group.description && (
                        <div className="text-xs text-gray-500 mt-0.5">{group.description}</div>
                      )}
                    </div>

                    <div className="text-xs text-gray-500">
                      {group.card_count} cards
                    </div>
                  </label>
                )
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {selectedGroups.size} group{selectedGroups.size !== 1 ? 's' : ''} selected
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-black hover:bg-gray-100 rounded-lg"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleAddToGroups}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={loading || selectedGroups.size === 0}
            >
              <Plus size={16} />
              {loading ? 'Adding...' : 'Add to Groups'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}