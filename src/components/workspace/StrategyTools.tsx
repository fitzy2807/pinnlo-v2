'use client'

import { Bot, FileText, BarChart3, Users, Settings, HelpCircle } from 'lucide-react'

const tools = [
  {
    id: 'ai-generator',
    name: 'AI Generator',
    description: 'Generate content with AI',
    icon: Bot,
    color: 'purple'
  },
  {
    id: 'templates',
    name: 'Templates',
    description: 'Use pre-built templates',
    icon: FileText,
    color: 'blue'
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'View strategy insights',
    icon: BarChart3,
    color: 'green'
  }
]

const features = [
  {
    id: 'collaboration',
    name: 'Team Collaboration',
    description: 'Invite team members',
    status: 'coming-soon'
  },
  {
    id: 'integrations',
    name: 'Integrations',
    description: 'Connect external tools',
    status: 'coming-soon'
  },
  {
    id: 'automation',
    name: 'Workflow Automation',
    description: 'Automate repetitive tasks',
    status: 'coming-soon'
  }
]

export default function StrategyTools() {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900 text-sm">Strategy Tools</h2>
        <p className="text-xs text-gray-500 mt-0.5">Enhance your strategy building</p>
      </div>

      {/* Tools Section */}
      <div className="p-3 space-y-2">
        <h3 className="text-xs font-medium text-gray-700 mb-2">Available Tools</h3>
        {tools.map((tool) => {
          const IconComponent = tool.icon
          return (
            <button
              key={tool.id}
              className="w-full p-2.5 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-200 text-left group"
            >
              <div className="flex items-start space-x-2.5">
                <div className={`p-1.5 rounded-md ${
                  tool.color === 'purple' ? 'bg-purple-100' :
                  tool.color === 'blue' ? 'bg-blue-100' :
                  'bg-green-100'
                }`}>
                  <IconComponent size={14} className={
                    tool.color === 'purple' ? 'text-purple-600' :
                    tool.color === 'blue' ? 'text-blue-600' :
                    'text-green-600'
                  } />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-medium text-gray-900 group-hover:text-gray-700">
                    {tool.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {tool.description}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 mx-3"></div>

      {/* Coming Soon Features */}
      <div className="p-3 space-y-2 flex-1">
        <h3 className="text-xs font-medium text-gray-700 mb-2">Coming Soon</h3>
        <div className="space-y-1.5">
          {features.map((feature) => (
            <div key={feature.id} className="p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-xs font-medium text-gray-700">
                    {feature.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {feature.description}
                  </p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium ml-1.5">
                  Soon
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Roadmap:</strong> More strategy tools and features will be added here as part of the roadmap
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200">
        <button className="w-full flex items-center justify-center space-x-1.5 p-1.5 text-xs text-gray-600 hover:text-gray-800 transition-colors">
          <HelpCircle size={14} />
          <span>Help & Support</span>
        </button>
      </div>
    </div>
  )
}
