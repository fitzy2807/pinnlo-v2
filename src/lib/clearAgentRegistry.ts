/**
 * Utility to clear and reset the agent registry
 * Run this in the browser console to reset agents to default
 */

export function clearAgentRegistry() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('pinnlo_agent_registry')
    console.log('Agent registry cleared. Refresh the page to load default agents.')
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).clearAgentRegistry = clearAgentRegistry
}