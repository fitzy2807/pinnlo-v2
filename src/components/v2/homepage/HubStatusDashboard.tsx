'use client'

import { 
  Brain, 
  Target, 
  Code, 
  Users, 
  FileText, 
  Bot,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

const HUBS = [
  {
    id: 'intelligence',
    name: 'Intelligence Hub',
    icon: Brain,
    color: 'blue',
    cardCount: 23,
    quality: 8,
    trend: 'up',
    description: 'Market intelligence and competitive analysis'
  },
  {
    id: 'strategy',
    name: 'Strategy Hub',
    icon: Target,
    color: 'purple',
    cardCount: 15,
    quality: 6,
    trend: 'neutral',
    description: 'Strategic planning and business models'
  },
  {
    id: 'development',
    name: 'Development Hub',
    icon: Code,
    color: 'orange',
    cardCount: 34,
    quality: 4,
    trend: 'down',
    description: 'Product development and technical requirements'
  },
  {
    id: 'organization',
    name: 'Organization Hub',
    icon: Users,
    color: 'green',
    cardCount: 11,
    quality: 7,
    trend: 'up',
    description: 'Team structure and organizational design'
  },
  {
    id: 'document',
    name: 'Document Hub',
    icon: FileText,
    color: 'gray',
    cardCount: 18,
    quality: 9,
    trend: 'up',
    description: 'Documentation and knowledge management'
  },
  {
    id: 'agent',
    name: 'Agent Hub',
    icon: Bot,
    color: 'red',
    cardCount: 7,
    quality: 5,
    trend: 'neutral',
    description: 'AI agents and automation workflows'
  }
]

export default function HubStatusDashboard() {
  const getHubColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-800',
      purple: 'bg-purple-50 border-purple-200 text-purple-800',
      orange: 'bg-orange-50 border-orange-200 text-orange-800',
      green: 'bg-green-50 border-green-200 text-green-800',
      gray: 'bg-gray-50 border-gray-200 text-gray-800',
      red: 'bg-red-50 border-red-200 text-red-800'
    }
    return colors[color as keyof typeof colors] || colors.gray
  }

  const getQualityColor = (quality: number) => {
    if (quality >= 8) return 'text-green-600'
    if (quality >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getQualityIcon = (quality: number) => {
    if (quality >= 8) return CheckCircle
    if (quality >= 6) return AlertCircle
    return AlertCircle
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp
      case 'down': return TrendingUp
      case 'neutral': return TrendingUp
      default: return TrendingUp
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-500'
      case 'down': return 'text-red-500'
      case 'neutral': return 'text-gray-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {HUBS.map((hub) => {
        const Icon = hub.icon
        const QualityIcon = getQualityIcon(hub.quality)
        const TrendIcon = getTrendIcon(hub.trend)

        return (
          <div
            key={hub.id}
            className={`rounded-lg border p-6 hover:shadow-md transition-all cursor-pointer ${getHubColor(hub.color)}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{hub.name}</h3>
                  <p className="text-sm opacity-75">{hub.cardCount} cards</p>
                </div>
              </div>
              <div className={`p-1 rounded-full ${getTrendColor(hub.trend)}`}>
                <TrendIcon className="w-4 h-4" />
              </div>
            </div>

            <p className="text-sm opacity-75 mb-4">
              {hub.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <QualityIcon className={`w-4 h-4 ${getQualityColor(hub.quality)}`} />
                <span className="text-sm">
                  Quality: <span className={`font-medium ${getQualityColor(hub.quality)}`}>
                    {hub.quality}/10
                  </span>
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-white rounded-full h-2">
                  <div
                    className="bg-current h-2 rounded-full transition-all duration-300"
                    style={{ width: `${hub.quality * 10}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-4 pt-4 border-t border-white border-opacity-20">
              <div className="flex items-center justify-between">
                <button className="text-sm font-medium hover:underline">
                  View Details
                </button>
                <button className="text-sm font-medium hover:underline">
                  Quick Add
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}