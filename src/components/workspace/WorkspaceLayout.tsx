'use client'

import { useState } from 'react'
import { Search, Plus, Filter, SortDesc, Settings, ArrowLeft } from 'lucide-react'
import Header from '@/components/Header'
import { MANDATORY_BLUEPRINTS, getBlueprintsByCategory } from '@/utils/blueprintConstants'
import { BLUEPRINT_REGISTRY } from '@/components/blueprints/registry'

interface WorkspaceLayoutProps {
  strategyId: string
}

export default function WorkspaceLayout({ strategyId }: WorkspaceLayoutProps) {
  const [activeBlueprint, setActiveBlueprint] = useState(MANDATORY_BLUEPRINTS[0])

  // Generate blueprints from registry
  const strategyBlueprints = getBlueprintsByCategory('Strategy Hub')
  const blueprints = strategyBlueprints.slice(0, 5).map(id => {
    const config = BLUEPRINT_REGISTRY[id]
    return {
      id,
      name: config?.name || id,
      icon: config?.icon || '📋',
      count: 0 // This would be populated from actual data
    }
  })

  const getBlueprintInfo = (blueprintId: string) => {
    const config = BLUEPRINT_REGISTRY[blueprintId]
    return config ? {
      title: config.name,
      description: config.description
    } : { title: 'Blueprint', description: '' }
  }

  const activeInfo = getBlueprintInfo(activeBlueprint)
  const activeBlueprint_ = blueprints.find(b => b.id === activeBlueprint)

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header />
      
      <div className="pt-header flex h-screen">
        {/* Left Sidebar: Blueprint Navigation */}
        <div className="sidebar">
          <div className="p-6">
            {/* Back to Dashboard */}
            <a 
              href="/"
              className="flex items-center space-x-2 text-secondary-600 hover:text-secondary-900 mb-6 transition-colors"
            >
              <ArrowLeft size={16} />
              <span className="text-small font-medium">Back to Dashboard</span>
            </a>

            <div className="mb-6">
              <h2 className="text-caption uppercase tracking-wide font-semibold text-secondary-500 mb-4">
                Strategy Blueprints
              </h2>
              <nav className="space-y-1">
                {blueprints.map((blueprint) => (
                  <button
                    key={blueprint.id}
                    onClick={() => setActiveBlueprint(blueprint.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all flex items-center justify-between group ${
                      activeBlueprint === blueprint.id
                        ? 'bg-primary-50 text-primary-700 border border-primary-200' 
                        : 'text-secondary-700 hover:bg-white hover:shadow-card'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{blueprint.icon}</span>
                      <span className="text-small font-medium">{blueprint.name}</span>
                    </div>
                    <span className={`badge ${
                      activeBlueprint === blueprint.id ? 'badge-success' : 'badge-neutral'
                    }`}>
                      {blueprint.count}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
            
            <div className="pt-6 border-t border-secondary-200">
              <div className="space-y-2">
                <button className="w-full text-left p-3 text-small text-secondary-600 hover:bg-white rounded-lg transition-colors">
                  📊 Strategy Analytics
                </button>
                <button className="w-full text-left p-3 text-small text-secondary-600 hover:bg-white rounded-lg transition-colors">
                  ⚙️ Workspace Settings
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Blueprint Manager Bar */}
          <div className="bg-primary-50 border-b border-primary-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-h3 text-primary-900 mb-1">
                  Strategy #{strategyId}
                </h1>
                <p className="text-small text-primary-700">
                  Personalise your strategy workspace by selecting the Strategy Blueprints you want to build your strategy.
                </p>
              </div>
              <button className="btn btn-primary btn-md">
                Manage Strategy Blueprints
              </button>
            </div>
          </div>

          {/* Page Controller */}
          <div className="border-b border-secondary-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-caption text-secondary-500 mb-1">
                  Strategy #{strategyId} / {activeInfo.title}
                </div>
                <h2 className="text-h2">{activeInfo.title}</h2>
                <p className="text-small text-secondary-600 mt-1">{activeInfo.description}</p>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Search */}
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
                  <input
                    type="text"
                    placeholder="Search cards..."
                    className="input input-sm pl-10 w-64"
                  />
                </div>
                
                {/* Filter & Sort */}
                <button className="btn btn-ghost btn-sm">
                  <Filter size={16} />
                  <span>Filter</span>
                </button>
                <button className="btn btn-ghost btn-sm">
                  <SortDesc size={16} />
                  <span>Sort</span>
                </button>
                
                {/* Primary Actions */}
                <button className="btn btn-secondary btn-sm">
                  <Settings size={16} />
                  <span>Generate Card</span>
                </button>
                <button className="btn btn-primary btn-sm">
                  <Plus size={16} />
                  <span>Add Card</span>
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-auto">
            <div className="max-w-6xl">
              {/* Cards Grid */}
              <div className="card-grid">
                {[1, 2, 3, 4, 5, 6].map((card) => (
                  <div
                    key={card}
                    className="card group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-8 h-8 bg-secondary-100 rounded-lg flex items-center justify-center">
                        <span className="text-secondary-500 text-small font-medium">#{card}</span>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 rounded text-secondary-400 hover:text-secondary-600">
                          <Settings size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="text-h4 mb-2">
                      Sample {activeInfo.title} Card {card}
                    </h3>
                    <p className="text-small text-secondary-600 mb-4 truncate-2">
                      This is a placeholder card for {activeInfo.title.toLowerCase()} content. It demonstrates the card layout and styling.
                    </p>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-secondary-100">
                      <span className="text-caption text-secondary-500">Updated 2h ago</span>
                      <div className="flex items-center space-x-1">
                        <div className="status-dot status-active"></div>
                        <span className="text-caption text-secondary-600">Active</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Add Card Placeholder */}
                <button className="card border-2 border-dashed border-secondary-300 hover:border-primary-400 hover:bg-primary-50 transition-colors flex flex-col items-center justify-center text-secondary-500 hover:text-primary-600 min-h-[200px]">
                  <Plus size={32} className="mb-3" />
                  <span className="text-small font-medium">Add New Card</span>
                  <span className="text-caption">Click to create {activeInfo.title.toLowerCase()}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Strategy Tools */}
        <div className="panel">
          <div className="p-6">
            <h3 className="text-h4 mb-4">Strategy Tools</h3>
            
            <div className="space-y-3">
              {[
                { name: 'AI Generator', desc: 'Generate content with AI', color: 'bg-purple-500' },
                { name: 'Templates', desc: 'Use pre-built templates', color: 'bg-primary-500' },
                { name: 'Analytics', desc: 'View strategy insights', color: 'bg-success-500' }
              ].map((tool, i) => (
                <button key={i} className="card card-compact w-full text-left hover:border-primary-200">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 ${tool.color} rounded-lg flex items-center justify-center`}>
                      <div className="w-3 h-3 bg-white rounded-sm"></div>
                    </div>
                    <div>
                      <div className="text-small font-medium text-secondary-900">{tool.name}</div>
                      <div className="text-caption text-secondary-600">{tool.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 card card-compact bg-secondary-50">
              <h4 className="text-small font-medium text-secondary-900 mb-2">Coming Soon</h4>
              <p className="text-caption text-secondary-600">
                More strategy tools and features will be added here as part of the roadmap
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}