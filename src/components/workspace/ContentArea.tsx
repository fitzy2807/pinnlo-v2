'use client'

import { MoreHorizontal, Clock, CheckCircle } from 'lucide-react'

interface Blueprint {
  id: string
  name: string
  icon: string
  count: number
}

interface ContentAreaProps {
  blueprint?: Blueprint
}

// Sample data for Strategic Context cards
const strategicContextCards = [
  {
    id: 1,
    title: "Market Analysis Framework",
    description: "Comprehensive analysis of market trends, competitive landscape, and opportunities for strategic positioning.",
    updatedAt: "2h ago",
    status: "active"
  },
  {
    id: 2,
    title: "Competitive Intelligence",
    description: "Deep dive into competitor strategies, market positioning, and potential threats to our market share.",
    updatedAt: "2h ago", 
    status: "active"
  },
  {
    id: 3,
    title: "Customer Insights Research",
    description: "Primary research findings on customer needs, pain points, and decision-making processes.",
    updatedAt: "2h ago",
    status: "active"
  },
  {
    id: 4,
    title: "Technology Landscape",
    description: "Assessment of current technology trends and their impact on our strategic direction.",
    updatedAt: "2h ago",
    status: "active"
  },
  {
    id: 5,
    title: "Regulatory Environment",
    description: "Analysis of regulatory changes and compliance requirements affecting our industry.",
    updatedAt: "2h ago",
    status: "active"
  },
  {
    id: 6,
    title: "Internal Capabilities Audit",
    description: "Evaluation of internal strengths, weaknesses, and capabilities to execute strategy.",
    updatedAt: "2h ago",
    status: "active"
  }
]

export default function ContentArea({ blueprint }: ContentAreaProps) {
  if (!blueprint) return null

  const getCardsForBlueprint = () => {
    switch (blueprint.id) {
      case 'strategic-context':
        return strategicContextCards
      default:
        return []
    }
  }

  const cards = getCardsForBlueprint()

  return (
    <div className="p-4">
      {/* Stacked Card Layout - Full Width */}
      <div className="space-y-4">
        {cards.map((card, index) => (
          <div key={card.id} className="card group cursor-pointer">
            {/* Card Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                  #{index + 1}
                </span>
              </div>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded">
                <MoreHorizontal size={14} className="text-gray-400" />
              </button>
            </div>

            {/* Card Content */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                {card.title}
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {card.description}
              </p>
            </div>

            {/* Card Footer */}
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
              <div className="flex items-center space-x-1.5 text-xs text-gray-500">
                <Clock size={10} />
                <span>Updated {card.updatedAt}</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span className="text-xs font-medium text-green-700">Active</span>
              </div>
            </div>
          </div>
        ))}

        {/* Add New Card */}
        <div className="card border-2 border-dashed border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 cursor-pointer group">
          <div className="flex items-center justify-center text-center py-8">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center group-hover:bg-gray-300 transition-colors">
                <span className="text-lg text-gray-400 group-hover:text-gray-500">+</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 group-hover:text-gray-800 text-sm">
                  Add New Card
                </h3>
                <p className="text-xs text-gray-500 group-hover:text-gray-600">
                  Create a new {blueprint.name.toLowerCase()} card
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
