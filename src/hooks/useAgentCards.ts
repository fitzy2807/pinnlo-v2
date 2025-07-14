'use client'

import { useState, useCallback, useEffect } from 'react'
import { getAllAgents, updateAgentHubAssignment as updateAgentHubs, getAgentMetadata } from '@/lib/agentRegistry'

export interface AgentCard {
  id: string
  name: string
  description: string
  type: 'analyzer' | 'creator' | 'processor' | 'automation'
  capabilities: string[]
  availableInHubs: string[]
  configuration: {
    requiresApiKey?: boolean
    customSettings?: Record<string, any>
  }
  icon: string
  component: string
  status: 'active' | 'beta' | 'deprecated'
  version: string
  author: string
  lastUpdated: string
  createdAt: string
  section?: string
}

// Mock initial agents data
const initialAgents: AgentCard[] = [
  {
    id: '1',
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
    id: '2',
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
    id: '3',
    name: 'Text & Paste Processor',
    description: 'Process pasted text to extract insights',
    type: 'processor',
    capabilities: ['Process text', 'Extract entities', 'Generate summaries'],
    availableInHubs: ['intelligence'],
    configuration: {
      requiresApiKey: false
    },
    icon: 'Type',
    component: 'TextPasteAgent',
    status: 'active',
    version: '1.2.0',
    author: 'PINNLO Team',
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    section: 'research-discovery'
  },
  {
    id: '4',
    name: 'Automation Agent',
    description: 'Create and manage automated intelligence card generation rules',
    type: 'automation',
    capabilities: ['Schedule automation', 'Generate cards', 'Manage rules'],
    availableInHubs: ['intelligence'],
    configuration: {
      requiresApiKey: false
    },
    icon: 'Zap',
    component: 'AutomationAgent',
    status: 'active',
    version: '1.0.0',
    author: 'PINNLO Team',
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    section: 'automation'
  }
]

export function useAgentCards() {
  const [cards, setCards] = useState<AgentCard[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load agents from registry on mount
  useEffect(() => {
    const loadAgents = () => {
      const registryAgents = getAllAgents()
      const agentCards: AgentCard[] = registryAgents.map(agent => ({
        id: agent.id,
        name: agent.name,
        description: agent.description,
        type: agent.type || 'creator',
        capabilities: agent.capabilities || [],
        availableInHubs: agent.availableInHubs,
        configuration: agent.configuration || {},
        icon: agent.icon,
        component: agent.component,
        status: agent.status,
        version: agent.version,
        author: agent.author,
        lastUpdated: agent.lastUpdated,
        createdAt: agent.createdAt,
        section: agent.section
      }))
      setCards(agentCards)
    }
    loadAgents()
  }, [])

  const createCard = useCallback(async (cardData: Partial<AgentCard>) => {
    setLoading(true)
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const newCard: AgentCard = {
        id: Date.now().toString(),
        name: cardData.name || 'New Agent',
        description: cardData.description || '',
        type: cardData.type || 'creator',
        capabilities: cardData.capabilities || [],
        availableInHubs: cardData.availableInHubs || [],
        configuration: cardData.configuration || {},
        icon: cardData.icon || 'Bot',
        component: cardData.component || 'PlaceholderAgent',
        status: cardData.status || 'beta',
        version: cardData.version || '1.0.0',
        author: cardData.author || 'User',
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        section: cardData.section || 'custom-agents'
      }
      
      setCards(prev => [...prev, newCard])
      return newCard
    } catch (err) {
      setError('Failed to create agent')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateCard = useCallback(async (cardId: string, updates: Partial<AgentCard>) => {
    setLoading(true)
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setCards(prev => prev.map(card => 
        card.id === cardId 
          ? { ...card, ...updates, lastUpdated: new Date().toISOString() }
          : card
      ))
      
      return true
    } catch (err) {
      setError('Failed to update agent')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteCard = useCallback(async (cardId: string) => {
    setLoading(true)
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setCards(prev => prev.filter(card => card.id !== cardId))
      return true
    } catch (err) {
      setError('Failed to delete agent')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateAgentHubAssignment = useCallback(async (agentId: string, hubIds: string[]) => {
    setLoading(true)
    try {
      // Update in the agent registry
      updateAgentHubs(agentId, hubIds as ('intelligence' | 'strategy' | 'development' | 'organisation')[])
      
      // Update local state
      setCards(prev => prev.map(card => 
        card.id === agentId 
          ? { ...card, availableInHubs: hubIds, lastUpdated: new Date().toISOString() }
          : card
      ))
      
      return true
    } catch (err) {
      setError('Failed to update hub assignments')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getAgentsForHub = useCallback((hubId: string) => {
    return cards.filter(card => card.availableInHubs.includes(hubId))
  }, [cards])

  return {
    cards,
    loading,
    error,
    createCard,
    updateCard,
    deleteCard,
    updateAgentHubAssignment,
    getAgentsForHub
  }
}