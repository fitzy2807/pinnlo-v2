'use client'

import { useState } from 'react'
import { 
  Brain, 
  Target, 
  Code, 
  Users, 
  FileText, 
  Bot,
  ChevronRight,
  ChevronDown
} from 'lucide-react'

interface LeftNavigationProps {
  selectedHub: string
  selectedSection: string
  onHubChange: (hubId: string) => void
  onSectionChange: (sectionId: string) => void
  strategy: any
}

const HUBS = [
  { id: 'intelligence', name: 'Intelligence Hub', icon: Brain, color: 'blue' },
  { id: 'strategy', name: 'Strategy Hub', icon: Target, color: 'purple' },
  { id: 'development', name: 'Development Hub', icon: Code, color: 'orange' },
  { id: 'organization', name: 'Organization Hub', icon: Users, color: 'green' },
  { id: 'document', name: 'Document Hub', icon: FileText, color: 'gray' },
  { id: 'agent', name: 'Agent Hub', icon: Bot, color: 'red' }
]

const HUB_SECTIONS = {
  intelligence: [
    { id: 'market', name: 'Market Intelligence' },
    { id: 'competitor', name: 'Competitor Intelligence' },
    { id: 'trends', name: 'Trends' },
    { id: 'technology', name: 'Technology Intelligence' },
    { id: 'stakeholder', name: 'Stakeholder Intelligence' },
    { id: 'consumer', name: 'Consumer Intelligence' },
    { id: 'risk', name: 'Risk Intelligence' },
    { id: 'opportunities', name: 'Opportunities' }
  ],
  strategy: [
    { id: 'strategicContext', name: 'Strategic Context' },
    { id: 'valuePropositions', name: 'Value Propositions' },
    { id: 'vision', name: 'Vision' },
    { id: 'personas', name: 'Personas' },
    { id: 'customer-journey', name: 'Customer Journey' },
    { id: 'swot-analysis', name: 'SWOT Analysis' },
    { id: 'competitive-analysis', name: 'Competitive Analysis' },
    { id: 'problem-statement', name: 'Problem Statement' },
    { id: 'okrs', name: 'OKRs' },
    { id: 'business-model', name: 'Business Model' },
    { id: 'go-to-market', name: 'Go-to-Market' },
    { id: 'risk-assessment', name: 'Risk Assessment' },
    { id: 'roadmap', name: 'Roadmap' },
    { id: 'kpis', name: 'KPIs' },
    { id: 'financial-projections', name: 'Financial Projections' },
    { id: 'workstream', name: 'Workstreams' }
  ],
  development: [
    { id: 'features', name: 'Features' },
    { id: 'epics', name: 'Epics' },
    { id: 'prd', name: 'PRD' },
    { id: 'trd', name: 'TRD' },
    { id: 'tech-stack', name: 'Tech Stack' },
    { id: 'task-list', name: 'Task Lists' }
  ],
  organization: [
    { id: 'team', name: 'Team' },
    { id: 'company', name: 'Company' },
    { id: 'department', name: 'Department' },
    { id: 'person', name: 'Person' }
  ],
  document: [
    { id: 'templates', name: 'Templates' },
    { id: 'guides', name: 'Guides' },
    { id: 'processes', name: 'Processes' }
  ],
  agent: [
    { id: 'cardCreator', name: 'Card Creator' },
    { id: 'aiAnalysis', name: 'AI Analysis' },
    { id: 'intelligenceGathering', name: 'Intelligence Gathering' },
    { id: 'dataProcessing', name: 'Data Processing' },
    { id: 'workflowAutomation', name: 'Workflow Automation' }
  ]
}

export default function LeftNavigation({ 
  selectedHub, 
  selectedSection, 
  onHubChange, 
  onSectionChange, 
  strategy 
}: LeftNavigationProps) {
  const [expandedHub, setExpandedHub] = useState(selectedHub)

  const handleHubClick = (hubId: string) => {
    if (expandedHub === hubId) {
      // If clicking the same hub, collapse it
      setExpandedHub('')
    } else {
      // Expand the new hub and select it
      setExpandedHub(hubId)
      onHubChange(hubId)
    }
  }

  const getHubColor = (color: string) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-50 border-blue-200',
      purple: 'text-purple-600 bg-purple-50 border-purple-200',
      orange: 'text-orange-600 bg-orange-50 border-orange-200',
      green: 'text-green-600 bg-green-50 border-green-200',
      gray: 'text-gray-600 bg-gray-50 border-gray-200',
      red: 'text-red-600 bg-red-50 border-red-200'
    }
    return colors[color as keyof typeof colors] || colors.gray
  }

  return (
    <div className="h-full flex flex-col">
      {/* Strategy Header */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-lg font-semibold text-gray-900 truncate">
          {strategy.title}
        </h1>
        <p className="text-sm text-gray-500 truncate">
          {strategy.client}
        </p>
      </div>

      {/* Hub Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {HUBS.map((hub) => {
          const Icon = hub.icon
          const isSelected = selectedHub === hub.id
          const isExpanded = expandedHub === hub.id
          const sections = HUB_SECTIONS[hub.id as keyof typeof HUB_SECTIONS] || []

          return (
            <div key={hub.id} className="space-y-1">
              {/* Hub Button */}
              <button
                onClick={() => handleHubClick(hub.id)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                  isSelected 
                    ? getHubColor(hub.color)
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{hub.name}</span>
                </div>
                {sections.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">12</span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                )}
              </button>

              {/* Sections */}
              {isExpanded && sections.length > 0 && (
                <div className="ml-8 space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => onSectionChange(section.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                        selectedSection === section.id
                          ? 'bg-gray-100 text-gray-900'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-sm">{section.name}</span>
                      <span className="text-xs text-gray-400">3</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}