'use client'

import { useState } from 'react'
import { 
  Target, 
  Brain, 
  Code, 
  Users, 
  ChevronDown, 
  ChevronRight,
  FileText,
  BarChart3,
  Settings
} from 'lucide-react'

interface NavigationItem {
  id: string
  name: string
  icon: any
  count?: number
  status?: 'complete' | 'warning' | 'active'
  children?: NavigationItem[]
}

const navigationData: NavigationItem[] = [
  {
    id: 'strategy',
    name: 'Strategy Hub',
    icon: Target,
    count: 12,
    status: 'complete',
    children: [
      { id: 'vision', name: 'Vision & Mission', icon: Target, status: 'complete' },
      { id: 'market', name: 'Market Analysis', icon: BarChart3, status: 'warning' },
      { id: 'business', name: 'Business Model', icon: FileText, status: 'complete' }
    ]
  },
  {
    id: 'intelligence',
    name: 'Intelligence Bank',
    icon: Brain,
    count: 18,
    status: 'active',
    children: [
      { id: 'competitors', name: 'Competitors', icon: Users, count: 8 },
      { id: 'trends', name: 'Market Trends', icon: BarChart3, count: 6, status: 'active' },
      { id: 'research', name: 'User Research', icon: FileText, count: 4 }
    ]
  },
  {
    id: 'development',
    name: 'Development Bank',
    icon: Code,
    count: 31,
    status: 'warning',
    children: [
      { id: 'requirements', name: 'Requirements', icon: FileText, count: 8, status: 'complete' },
      { id: 'technical', name: 'Technical Specs', icon: Code, count: 5, status: 'active' },
      { id: 'tasks', name: 'Task Lists', icon: BarChart3, count: 18, status: 'warning' }
    ]
  },
  {
    id: 'organisation',
    name: 'Organisation Bank',
    icon: Users,
    count: 12,
    status: 'active',
    children: [
      { id: 'stakeholders', name: 'Stakeholders', icon: Users, count: 8 },
      { id: 'team', name: 'Team Members', icon: Users, count: 4 }
    ]
  }
]

const NavigationItem = ({ item, depth = 0 }: { item: NavigationItem; depth?: number }) => {
  const [isExpanded, setIsExpanded] = useState(depth === 0)
  const Icon = item.icon
  const hasChildren = item.children && item.children.length > 0

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'complete':
        return 'text-green-600 bg-green-100'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100'
      case 'active':
        return 'text-blue-600 bg-blue-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-gray-50 transition-colors ${
          depth > 0 ? 'pl-6' : ''
        }`}
      >
        {hasChildren && (
          <div className="w-4 h-4 flex items-center justify-center">
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-gray-400" />
            ) : (
              <ChevronRight className="w-3 h-3 text-gray-400" />
            )}
          </div>
        )}
        
        <div className={`p-1.5 rounded ${getStatusColor(item.status)}`}>
          <Icon className="w-4 h-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900 truncate">
              {item.name}
            </span>
            {item.count && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                {item.count}
              </span>
            )}
          </div>
        </div>
      </button>
      
      {hasChildren && isExpanded && (
        <div className="space-y-1">
          {item.children!.map((child) => (
            <NavigationItem key={child.id} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function DashboardSidebar() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-gray-900">Current Strategy</h2>
        <button className="p-1 hover:bg-gray-100 rounded">
          <Settings className="w-4 h-4 text-gray-400" />
        </button>
      </div>
      
      <div className="mb-4 p-3 bg-primary-50 border border-primary-200 rounded-lg">
        <div className="text-sm font-medium text-primary-700">FitPro Mobile App</div>
        <div className="text-xs text-primary-600 mt-1">
          Strategy completeness: 85%
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
          Quick Navigation
        </h3>
        {navigationData.map((item) => (
          <NavigationItem key={item.id} item={item} />
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-200">
        <button className="w-full p-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
          Switch Strategy
        </button>
      </div>
    </div>
  )
}
