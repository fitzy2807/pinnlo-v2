'use client'

import React, { useState, useRef } from 'react'
import { motion, Reorder } from 'framer-motion'
import { 
  BarChart3, 
  Brain, 
  Users, 
  Target, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Plus,
  Settings,
  Maximize2,
  X,
  Bell,
  Calendar,
  FileText,
  Zap,
  GripVertical
} from 'lucide-react'

interface Widget {
  id: string
  title: string
  icon: any
  size: 'small' | 'medium' | 'large'
  content: any
}

const initialWidgets: Widget[] = [
  {
    id: 'strategy-health',
    title: 'Strategy Health',
    icon: Target,
    size: 'large',
    content: {
      type: 'progress',
      completeness: 85,
      areas: [
        { name: 'Vision', progress: 95, color: 'bg-emerald-500' },
        { name: 'Intelligence', progress: 73, color: 'bg-blue-500' },
        { name: 'Development', progress: 68, color: 'bg-purple-500' }
      ]
    }
  },
  {
    id: 'action-center',
    title: 'Needs Your Attention',
    icon: AlertTriangle,
    size: 'large',
    content: {
      type: 'tasks',
      critical: 2,
      thisWeek: 4,
      completed: 6
    }
  },
  {
    id: 'intelligence-pulse',
    title: 'Market Intelligence',
    icon: Brain,
    size: 'medium',
    content: {
      type: 'intelligence',
      newInsights: 8,
      trending: 'AI-powered fitness apps see 340% growth'
    }
  },
  {
    id: 'team-activity',
    title: 'Team Activity',
    icon: Users,
    size: 'medium',
    content: {
      type: 'team',
      activeNow: 4,
      members: [
        { name: 'Alex', role: 'Dev Lead', working: 'User Auth Technical Spec' },
        { name: 'Maria', role: 'Designer', working: 'Mobile App Wireframes' }
      ]
    }
  },
  {
    id: 'progress-tracker',
    title: 'MVP Progress',
    icon: BarChart3,
    size: 'medium',
    content: {
      type: 'progress-detailed',
      sprintProgress: 78,
      weeks: [
        { name: 'Requirements', status: 'complete' },
        { name: 'Design', status: 'complete' },
        { name: 'Development', status: 'current' },
        { name: 'Testing', status: 'pending' }
      ]
    }
  },
  {
    id: 'quick-actions',
    title: 'Quick Actions',
    icon: Zap,
    size: 'small',
    content: {
      type: 'actions'
    }
  },
  {
    id: 'recent-activity',
    title: 'Recent Activity',
    icon: Clock,
    size: 'medium',
    content: {
      type: 'activity',
      activities: [
        { time: '2:30 PM', user: 'Alex', action: 'updated "User Authentication Flow"' },
        { time: '1:45 PM', user: 'AI', action: 'suggested 3 new market insights' },
        { time: '11:20 AM', user: 'You', action: 'completed "Competitor Pricing Analysis"' }
      ]
    }
  },
  {
    id: 'ai-insights',
    title: 'AI Insights',
    icon: Brain,
    size: 'medium',
    content: {
      type: 'ai-insights',
      insights: [
        'Market trend detected: Workplace wellness mentions up 45%',
        'Risk identified: 2 technical dependencies need owners',
        'Opportunity: Competitor discontinued feature users requested'
      ]
    }
  }
]

