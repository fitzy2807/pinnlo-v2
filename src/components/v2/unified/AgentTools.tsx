'use client'

import { useState } from 'react'
import { 
  Bot, 
  Zap, 
  Search, 
  BarChart, 
  Settings, 
  Database,
  ChevronRight,
  ChevronDown,
  Plus,
  Brain,
  FileText,
  Workflow,
  X
} from 'lucide-react'
import { CardData } from '@/types/card'

interface AgentToolsProps {
  selectedHub: string
  selectedSection: string
  selectedCard: CardData | null
  onToolSelect?: (toolId: string, subToolId: string) => void
  isOverlayOpen?: boolean
  onOverlayChange?: (open: boolean) => void
}

const AGENT_TOOLS = [
  {
    id: 'cardCreator',
    title: 'Card Creator',
    icon: Plus,
    color: 'blue',
    description: 'Generate new cards using AI with contextual information from your existing strategy',
    buttonText: 'Open Card Creator'
  },
  {
    id: 'urlAnalyzer',
    title: 'URL Analyzer',
    icon: Search,
    color: 'green',
    description: 'Extract and analyze content from web URLs to generate strategic insights',
    buttonText: 'Open URL Analyzer'
  },
  {
    id: 'textPaste',
    title: 'Text / Paste',
    icon: FileText,
    color: 'purple',
    description: 'Analyze and process text content to create structured strategic information',
    buttonText: 'Open Text Analyzer'
  },
  {
    id: 'intelligenceAutomation',
    title: 'Intelligence Automation',
    icon: Brain,
    color: 'orange',
    description: 'Automate intelligence gathering and processing for strategic decision making',
    buttonText: 'Open Intelligence Hub'
  }
]

export default function AgentTools({ 
  selectedHub, 
  selectedSection, 
  selectedCard,
  onToolSelect,
  isOverlayOpen = false,
  onOverlayChange
}: AgentToolsProps) {
  const [expandedTool, setExpandedTool] = useState<string | null>(null)

  const handleToolExpand = (toolId: string) => {
    setExpandedTool(expandedTool === toolId ? null : toolId)
  }

  const handleSubToolClick = (toolId: string, subToolId: string) => {
    console.log('Sub-tool clicked:', toolId, subToolId, { selectedHub, selectedSection, selectedCard })
    if (onToolSelect) {
      onToolSelect(toolId, subToolId)
    }
  }

  const getToolColor = (color: string) => {
    const colors = {
      blue: 'bg-gray-800 border-gray-700 text-gray-300',
      green: 'bg-gray-800 border-gray-700 text-gray-300',
      orange: 'bg-gray-800 border-gray-700 text-gray-300',
      purple: 'bg-gray-800 border-gray-700 text-gray-300'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const getContextualTools = () => {
    return AGENT_TOOLS
  }

  const contextualTools = getContextualTools()

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Header */}
      <div className="p-3 border-b border-gray-700">
        <h2 className="text-sm font-semibold text-white">Agent Tools</h2>
        <p className="text-xs text-gray-300">
          Context: {selectedHub} • {selectedSection}
        </p>
      </div>

      {/* Agent Tool Panels */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {contextualTools.map((tool) => {
          const Icon = tool.icon
          const isExpanded = expandedTool === tool.id

          return (
            <div key={tool.id} className={`border rounded-lg ${getToolColor(tool.color)}`}>
              {/* Tool Header */}
              <button
                onClick={() => handleToolExpand(tool.id)}
                className="w-full p-2 text-left hover:bg-gray-700 transition-colors rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <div>
                      <h3 className="font-medium text-xs">{tool.title}</h3>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {isExpanded ? (
                      <ChevronDown className="w-3 h-3" />
                    ) : (
                      <ChevronRight className="w-3 h-3" />
                    )}
                  </div>
                </div>
              </button>

              {/* Tool Content */}
              {isExpanded && (
                <div className="px-2 pb-2">
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400 px-2">{tool.description}</p>
                    <button
                      onClick={() => onOverlayChange?.(true)}
                      className="w-full p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-xs font-medium"
                    >
                      {tool.buttonText}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>


      {/* Overlay */}
      <div
        className={`fixed top-0 right-0 h-full w-[600px] bg-white shadow-2xl z-50 transition-transform duration-300 ease-in-out ${
          isOverlayOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={() => onOverlayChange?.(false)}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Blank Content */}
        <div className="h-full p-8">
          {/* Completely blank */}
        </div>
      </div>
    </div>
  )
}