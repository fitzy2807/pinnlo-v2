'use client'

import { Zap, FileText, BarChart3, HelpCircle, BookOpen, Lightbulb } from 'lucide-react'

export default function SidebarContainer() {
  const tools = [
    {
      id: 'strategy-tools',
      title: 'Strategy Tools',
      description: 'Advanced tools for strategy development and analysis',
      icon: Zap,
      status: 'Coming Soon...',
      items: [
        { name: 'Card Creator', icon: '🃏' },
        { name: 'Report Generator', icon: '📊' },
        { name: 'Maturity Assessment', icon: '📈' }
      ]
    },
    {
      id: 'help',
      title: 'Need Help?',
      description: 'Get support and learn how to use PINNLO effectively',
      icon: HelpCircle,
      action: 'Documentation & Support'
    },
    {
      id: 'templates',
      title: 'Strategy Templates',
      description: 'Pre-built templates to jumpstart your strategy development',
      icon: BookOpen,
      action: 'Browse Templates...'
    }
  ]

  return (
    <div className="space-y-6">
      {tools.map((section) => {
        const IconComponent = section.icon
        
        return (
          <div key={section.id} className="card">
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                <IconComponent size={20} className="text-primary-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-h4 mb-1">{section.title}</h3>
                <p className="text-small text-secondary-600">{section.description}</p>
              </div>
            </div>

            {section.items && (
              <div className="space-y-2 mb-4">
                {section.items.map((item, index) => (
                  <button 
                    key={index}
                    className="w-full p-3 bg-secondary-50 hover:bg-secondary-100 rounded-lg transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-small font-medium text-secondary-700">{item.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {section.status && (
              <div className="text-center py-4 text-secondary-500">
                <Lightbulb size={16} className="inline mr-2" />
                <span className="text-small">{section.status}</span>
              </div>
            )}

            {section.action && (
              <button className="w-full btn btn-secondary btn-sm">
                {section.action}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}