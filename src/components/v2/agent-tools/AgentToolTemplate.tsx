'use client'

import React from 'react'
import { X, Loader2 } from 'lucide-react'
import { AgentToolTemplate } from './types/agentTools'

export default function AgentToolTemplate({
  title,
  description,
  icon: Icon,
  color,
  children,
  isLoading = false,
  progress = 0,
  actions
}: AgentToolTemplate) {
  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-50 border-blue-200 text-blue-900',
      green: 'bg-green-50 border-green-200 text-green-900',
      orange: 'bg-orange-50 border-orange-200 text-orange-900',
      purple: 'bg-purple-50 border-purple-200 text-purple-900',
      red: 'bg-red-50 border-red-200 text-red-900',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900'
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.blue
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className={`p-4 border-b border-gray-200 ${getColorClasses(color)}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <Icon className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="text-sm opacity-75">{description}</p>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        {isLoading && (
          <div className="mt-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="relative">
                <Loader2 className="w-5 h-5 animate-spin text-current" />
                <div className="absolute inset-0 w-5 h-5 border-2 border-current border-opacity-20 rounded-full"></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Processing...</span>
                  <span className="text-sm font-semibold">{progress}%</span>
                </div>
                <div className="w-full bg-white bg-opacity-30 rounded-full h-2 shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-current to-current bg-opacity-90 h-2 rounded-full transition-all duration-500 ease-out shadow-sm"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {children}
      </div>

      {/* Footer Actions */}
      {actions && (
        <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50">
          <div className="flex items-center justify-end space-x-3">
            {actions.secondary && (
              <button
                onClick={actions.secondary.onClick}
                disabled={actions.secondary.disabled}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {actions.secondary.label}
              </button>
            )}
            {actions.primary && (
              <button
                onClick={actions.primary.onClick}
                disabled={actions.primary.disabled || actions.primary.loading}
                className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md transform hover:scale-[1.02]"
              >
                {actions.primary.loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{actions.primary.label}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}