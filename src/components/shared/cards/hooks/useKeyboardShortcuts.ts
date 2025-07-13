import { useEffect, useCallback, useRef, useState, useMemo } from 'react'
import { toast } from 'react-hot-toast'

export type ShortcutContext = 'global' | 'card' | 'field' | 'navigation' | 'editor'

export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  cmd?: boolean
  shift?: boolean
  alt?: boolean
  handler: () => void
  context?: ShortcutContext
  description?: string
  category?: string
  enabled?: boolean
  sequence?: string[]
}

export interface ShortcutBinding {
  id: string
  keys: string
  handler: () => void
  description: string
  category: string
  context: ShortcutContext
  enabled: boolean
  priority?: number
}

export interface ShortcutHelpGroup {
  category: string
  shortcuts: Array<{
    keys: string
    description: string
    context: ShortcutContext
  }>
}

// Default keyboard shortcuts configuration
const DEFAULT_SHORTCUTS: Record<string, Omit<ShortcutBinding, 'handler'>> = {
  'save': {
    id: 'save',
    keys: 'ctrl+s',
    description: 'Save current card',
    category: 'File Operations',
    context: 'card',
    enabled: true,
    priority: 1
  },
  'undo': {
    id: 'undo',
    keys: 'ctrl+z',
    description: 'Undo last action',
    category: 'Editing',
    context: 'global',
    enabled: true,
    priority: 1
  },
  'redo': {
    id: 'redo',
    keys: 'ctrl+y',
    description: 'Redo last undone action',
    category: 'Editing',
    context: 'global',
    enabled: true,
    priority: 1
  },
  'toggleEdit': {
    id: 'toggleEdit',
    keys: 'e',
    description: 'Toggle edit mode',
    category: 'Card Actions',
    context: 'card',
    enabled: true
  },
  'newCard': {
    id: 'newCard',
    keys: 'ctrl+n',
    description: 'Create new card',
    category: 'File Operations',
    context: 'global',
    enabled: true
  },
  'duplicate': {
    id: 'duplicate',
    keys: 'ctrl+d',
    description: 'Duplicate current card',
    category: 'Card Actions',
    context: 'card',
    enabled: true
  },
  'delete': {
    id: 'delete',
    keys: 'del',
    description: 'Delete current card',
    category: 'Card Actions',
    context: 'card',
    enabled: true
  },
  'search': {
    id: 'search',
    keys: 'ctrl+f',
    description: 'Search cards',
    category: 'Navigation',
    context: 'global',
    enabled: true
  },
  'help': {
    id: 'help',
    keys: '?',
    description: 'Show keyboard shortcuts',
    category: 'Help',
    context: 'global',
    enabled: true
  },
  'aiSuggestions': {
    id: 'aiSuggestions',
    keys: 'ctrl+space',
    description: 'Get AI suggestions',
    category: 'AI Features',
    context: 'field',
    enabled: true
  },
  'enhanceAI': {
    id: 'enhanceAI',
    keys: 'ctrl+shift+e',
    description: 'Enhance field with AI',
    category: 'AI Features',
    context: 'field',
    enabled: true
  },
  'nextField': {
    id: 'nextField',
    keys: 'tab',
    description: 'Focus next field',
    category: 'Navigation',
    context: 'card',
    enabled: true
  },
  'prevField': {
    id: 'prevField',
    keys: 'shift+tab',
    description: 'Focus previous field',
    category: 'Navigation',
    context: 'card',
    enabled: true
  },
  'expandAll': {
    id: 'expandAll',
    keys: 'ctrl+shift+e',
    description: 'Expand all sections',
    category: 'View',
    context: 'card',
    enabled: true
  },
  'collapseAll': {
    id: 'collapseAll',
    keys: 'ctrl+shift+c',
    description: 'Collapse all sections',
    category: 'View',
    context: 'card',
    enabled: true
  }
}

// Advanced keyboard shortcuts manager
export class KeyboardShortcutsManager {
  private shortcuts: Map<string, ShortcutBinding> = new Map()
  private contexts: Set<ShortcutContext> = new Set()
  private activeContext: ShortcutContext = 'global'
  private sequenceBuffer: string[] = []
  private sequenceTimeout: NodeJS.Timeout | null = null
  private listeners: Set<(event: string, data?: any) => void> = new Set()

  constructor() {
    this.loadCustomShortcuts()
  }

  // Load custom shortcuts from localStorage
  private loadCustomShortcuts() {
    try {
      const saved = localStorage.getItem('keyboard-shortcuts-config')
      if (saved) {
        const customShortcuts = JSON.parse(saved)
        Object.entries(customShortcuts).forEach(([id, config]: [string, any]) => {
          if (DEFAULT_SHORTCUTS[id]) {
            this.shortcuts.set(id, {
              ...DEFAULT_SHORTCUTS[id],
              ...config,
              id
            } as ShortcutBinding)
          }
        })
      }
    } catch (error) {
      console.warn('Failed to load custom shortcuts:', error)
    }

    // Ensure all default shortcuts are loaded
    Object.entries(DEFAULT_SHORTCUTS).forEach(([id, config]) => {
      if (!this.shortcuts.has(id)) {
        this.shortcuts.set(id, {
          ...config,
          handler: () => {},
          id
        })
      }
    })
  }

