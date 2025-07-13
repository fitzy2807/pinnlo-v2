'use client'

import { Pin, Copy, Trash2, ExternalLink, Edit2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Strategy } from '@/types/database'
import { useState, useEffect } from 'react'

interface StrategyCardProps {
  strategy: Strategy
  strategiesHook: ReturnType<typeof import('@/hooks/useStrategies').useStrategies>
}

export default function StrategyCard({ strategy, strategiesHook }: StrategyCardProps) {
  const { deleteStrategy, updateStrategy, duplicateStrategy } = strategiesHook
  const [isPinned, setIsPinned] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    title: strategy.title || '',
    client: strategy.client || '',
    description: strategy.description || ''
  })

  // Load pinned state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pinnlo-pinned-strategies')
      if (saved) {
        const pinnedIds = JSON.parse(saved)
        setIsPinned(pinnedIds.includes(strategy.id))
      }
    } catch (error) {
      console.error('Error loading pinned state:', error)
    }
  }, [strategy.id])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'badge-success'
      case 'draft':
        return 'badge-neutral'
      case 'review':
        return 'badge-warning'
      case 'completed':
        return 'badge-success'
      default:
        return 'badge-neutral'
    }
  }

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const saved = localStorage.getItem('pinnlo-pinned-strategies')
      const pinnedIds = saved ? JSON.parse(saved) : []
      
      let newPinnedIds
      if (isPinned) {
        newPinnedIds = pinnedIds.filter((id: number) => id !== strategy.id)
      } else {
        newPinnedIds = [...pinnedIds, strategy.id]
      }
      
      localStorage.setItem('pinnlo-pinned-strategies', JSON.stringify(newPinnedIds))
      setIsPinned(!isPinned)
    } catch (error) {
      console.error('Error saving pinned state:', error)
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditing(true)
  }

  const handleSaveEdit = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!editForm.title.trim()) {
      alert('Please enter a strategy title')
      return
    }
    
    const success = await updateStrategy(strategy.id, editForm)
    if (success) {
      setIsEditing(false)
    }
  }

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditForm({
      title: strategy.title || '',
      client: strategy.client || '',
      description: strategy.description || ''
    })
    setIsEditing(false)
  }

  const handleDuplicate = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await duplicateStrategy(strategy.id)
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`Are you sure you want to delete "${strategy.title || 'Untitled Strategy'}"? This action cannot be undone.`)) {
      await deleteStrategy(strategy.id)
      // Remove from pinned if it was pinned
      if (isPinned) {
        try {
          const saved = localStorage.getItem('pinnlo-pinned-strategies')
          const pinnedIds = saved ? JSON.parse(saved) : []
          const newPinnedIds = pinnedIds.filter((id: number) => id !== strategy.id)
          localStorage.setItem('pinnlo-pinned-strategies', JSON.stringify(newPinnedIds))
        } catch (error) {
          console.error('Error updating pinned state after delete:', error)
        }
      }
    }
  }

  const handleCardClick = () => {
    window.location.href = `/strategies/${strategy.id}/workspace`
  }

  return (
    <div 
      className={`card interactive group cursor-pointer relative ${
        isPinned ? 'ring-2 ring-yellow-400 bg-yellow-50' : ''
      }`}
      onClick={isEditing ? undefined : handleCardClick}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between mb-4">
        {isEditing ? (
          <div className="flex-1 space-y-3">
            <input
              type="text"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="w-full px-3 py-2 text-sm font-semibold border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Strategy title"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
            <input
              type="text"
              value={editForm.client}
              onChange={(e) => setEditForm({ ...editForm, client: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Client/Project"
              onClick={(e) => e.stopPropagation()}
            />
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Description"
              rows={2}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-3 py-1.5 text-xs text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-w-0">
            <h3 className="text-h3 mb-1 truncate">
              {strategy.title || 'Untitled Strategy'}
            </h3>
            <p className="text-small text-gray-500 truncate">
              {strategy.client || 'No client specified'}
            </p>
          </div>
        )}
      </div>

      {/* Description */}
      {!isEditing && (
        <p className="text-body mb-4 truncate-2 min-h-[2.5rem]">
          {strategy.description || 'No description available'}
        </p>
      )}

      {/* Footer */}
      <div className="pt-4 border-t border-gray-200">
        {/* Top row - Status and Open link */}
        <div className="flex items-center justify-between mb-3">
          {/* Status Badge */}
          <span className={`badge ${getStatusColor(strategy.status || 'draft')}`}>
            <div className={`status-dot mr-1.5 ${
              strategy.status === 'active' ? 'status-active' : 
              strategy.status === 'review' ? 'status-warning' : 
              strategy.status === 'completed' ? 'status-active' : 
              'status-neutral'
            }`}></div>
            {strategy.status || 'draft'}
          </span>

          {/* Open Link - Only show when not editing */}
          {!isEditing && (
            <div className="flex items-center text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink size={14} className="mr-1" />
              <span className="text-small font-medium">Open</span>
            </div>
          )}
        </div>

        {/* Bottom row - Action Icons */}
        {!isEditing && (
          <div className="flex items-center justify-end gap-3">
            <button
              className={`transition-colors ${
                isPinned
                  ? 'text-yellow-600 hover:text-yellow-700'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              onClick={handlePin}
              title={isPinned ? 'Unpin strategy' : 'Pin strategy'}
            >
              <Pin size={16} className={isPinned ? 'fill-current' : ''} />
            </button>
            <button
              className="text-gray-400 hover:text-gray-600 transition-colors"
              onClick={handleEdit}
              title="Edit strategy"
            >
              <Edit2 size={16} />
            </button>
            <button
              className="text-gray-400 hover:text-gray-600 transition-colors"
              onClick={handleDuplicate}
              title="Duplicate strategy"
            >
              <Copy size={16} />
            </button>
            <button
              className="text-gray-400 hover:text-red-500 transition-colors"
              onClick={handleDelete}
              title="Delete strategy"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Last Modified */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-caption">
          Modified {formatDistanceToNow(new Date(strategy.updatedAt || strategy.createdAt || Date.now()), { addSuffix: true })}
        </p>
      </div>
    </div>
  )
}