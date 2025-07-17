'use client'

import React, { useState } from 'react'
import { Plus, Search, Grid3X3, List } from 'lucide-react'
import { useIntelligenceGroups } from '@/hooks/useIntelligenceGroups'
import GroupCard from './GroupCard'
import GroupCreator from './GroupCreator'
import GroupEditor from './GroupEditor'
import { IntelligenceGroup } from '@/types/intelligence-groups'

interface IntelligenceGroupsProps {
  onSelectGroup?: (group: IntelligenceGroup) => void
  selectedGroupId?: string
}

export default function IntelligenceGroups({ 
  onSelectGroup,
  selectedGroupId 
}: IntelligenceGroupsProps) {
  const { groups, loading, error, createGroup, updateGroup, deleteGroup } = useIntelligenceGroups()
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [showCreator, setShowCreator] = useState(false)
  const [editingGroup, setEditingGroup] = useState<IntelligenceGroup | null>(null)
  
  console.log('🔍 IntelligenceGroups render:', { 
    groups: groups.length, 
    loading, 
    error, 
    searchTerm,
    viewMode 
  })
  
  // Selection state for cards within groups
  const [selectedCardIds, setSelectedCardIds] = useState<Set<string>>(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Error loading groups: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Intelligence Groups
        </h3>
        <p className="text-sm text-gray-600">
          Organize intelligence cards into focused groups for strategic analysis
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search groups..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${
                viewMode === 'grid' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Grid view"
            >
              <Grid3X3 size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${
                viewMode === 'list' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="List view"
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {/* Create Button */}
        <button
          onClick={() => setShowCreator(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} />
          New Group
        </button>
      </div>

      {/* Groups Display */}
      {filteredGroups.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            {searchTerm ? 'No groups found matching your search' : 'No groups created yet'}
          </div>
          {!searchTerm && (
            <button
              onClick={() => setShowCreator(true)}
              className="text-indigo-600 hover:text-indigo-700"
            >
              Create your first group
            </button>
          )}
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-3'
        }>
          {filteredGroups.map(group => (
            <GroupCard
              key={group.id}
              group={group}
              isSelected={group.id === selectedGroupId}
              viewMode={viewMode}
              expandable={true}
              onSelect={() => onSelectGroup?.(group)}
              onEdit={() => setEditingGroup(group)}
              onDelete={() => {
                if (confirm('Are you sure you want to delete this group?')) {
                  deleteGroup(group.id)
                }
              }}
              selectedCardIds={selectedCardIds}
              setSelectedCardIds={setSelectedCardIds}
              isSelectionMode={isSelectionMode}
              setIsSelectionMode={setIsSelectionMode}
            />
          ))}
        </div>
      )}

      {/* Group Creator Modal */}
      {showCreator && (
        <GroupCreator
          onClose={() => setShowCreator(false)}
          onCreate={async (data) => {
            await createGroup(data)
            setShowCreator(false)
          }}
        />
      )}

      {/* Group Editor Modal */}
      {editingGroup && (
        <GroupEditor
          group={editingGroup}
          onClose={() => setEditingGroup(null)}
          onUpdate={async (data) => {
            await updateGroup(editingGroup.id, data)
            setEditingGroup(null)
          }}
        />
      )}
    </div>
  )
}