import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'
import { CardData } from '@/types/card'

export interface AgentTool {
  id: string
  name: string
  description: string
  icon: LucideIcon
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'yellow'
  category: 'content' | 'research' | 'analytics' | 'automation' | 'utilities'
  contextual?: {
    hubs?: string[]      // Which hubs this tool is relevant for
    sections?: string[]  // Which sections this tool is relevant for
  }
  component: React.ComponentType<AgentToolProps>
}

export interface AgentToolProps {
  selectedHub: string
  selectedSection: string
  selectedCard: CardData | null
  onClose: () => void
  onComplete?: (result: AgentToolResult) => void
}

export interface AgentToolResult {
  type: 'cards' | 'insights' | 'data' | 'actions'
  data: any
  metadata?: {
    source: string
    timestamp: string
    context: string
  }
}

export interface AgentToolTemplate {
  title: string
  description: string
  icon: LucideIcon
  color: string
  children: ReactNode
  isLoading?: boolean
  progress?: number
  actions?: {
    primary?: {
      label: string
      onClick: () => void
      disabled?: boolean
      loading?: boolean
    }
    secondary?: {
      label: string
      onClick: () => void
      disabled?: boolean
    }
  }
}

export interface AgentToolsState {
  isOpen: boolean
  activeTool: string | null
  toolResults: Record<string, AgentToolResult>
  context: {
    selectedHub: string
    selectedSection: string
    selectedCard: CardData | null
  }
}