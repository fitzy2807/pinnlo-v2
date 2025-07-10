'use client'

import React from 'react'
import { X, FolderPlus, Trash2 } from 'lucide-react'

interface BulkActionsToolbarProps {
  selectedCount: number
  onAddToGroup: () => void
  onDelete?: () => void
  onClearSelection: () => void
}

export default function BulkActionsToolbar({
  selectedCount,
  onAddToGroup,
  onDelete,
  onClearSelection
}: BulkActionsToolbarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white rounded-lg shadow-lg px-4 py-3 flex items-center gap-4 z-40">
      {/* Selection Count */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">
          {selectedCount} selected
        </span>
        <button
          onClick={onClearSelection}
          className="p-1 hover:bg-gray-800 rounded"
          title="Clear selection"
        >
          <X size={16} />
        </button>
      </div>

      <div className="w-px h-6 bg-gray-700" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onAddToGroup}
          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-md text-sm font-medium transition-colors"
        >
          <FolderPlus size={16} />
          Add to Group
        </button>

        {onDelete && (
          <button
            onClick={onDelete}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium transition-colors"
          >
            <Trash2 size={16} />
            Delete
          </button>
        )}
      </div>
    </div>
  )
}