'use client'

import React, { Suspense, lazy, useMemo } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import type { AgentComponentProps } from './types'

interface AgentLoaderProps extends AgentComponentProps {
  /**
   * The agent ID or component name to load
   */
  agentId: string
}

// Map of agent IDs to their component imports
const agentComponents = {
  'CardCreatorAgent': lazy(() => import('./CardCreatorAgent')),
  'UrlAnalyzerAgent': lazy(() => import('./UrlAnalyzerAgent')),
  'TextPasteAgent': lazy(() => import('./TextPasteAgent')),
  'AutomationAgent': lazy(() => import('./AutomationAgent')),
}

// Loading component
function AgentLoading() {
  return (
    <div className="h-full flex items-center justify-center bg-white">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Loading agent...</p>
      </div>
    </div>
  )
}

// Error boundary component
class AgentErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Agent loading error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex items-center justify-center bg-white p-8">
          <div className="text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Failed to load agent
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-800 text-white text-sm rounded hover:bg-gray-700 transition-colors"
            >
              Reload page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Agent not found component
function AgentNotFound({ agentId }: { agentId: string }) {
  return (
    <div className="h-full flex items-center justify-center bg-white p-8">
      <div className="text-center max-w-md">
        <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Agent not found
        </h3>
        <p className="text-sm text-gray-600">
          The agent &ldquo;{agentId}&rdquo; could not be found. It may have been removed or renamed.
        </p>
      </div>
    </div>
  )
}

/**
 * Dynamically loads and renders agent components
 */
export default function AgentLoader({ agentId, onClose, configuration }: AgentLoaderProps) {
  // Get the component for this agent
  const AgentComponent = useMemo(() => {
    const component = agentComponents[agentId as keyof typeof agentComponents]
    return component || null
  }, [agentId])

  // If agent not found, show error
  if (!AgentComponent) {
    return <AgentNotFound agentId={agentId} />
  }

  // Render the agent with error boundary and loading state
  return (
    <AgentErrorBoundary>
      <Suspense fallback={<AgentLoading />}>
        <AgentComponent onClose={onClose} configuration={configuration} />
      </Suspense>
    </AgentErrorBoundary>
  )
}