  // Save custom shortcuts to localStorage
  private saveCustomShortcuts() {
    try {
      const customConfig: Record<string, any> = {}
      this.shortcuts.forEach((binding) => {
        const defaultConfig = DEFAULT_SHORTCUTS[binding.id]
        if (defaultConfig) {
          const changes: any = {}
          if (binding.keys !== defaultConfig.keys) changes.keys = binding.keys
          if (binding.enabled !== defaultConfig.enabled) changes.enabled = binding.enabled
          if (Object.keys(changes).length > 0) {
            customConfig[binding.id] = changes
          }
        }
      })
      localStorage.setItem('keyboard-shortcuts-config', JSON.stringify(customConfig))
    } catch (error) {
      console.warn('Failed to save custom shortcuts:', error)
    }
  }

  // Register a shortcut handler
  registerShortcut(id: string, handler: () => void): void {
    const binding = this.shortcuts.get(id)
    if (binding) {
      binding.handler = handler
    }
  }

  // Update shortcut configuration
  updateShortcut(id: string, updates: Partial<ShortcutBinding>): void {
    const binding = this.shortcuts.get(id)
    if (binding) {
      Object.assign(binding, updates)
      this.saveCustomShortcuts()
      this.emit('shortcut-updated', { id, binding })
    }
  }

  // Set active context
  setContext(context: ShortcutContext): void {
    this.activeContext = context
    this.contexts.add(context)
    this.emit('context-changed', { context })
  }

  // Remove context
  removeContext(context: ShortcutContext): void {
    this.contexts.delete(context)
    if (this.activeContext === context) {
      this.activeContext = this.contexts.size > 0 
        ? Array.from(this.contexts)[this.contexts.size - 1]
        : 'global'
    }
  }

  // Get shortcuts for current context
  getActiveShortcuts(): ShortcutBinding[] {
    return Array.from(this.shortcuts.values())
      .filter(binding => 
        binding.enabled && 
        (binding.context === 'global' || binding.context === this.activeContext)
      )
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))
  }

  // Get shortcuts grouped by category
  getShortcutHelp(): ShortcutHelpGroup[] {
    const groups: Record<string, ShortcutHelpGroup> = {}
    
    this.getActiveShortcuts().forEach(binding => {
      if (!groups[binding.category]) {
        groups[binding.category] = {
          category: binding.category,
          shortcuts: []
        }
      }
      
      groups[binding.category].shortcuts.push({
        keys: binding.keys,
        description: binding.description,
        context: binding.context
      })
    })

    return Object.values(groups)
  }

  // Parse shortcut string
  private parseShortcut(shortcut: string): KeyboardShortcut {
    const parts = shortcut.toLowerCase().split('+')
    const key = parts[parts.length - 1]
    
    return {
      key,
      ctrl: parts.includes('ctrl'),
      cmd: parts.includes('cmd'),
      shift: parts.includes('shift'),
      alt: parts.includes('alt'),
      handler: () => {}
    }
  }

  // Check if event matches shortcut
  private matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
    const isCtrlOrCmd = (event.ctrlKey || event.metaKey)
    const matchesCmdOrCtrl = (shortcut.cmd || shortcut.ctrl) ? isCtrlOrCmd : !isCtrlOrCmd
    
    return (
      event.key.toLowerCase() === shortcut.key &&
      matchesCmdOrCtrl &&
      !!event.shiftKey === !!shortcut.shift &&
      !!event.altKey === !!shortcut.alt
    )
  }

  // Handle keyboard event
  handleKeyEvent(event: KeyboardEvent): boolean {
    // Check if we should ignore this event
    const target = event.target as HTMLElement
    const isFormField = target.matches('input, textarea, select, [contenteditable="true"]')
    const hasModifier = event.ctrlKey || event.metaKey || event.altKey
    
    // Allow certain shortcuts even in form fields
    if (isFormField && !hasModifier && !['Escape', 'Tab'].includes(event.key)) {
      return false
    }

    // Clear sequence buffer on non-printable keys
    if (event.key.length > 1 && !['Shift', 'Control', 'Alt', 'Meta'].includes(event.key)) {
      this.clearSequenceBuffer()
    }

    // Try to match active shortcuts
    const activeShortcuts = this.getActiveShortcuts()
    
    for (const binding of activeShortcuts) {
      const shortcut = this.parseShortcut(binding.keys)
      
      if (this.matchesShortcut(event, shortcut)) {
        event.preventDefault()
        event.stopPropagation()
        
        try {
          binding.handler()
          this.emit('shortcut-executed', { id: binding.id })
          return true
        } catch (error) {
          console.error(`Error executing shortcut ${binding.id}:`, error)
          toast.error(`Shortcut error: ${binding.description}`)
        }
      }
    }

    return false
  }

  // Clear sequence buffer
  private clearSequenceBuffer(): void {
    this.sequenceBuffer = []
    if (this.sequenceTimeout) {
      clearTimeout(this.sequenceTimeout)
      this.sequenceTimeout = null
    }
  }

  // Add event listener
  addEventListener(listener: (event: string, data?: any) => void): void {
    this.listeners.add(listener)
  }

  // Remove event listener
  removeEventListener(listener: (event: string, data?: any) => void): void {
    this.listeners.delete(listener)
  }

  // Emit event
  private emit(event: string, data?: any): void {
    this.listeners.forEach(listener => {
      try {
        listener(event, data)
      } catch (error) {
        console.error('Keyboard shortcuts event listener error:', error)
      }
    })
  }

  // Reset to defaults
  resetToDefaults(): void {
    this.shortcuts.clear()
    localStorage.removeItem('keyboard-shortcuts-config')
    this.loadCustomShortcuts()
    this.emit('shortcuts-reset')
  }

  // Check for conflicts
  getConflicts(): Array<{ shortcut: string; bindings: ShortcutBinding[] }> {
    const conflicts: Array<{ shortcut: string; bindings: ShortcutBinding[] }> = []
    const keyMap: Record<string, ShortcutBinding[]> = {}

    this.shortcuts.forEach(binding => {
      if (!binding.enabled) return
      
      const key = `${binding.keys}-${binding.context}`
      if (!keyMap[key]) keyMap[key] = []
      keyMap[key].push(binding)
    })

    Object.entries(keyMap).forEach(([key, bindings]) => {
      if (bindings.length > 1) {
        conflicts.push({
          shortcut: key,
          bindings
        })
      }
    })

    return conflicts
  }
}

