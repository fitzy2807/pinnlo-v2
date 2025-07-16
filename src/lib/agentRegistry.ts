/**
 * Agent Registry System
 * 
 * Manages the registration and assignment of agents to different hubs
 */

import type { AgentMetadata } from '@/components/shared/agents/types'

// Default agent configurations
const defaultAgents: AgentMetadata[] = [
  {
    id: 'CardCreatorAgent',
    name: 'Card Creator',
    description: 'Create and edit cards with AI assistance',
    type: 'creator',
    capabilities: ['Generate content', 'Edit cards', 'AI enhancement'],
    availableInHubs: ['intelligence', 'strategy', 'development', 'organisation'],
    configuration: {
      requiresApiKey: false
    },
    icon: 'FileText',
    component: 'CardCreatorAgent',
    status: 'active',
    version: '2.0.0',
    author: 'PINNLO Team',
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    section: 'content-creation'
  },
  {
    id: 'UrlAnalyzerAgent',
    name: 'URL Analyzer',
    description: 'Analyze web pages and extract intelligence',
    type: 'analyzer',
    capabilities: ['Extract content', 'Analyze data', 'Generate insights'],
    availableInHubs: ['intelligence'],
    configuration: {
      requiresApiKey: false
    },
    icon: 'Link',
    component: 'UrlAnalyzerAgent',
    status: 'active',
    version: '1.5.0',
    author: 'PINNLO Team',
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    section: 'data-analysis'
  },
  {
    id: 'TextPasteAgent',
    name: 'Text & Paste',
    description: 'Process text content and transcripts to extract intelligence',
    type: 'processor',
    capabilities: ['Process text', 'Extract entities', 'Generate summaries', 'Interview analysis'],
    availableInHubs: ['intelligence'],
    configuration: {
      requiresApiKey: false
    },
    icon: 'FileText',
    component: 'TextPasteAgent',
    status: 'active',
    version: '1.3.0',
    author: 'PINNLO Team',
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    section: 'research-discovery'
  },
  {
    id: 'automation-agent',
    name: 'Automation Agent',
    description: 'Create and manage automated intelligence card generation rules',
    type: 'automation',
    icon: 'Zap',
    availableInHubs: ['intelligence'],
    component: 'AutomationAgent',
    status: 'active',
    version: '1.0.0',
    author: 'PINNLO Team',
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    section: 'automation',
    capabilities: ['Schedule automation', 'Generate cards', 'Manage rules'],
    configuration: {
      requiresApiKey: false
    }
  }
]

// Storage key for localStorage
const AGENT_REGISTRY_KEY = 'pinnlo_agent_registry'

class AgentRegistry {
  private agents: Map<string, AgentMetadata>

  constructor() {
    this.agents = new Map()
    this.loadFromStorage()
  }

  /**
   * Load agents from localStorage
   */
  private loadFromStorage() {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        // Server-side: just load defaults
        defaultAgents.forEach(agent => {
          this.agents.set(agent.id, agent)
        })
        return
      }

      const stored = localStorage.getItem(AGENT_REGISTRY_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        Object.entries(parsed).forEach(([id, metadata]) => {
          this.agents.set(id, metadata as AgentMetadata)
        })
      } else {
        // Initialize with default agents
        defaultAgents.forEach(agent => {
          this.agents.set(agent.id, agent)
        })
        this.saveToStorage()
      }
    } catch (error) {
      console.error('Failed to load agent registry:', error)
      // Fallback to defaults
      defaultAgents.forEach(agent => {
        this.agents.set(agent.id, agent)
      })
    }
  }

  /**
   * Save agents to localStorage
   */
  private saveToStorage() {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        // Server-side: skip saving
        return
      }

      const data: Record<string, AgentMetadata> = {}
      this.agents.forEach((metadata, id) => {
        data[id] = metadata
      })
      localStorage.setItem(AGENT_REGISTRY_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save agent registry:', error)
    }
  }

  /**
   * Get all agents
   */
  getAllAgents(): AgentMetadata[] {
    return Array.from(this.agents.values())
  }

  /**
   * Get agents available for a specific hub
   */
  getAgentsForHub(hubId: 'intelligence' | 'strategy' | 'development' | 'organisation'): AgentMetadata[] {
    return this.getAllAgents().filter(agent => 
      agent.availableInHubs.includes(hubId) && agent.status === 'active'
    )
  }

  /**
   * Get a specific agent by ID
   */
  getAgentById(agentId: string): AgentMetadata | null {
    return this.agents.get(agentId) || null
  }

  /**
   * Update which hubs an agent is available in
   */
  updateAgentHubAssignment(agentId: string, hubIds: ('intelligence' | 'strategy' | 'development' | 'organisation')[]) {
    const agent = this.agents.get(agentId)
    if (agent) {
      agent.availableInHubs = hubIds
      agent.lastUpdated = new Date().toISOString()
      this.agents.set(agentId, agent)
      this.saveToStorage()
    }
  }

  /**
   * Register a new agent
   */
  registerAgent(metadata: AgentMetadata) {
    this.agents.set(metadata.id, metadata)
    this.saveToStorage()
  }

  /**
   * Update agent metadata
   */
  updateAgent(agentId: string, updates: Partial<AgentMetadata>) {
    const agent = this.agents.get(agentId)
    if (agent) {
      const updated = {
        ...agent,
        ...updates,
        id: agent.id, // Prevent ID changes
        lastUpdated: new Date().toISOString()
      }
      this.agents.set(agentId, updated)
      this.saveToStorage()
    }
  }

  /**
   * Remove an agent (soft delete - sets status to deprecated)
   */
  deprecateAgent(agentId: string) {
    const agent = this.agents.get(agentId)
    if (agent) {
      agent.status = 'deprecated'
      agent.lastUpdated = new Date().toISOString()
      this.agents.set(agentId, agent)
      this.saveToStorage()
    }
  }

  /**
   * Reset to default agents
   */
  reset() {
    this.agents.clear()
    defaultAgents.forEach(agent => {
      this.agents.set(agent.id, agent)
    })
    this.saveToStorage()
  }
}

// Create singleton instance
const agentRegistry = new AgentRegistry()

// Export registry functions
export const getAgentsForHub = (hubId: 'intelligence' | 'strategy' | 'development' | 'organisation') => 
  agentRegistry.getAgentsForHub(hubId)

export const updateAgentHubAssignment = (agentId: string, hubIds: ('intelligence' | 'strategy' | 'development' | 'organisation')[]) => 
  agentRegistry.updateAgentHubAssignment(agentId, hubIds)

export const getAgentById = (agentId: string) => 
  agentRegistry.getAgentById(agentId)

export const getAllAgents = () => 
  agentRegistry.getAllAgents()

export const registerAgent = (metadata: AgentMetadata) => 
  agentRegistry.registerAgent(metadata)

export const updateAgent = (agentId: string, updates: Partial<AgentMetadata>) => 
  agentRegistry.updateAgent(agentId, updates)

export const deprecateAgent = (agentId: string) => 
  agentRegistry.deprecateAgent(agentId)

export const resetAgentRegistry = () => 
  agentRegistry.reset()

export default agentRegistry