'use client'

import { Search, Filter, SortAsc, Settings, Plus, Zap } from 'lucide-react'

interface Blueprint {
  id: string
  name: string
  icon: string
  count: number
}

interface PageControllerProps {
  blueprint?: Blueprint
  onAddCard?: () => void
  onQuickAdd?: () => void
  onGenerateAI?: () => void
}

export default function PageController({ blueprint, onAddCard, onQuickAdd, onGenerateAI }: PageControllerProps) {
  if (!blueprint) return null

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      {/* Page Title Section */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-1.5">
          <span className="text-2xl">{blueprint.icon}</span>
          <h1 className="text-xl font-bold text-gray-900">{blueprint.name}</h1>
        </div>
        <p className="text-gray-600 text-sm max-w-2xl">
          {blueprint.id === 'strategicContext' && 'Define the strategic foundation and context for your strategy'}
          {blueprint.id === 'vision-statement' && 'Craft your compelling vision statement that guides your organization'}
          {blueprint.id === 'value-propositions' && 'Define your unique value propositions that differentiate you from competitors'}
          {blueprint.id === 'personas' && 'Create detailed user personas to understand your target audience'}
          {blueprint.id === 'okrs' && 'Set objectives and key results to measure your strategic progress'}
          {blueprint.id === 'strategy-analytics' && 'Analyze strategy performance with data-driven insights'}
          {blueprint.id === 'workspace-settings' && 'Configure workspace preferences and team settings'}
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        {/* Left: Search */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search cards..."
              className="pl-8 pr-3 py-1.5 w-64 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right: Filter, Sort, Generate, Add */}
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter size={14} />
            <span>Filter</span>
          </button>

          <button className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <SortAsc size={14} />
            <span>Sort</span>
          </button>

          <button 
            className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => {
              console.log('⚡ PageController: Generate Card clicked');
              onGenerateAI && onGenerateAI();
            }}
          >
            <Settings size={14} />
            <span>Generate Card</span>
          </button>

          {onQuickAdd && (
            <button 
              className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              onClick={onQuickAdd}
            >
              <Zap size={14} />
              <span>Quick Add</span>
            </button>
          )}

          <button 
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
            onClick={() => {
              console.log('📝 PageController: Add Card clicked');
              onAddCard && onAddCard();
            }}
          >
            <Plus size={14} />
            <span>Add Card</span>
          </button>
        </div>
      </div>
    </div>
  )
}
