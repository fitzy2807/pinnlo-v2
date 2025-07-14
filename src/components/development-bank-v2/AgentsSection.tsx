'use client'

import React, { useState, useEffect } from 'react'
import { Bot, FileText, Sparkles, Code } from 'lucide-react'
import { getAgentsForHub } from '@/lib/agentRegistry'
import AgentLoader from '@/components/shared/agents/AgentLoader'

interface AgentsSectionProps {
  strategy: any
  selectedAgentId?: string
  onClose?: () => void
  onCardsCreated?: (cards: any[]) => void
}

// Icon mapping for agent types
const iconMap: Record<string, any> = {
  'FileText': FileText,
  'Bot': Bot,
  'Sparkles': Sparkles,
  'Code': Code
}

export default function AgentsSection({ strategy, selectedAgentId, onClose, onCardsCreated }: AgentsSectionProps) {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(selectedAgentId || null)
  
  // Get agents assigned to Development Hub
  const agents = getAgentsForHub('development')
  
  // If a specific agent is selected, show it directly
  useEffect(() => {
    if (selectedAgentId) {
      const agent = agents.find(a => a.id === selectedAgentId)
      if (agent) {
        setSelectedAgent(agent.component)
      }
    }
  }, [selectedAgentId, agents])

  const handleAgentClick = (agentId: string) => {
    setSelectedAgent(agentId)
  }

  const handleCloseAgent = () => {
    setSelectedAgent(null)
  }

  // If an agent is selected, show the agent component
  if (selectedAgent) {
    return (
      <AgentLoader
        agentId={selectedAgent}
        onClose={handleCloseAgent}
        configuration={{
          hubContext: 'development',
          strategy,
          onCardsCreated
        }}
      />
    )
  }

  // Otherwise show the agents menu
  return (
    <div className="h-full bg-gray-50">
      <div className="p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-2">Development Agents</h2>
        <p className="text-sm text-gray-600 mb-6">
          Select an agent to help create and manage development content
        </p>

        <div className="grid grid-cols-1 gap-3">
          {agents.map((agent) => {
            const Icon = iconMap[agent.icon] || Bot
            
            return (
              <button
                key={agent.id}
                onClick={() => handleAgentClick(agent.component)}
                className="w-full flex items-center space-x-3 p-4 text-left bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm rounded-lg transition-all"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-gray-900">{agent.name}</h3>
                    {agent.status === 'beta' && (
                      <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                        Beta
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{agent.description}</p>
                </div>
              </button>
            )
          })}
        </div>

        {agents.length === 0 && (
          <div className="text-center py-12">
            <Bot className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              No agents are currently assigned to the Development Hub.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Configure agents in the Agent Hub to enable them here.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}