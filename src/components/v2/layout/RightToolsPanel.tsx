'use client'

import { 
  Plus, 
  Zap, 
  Brain, 
  Search, 
  BarChart, 
  Settings, 
  Bot,
  Wand2,
  Database,
  Workflow
} from 'lucide-react'

interface RightToolsPanelProps {
  selectedHub: string
  selectedSection: string
  onToolSelect: (toolId: string) => void
  strategy: any
}

const TOOL_CATEGORIES = {
  creation: [
    { id: 'quickAdd', name: 'Quick Add', icon: Plus, description: 'Add new cards quickly' },
    { id: 'cardCreator', name: 'Card Creator', icon: Wand2, description: 'AI-powered card generation' },
    { id: 'bulkImport', name: 'Bulk Import', icon: Database, description: 'Import multiple cards' }
  ],
  analysis: [
    { id: 'aiAnalysis', name: 'AI Analysis', icon: Brain, description: 'Analyze card content' },
    { id: 'insights', name: 'Insights', icon: BarChart, description: 'Generate insights' },
    { id: 'relationships', name: 'Relationships', icon: Workflow, description: 'Find connections' }
  ],
  intelligence: [
    { id: 'webSearch', name: 'Web Research', icon: Search, description: 'Research online' },
    { id: 'competitorAnalysis', name: 'Competitor Analysis', icon: Bot, description: 'Analyze competitors' },
    { id: 'marketData', name: 'Market Data', icon: BarChart, description: 'Get market insights' }
  ],
  automation: [
    { id: 'workflows', name: 'Workflows', icon: Workflow, description: 'Automate processes' },
    { id: 'templates', name: 'Templates', icon: Settings, description: 'Use templates' },
    { id: 'agents', name: 'AI Agents', icon: Bot, description: 'Deploy AI agents' }
  ]
}

export default function RightToolsPanel({ 
  selectedHub, 
  selectedSection, 
  onToolSelect,
  strategy 
}: RightToolsPanelProps) {
  
  const getContextualTools = () => {
    // Return different tools based on selected hub/section
    if (selectedHub === 'intelligence') {
      return ['creation', 'intelligence', 'analysis']
    } else if (selectedHub === 'strategy') {
      return ['creation', 'analysis', 'automation']
    } else if (selectedHub === 'development') {
      return ['creation', 'automation', 'analysis']
    } else {
      return ['creation', 'analysis', 'intelligence', 'automation']
    }
  }

  const relevantCategories = getContextualTools()

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Tools</h2>
        <p className="text-sm text-gray-500">
          {selectedHub.charAt(0).toUpperCase() + selectedHub.slice(1)} tools
        </p>
      </div>

      {/* Tool Categories */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {relevantCategories.map((categoryId) => {
          const category = TOOL_CATEGORIES[categoryId as keyof typeof TOOL_CATEGORIES]
          const categoryName = categoryId.charAt(0).toUpperCase() + categoryId.slice(1)
          
          return (
            <div key={categoryId} className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                {categoryName}
              </h3>
              
              <div className="space-y-2">
                {category.map((tool) => {
                  const Icon = tool.icon
                  
                  return (
                    <button
                      key={tool.id}
                      onClick={() => onToolSelect(tool.id)}
                      className="w-full p-3 text-left rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                          <Icon className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {tool.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {tool.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-gray-200">
        <button 
          onClick={() => onToolSelect('quickAdd')}
          className="w-full flex items-center justify-center space-x-2 p-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Quick Add</span>
        </button>
      </div>
    </div>
  )
}