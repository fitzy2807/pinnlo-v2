'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import BlueprintNavigation from '@/components/workspace/BlueprintNavigation'
import PageController from '@/components/workspace/PageController'
import ContentArea from '@/components/workspace/ContentArea'
import StrategyTools from '@/components/workspace/StrategyTools'
import BlueprintManager from '@/components/workspace/BlueprintManager'

const blueprints = [
  { id: 'strategic-context', name: 'Strategic Context', icon: '🎯', count: 6 },
  { id: 'vision-statement', name: 'Vision Statement', icon: '👁️', count: 1 },
  { id: 'value-propositions', name: 'Value Propositions', icon: '💎', count: 2 },
  { id: 'personas', name: 'Personas', icon: '👥', count: 4 },
  { id: 'okrs', name: 'OKRs', icon: '📊', count: 2 },
  { id: 'strategy-analytics', name: 'Strategy Analytics', icon: '📈', count: 0 },
  { id: 'workspace-settings', name: 'Workspace Settings', icon: '⚙️', count: 0 },
]

export default function WorkspacePage() {
  const params = useParams()
  const [activeBlueprint, setActiveBlueprint] = useState('strategic-context')
  
  const currentBlueprint = blueprints.find(b => b.id === activeBlueprint)

  return (
    <div className="flex flex-col h-full">
      {/* Blueprint Manager Bar */}
      <BlueprintManager strategyId={params.id as string} />
      
      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Blueprint Navigation */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <BlueprintNavigation 
            blueprints={blueprints}
            activeBlueprint={activeBlueprint}
            onSelectBlueprint={setActiveBlueprint}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Page Controller */}
          <PageController blueprint={currentBlueprint} />
          
          {/* Content Area */}
          <div className="flex-1 overflow-auto">
            <ContentArea blueprint={currentBlueprint} />
          </div>
        </div>

        {/* Right Panel - Strategy Tools */}
        <div className="w-80 bg-white border-l border-gray-200">
          <StrategyTools />
        </div>
      </div>
    </div>
  )
}
