'use client'

import { useEffect } from 'react'
import { clearAgentRegistry } from '@/lib/clearAgentRegistry'

export default function AgentRegistryInit() {
  useEffect(() => {
    // Make clearAgentRegistry available globally for debugging
    if (typeof window !== 'undefined') {
      (window as any).clearAgentRegistry = clearAgentRegistry
    }
  }, [])

  return null
}