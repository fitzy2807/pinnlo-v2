/**
 * Standard interface for all agent components in PINNLO V2
 */

export interface AgentComponentProps {
  /**
   * Callback function to close the agent
   */
  onClose: () => void
  
  /**
   * Optional configuration for the agent
   */
  configuration?: {
    /**
     * The hub context where the agent is being used
     */
    hubContext?: 'intelligence' | 'strategy' | 'development' | 'organisation'
    
    /**
     * Default category for intelligence cards (if applicable)
     */
    defaultCategory?: string
    
    /**
     * Default content type for processing (if applicable)
     */
    defaultContentType?: string
    
    /**
     * Any additional agent-specific configuration
     */
    [key: string]: any
  }
}

/**
 * Standard metadata for agent registration
 */
export interface AgentMetadata {
  id: string
  name: string
  description: string
  type: 'analyzer' | 'creator' | 'processor' | 'automation'
  capabilities: string[]
  availableInHubs: ('intelligence' | 'strategy' | 'development' | 'organisation')[]
  configuration: {
    requiresApiKey?: boolean
    customSettings?: Record<string, any>
  }
  icon: string // Lucide icon name
  component: string // Component name to render
  status: 'active' | 'beta' | 'deprecated'
  version: string
  author: string
  lastUpdated: string
  createdAt: string
  section?: string
}

/**
 * Agent component type definition
 */
export type AgentComponent = React.FC<AgentComponentProps>

/**
 * Agent registry entry combining metadata and component
 */
export interface AgentRegistryEntry {
  metadata: AgentMetadata
  component: AgentComponent
}