const WidgetCard = ({ widget }: { widget: Widget }) => {
  const Icon = widget.icon
  
  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'small':
        return 'col-span-1 row-span-1 h-64'
      case 'medium':
        return 'col-span-1 md:col-span-1 lg:col-span-1 row-span-1 h-80'
      case 'large':
        return 'col-span-1 md:col-span-2 lg:col-span-2 row-span-1 h-80'
      default:
        return 'col-span-1 row-span-1 h-64'
    }
  }

  const renderContent = () => {
    switch (widget.content.type) {
      case 'progress':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {widget.content.completeness}%
              </div>
              <div className="text-sm text-gray-500">Strategy Completeness</div>
            </div>
            <div className="space-y-3">
              {widget.content.areas.map((area: any, index: number) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{area.name}</span>
                    <span className="text-gray-500">{area.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${area.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${area.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      
      case 'tasks':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{widget.content.critical}</div>
                <div className="text-xs text-gray-500">Critical</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">{widget.content.thisWeek}</div>
                <div className="text-xs text-gray-500">This Week</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{widget.content.completed}</div>
                <div className="text-xs text-gray-500">Completed</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-sm font-medium text-red-700">Market Analysis outdated (45 days)</div>
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-sm font-medium text-yellow-700">Review competitor pricing analysis</div>
              </div>
            </div>
          </div>
        )
      
      case 'intelligence':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{widget.content.newInsights}</div>
              <div className="text-sm text-gray-500">New insights this week</div>
            </div>
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-orange-600" />
                <span className="text-xs font-medium text-orange-700">TRENDING</span>
              </div>
              <div className="text-sm text-gray-700">{widget.content.trending}</div>
            </div>
          </div>
        )
      
      case 'team':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{widget.content.activeNow}</div>
              <div className="text-sm text-gray-500">Active now</div>
            </div>
            <div className="space-y-3">
              {widget.content.members.map((member: any, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-700">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{member.name}</div>
                    <div className="text-xs text-gray-500">{member.role}</div>
                    <div className="text-xs text-gray-600 truncate">{member.working}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      
      case 'progress-detailed':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{widget.content.sprintProgress}%</div>
              <div className="text-sm text-gray-500">Sprint Progress</div>
            </div>
            <div className="space-y-2">
              {widget.content.weeks.map((week: any, index: number) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    week.status === 'complete' ? 'bg-green-500' :
                    week.status === 'current' ? 'bg-blue-500' :
                    'bg-gray-300'
                  }`} />
                  <span className="text-sm text-gray-700">{week.name}</span>
                  {week.status === 'current' && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Current</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      
      case 'actions':
        return (
          <div className="space-y-3">
            <button className="w-full p-3 bg-primary-50 border border-primary-200 rounded-lg text-left hover:bg-primary-100 transition-colors">
              <div className="text-sm font-medium text-primary-700">AI Assistant</div>
              <div className="text-xs text-primary-600">Update market analysis</div>
            </button>
            <button className="w-full p-3 bg-green-50 border border-green-200 rounded-lg text-left hover:bg-green-100 transition-colors">
              <div className="text-sm font-medium text-green-700">Create New</div>
              <div className="text-xs text-green-600">Strategy card</div>
            </button>
            <button className="w-full p-3 bg-blue-50 border border-blue-200 rounded-lg text-left hover:bg-blue-100 transition-colors">
              <div className="text-sm font-medium text-blue-700">Start Review</div>
              <div className="text-xs text-blue-600">Weekly progress</div>
            </button>
          </div>
        )
      
      case 'activity':
        return (
          <div className="space-y-3">
            {widget.content.activities.map((activity: any, index: number) => (
              <div key={index} className="flex items-start gap-3">
                <div className="text-xs text-gray-500 mt-0.5 w-12 flex-shrink-0">
                  {activity.time}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">{activity.user}</span> {activity.action}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      
      case 'ai-insights':
        return (
          <div className="space-y-3">
            {widget.content.insights.map((insight: string, index: number) => (
              <div key={index} className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="text-sm text-purple-700">{insight}</div>
              </div>
            ))}
          </div>
        )
      
      default:
        return <div className="text-sm text-gray-500">Widget content</div>
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.02 }}
      whileDrag={{ scale: 1.05, rotate: 2 }}
      className={`${getSizeClasses(widget.size)} bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-move`}
    >
      <div className="p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-50 rounded-lg">
              <Icon className="w-5 h-5 text-primary-600" />
            </div>
            <h3 className="font-semibold text-gray-900">{widget.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4 text-gray-400" />
            <button className="p-1 hover:bg-gray-100 rounded">
              <Settings className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </motion.div>
  )
}

export default function DashboardGrid() {
  const [widgets, setWidgets] = useState(initialWidgets)
  const [isCustomizing, setIsCustomizing] = useState(false)

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Dashboard</h1>
          <p className="text-gray-600">Customize your view by dragging widgets</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCustomizing(!isCustomizing)}
            className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
              isCustomizing 
                ? 'bg-primary-600 text-white border-primary-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {isCustomizing ? 'Done Customizing' : 'Customize'}
          </button>
          <button className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Plus className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Customization Notice */}
      {isCustomizing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <span className="text-blue-700 font-medium">Customization Mode</span>
          </div>
          <p className="text-blue-600 text-sm mt-1">
            Drag widgets to rearrange them. Click the settings icon on any widget to configure it.
          </p>
        </motion.div>
      )}

      {/* Widget Grid */}
      <Reorder.Group
        axis="x"
        values={widgets}
        onReorder={setWidgets}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-min"
      >
        {widgets.map((widget) => (
          <Reorder.Item
            key={widget.id}
            value={widget}
            className={isCustomizing ? 'cursor-grab active:cursor-grabbing' : ''}
          >
            <WidgetCard widget={widget} />
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  )
}
