'use client'

import { Pin, Copy, Trash2, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Strategy } from '@/types/database'

interface StrategyCardProps {
  strategy: Strategy
  strategiesHook: ReturnType<typeof import('@/hooks/useStrategies').useStrategies>
}

export default function StrategyCard({ strategy, strategiesHook }: StrategyCardProps) {
  const { deleteStrategy } = strategiesHook

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

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this strategy?')) {
      await deleteStrategy(strategy.id)
    }
  }

  const handleCardClick = () => {
    window.location.href = `/strategies/${strategy.id}/workspace`
  }

  return (
    <div 
      className="card interactive group cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Card Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-h3 mb-1 truncate">
            {strategy.title || 'Untitled Strategy'}
          </h3>
          <p className="text-small text-gray-500 truncate">
            {strategy.client || 'No client specified'}
          </p>
        </div>
        
        <div className="ml-3 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              console.log('Pin clicked:', strategy.id)
            }}
            title="Pin strategy"
          >
            <Pin size={14} />
          </button>
          <button
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              console.log('Copy clicked:', strategy.id)
            }}
            title="Duplicate strategy"
          >
            <Copy size={14} />
          </button>
          <button
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors"
            onClick={handleDelete}
            title="Delete strategy"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="text-body mb-4 truncate-2 min-h-[2.5rem]">
        {strategy.description || 'No description available'}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
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

        {/* Open Link */}
        <div className="flex items-center text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
          <ExternalLink size={14} className="mr-1" />
          <span className="text-small font-medium">Open</span>
        </div>
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