// Global shortcuts manager instance
const shortcutsManager = new KeyboardShortcutsManager()

// Enhanced keyboard shortcuts hook
export function useAdvancedKeyboardShortcuts(
  shortcuts: Record<string, () => void>,
  context: ShortcutContext = 'global',
  enabled: boolean = true
) {
  const [isEnabled, setIsEnabled] = useState(enabled)
  const shortcutsRef = useRef(shortcuts)
  
  shortcutsRef.current = shortcuts

  // Register shortcuts
  useEffect(() => {
    if (!isEnabled) return

    Object.entries(shortcuts).forEach(([id, handler]) => {
      shortcutsManager.registerShortcut(id, handler)
    })

    shortcutsManager.setContext(context)

    return () => {
      shortcutsManager.removeContext(context)
    }
  }, [shortcuts, context, isEnabled])

  // Global event listener
  useEffect(() => {
    if (!isEnabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      shortcutsManager.handleKeyEvent(event)
    }

    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [isEnabled])

  return {
    enabled: isEnabled,
    setEnabled: setIsEnabled,
    manager: shortcutsManager
  }
}

// Original simple hook for backward compatibility
export function useKeyboardShortcut(
  shortcut: string,
  handler: () => void,
  enabled: boolean = true
) {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  const parseShortcut = useCallback((shortcut: string): KeyboardShortcut => {
    const parts = shortcut.toLowerCase().split('+')
    const key = parts[parts.length - 1]
    
    return {
      key,
      ctrl: parts.includes('ctrl'),
      cmd: parts.includes('cmd'),
      shift: parts.includes('shift'),
      alt: parts.includes('alt'),
      handler: handlerRef.current
    }
  }, [])

  useEffect(() => {
    if (!enabled) return

    const shortcutConfig = parseShortcut(shortcut)

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isFormField = target.matches('input, textarea, select, [contenteditable="true"]')
      const hasModifier = e.ctrlKey || e.metaKey || e.altKey
      
      if (isFormField && !hasModifier) {
        return
      }

      const isCtrlOrCmd = (e.ctrlKey || e.metaKey)
      const matchesModifiers = 
        ((shortcutConfig.ctrl && e.ctrlKey) || (!shortcutConfig.ctrl && !e.ctrlKey)) &&
        ((shortcutConfig.cmd && e.metaKey) || (!shortcutConfig.cmd && !e.metaKey)) &&
        ((shortcutConfig.shift && e.shiftKey) || (!shortcutConfig.shift && !e.shiftKey)) &&
        ((shortcutConfig.alt && e.altKey) || (!shortcutConfig.alt && !e.altKey))

      const matchesCmdOrCtrl = (shortcutConfig.cmd || shortcutConfig.ctrl) ? isCtrlOrCmd : !isCtrlOrCmd

      if (e.key.toLowerCase() === shortcutConfig.key && matchesCmdOrCtrl && matchesModifiers) {
        e.preventDefault()
        shortcutConfig.handler()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcut, enabled, parseShortcut])
}

// Hook for multiple shortcuts (backward compatibility)
export function useKeyboardShortcuts(
  shortcuts: Record<string, () => void>,
  enabled: boolean = true
) {
  Object.entries(shortcuts).forEach(([shortcut, handler]) => {
    useKeyboardShortcut(shortcut, handler, enabled)
  })
}