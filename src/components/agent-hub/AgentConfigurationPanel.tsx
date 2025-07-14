'use client'

import React, { useState, useEffect } from 'react'
import { X, Settings, Check, AlertCircle } from 'lucide-react'
import { AgentCard } from '@/hooks/useAgentCards'
import { updateAgentHubAssignment } from '@/lib/agentRegistry'
import { toast } from 'react-hot-toast'

interface AgentConfigurationPanelProps {
  agent: AgentCard
  onClose: () => void
  onUpdate: (agentId: string, updates: Partial<AgentCard>) => void
}

const HUBS = [
  { id: 'intelligence', name: 'Intelligence Hub', description: 'Extract and analyze intelligence from various sources' },
  { id: 'strategy', name: 'Strategy Hub', description: 'Create and manage strategic plans and blueprints' },
  { id: 'development', name: 'Development Hub', description: 'Build and develop product features and roadmaps' },
  { id: 'organisation', name: 'Organisation Hub', description: 'Manage organizational structure and processes' }
] as const

export default function AgentConfigurationPanel({ agent, onClose, onUpdate }: AgentConfigurationPanelProps) {
  const [selectedHubs, setSelectedHubs] = useState<Set<string>>(new Set(agent.availableInHubs))
  const [isSaving, setIsSaving] = useState(false)

  const handleToggleHub = (hubId: string) => {
    const newSelectedHubs = new Set(selectedHubs)
    if (newSelectedHubs.has(hubId)) {
      newSelectedHubs.delete(hubId)
    } else {
      newSelectedHubs.add(hubId)
    }
    setSelectedHubs(newSelectedHubs)
  }

  const handleSave = async () => {

    setIsSaving(true)
    try {
      const hubIds = Array.from(selectedHubs) as ('intelligence' | 'strategy' | 'development' | 'organisation')[]
      
      // Update in registry
      updateAgentHubAssignment(agent.id, hubIds)
      
      // Update in local state
      await onUpdate(agent.id, { availableInHubs: hubIds })
      
      toast.success(`Updated hub assignments for ${agent.name}`)
      onClose()
    } catch (error) {
      toast.error('Failed to update agent configuration')
      console.error('Error updating agent:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-gray-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Configure Agent</h2>
              <p className="text-sm text-gray-500">{agent.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {/* Agent Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Agent Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium text-gray-900">{agent.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  agent.status === 'active' ? 'bg-green-100 text-green-800' :
                  agent.status === 'beta' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {agent.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Version:</span>
                <span className="font-medium text-gray-900">{agent.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Author:</span>
                <span className="font-medium text-gray-900">{agent.author}</span>
              </div>
            </div>
          </div>

          {/* Hub Assignment */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Hub Availability</h3>
            <p className="text-sm text-gray-600 mb-4">
              Select which hubs this agent should be available in.
            </p>
            
            <div className="space-y-3">
              {HUBS.map(hub => (
                <label
                  key={hub.id}
                  className={`block p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedHubs.has(hub.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedHubs.has(hub.id)}
                      onChange={() => handleToggleHub(hub.id)}
                      className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{hub.name}</div>
                      <div className="text-sm text-gray-600 mt-0.5">{hub.description}</div>
                    </div>
                    {selectedHubs.has(hub.id) && (
                      <Check className="w-5 h-5 text-blue-600 mt-0.5" />
                    )}
                  </div>
                </label>
              ))}
            </div>

          </div>

          {/* Capabilities */}
          {agent.capabilities.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Capabilities</h3>
              <div className="flex flex-wrap gap-2">
                {agent.capabilities.map((capability, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {capability}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  )
}