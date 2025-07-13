import { useEffect, useCallback, useRef } from 'react'

type KeyboardShortcut = {
  key: string
  ctrl?: boolean
  cmd?: boolean
  shift?: boolean
  alt?: boolean
  handler: () => void
}

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
      // Don't trigger shortcuts when typing in form fields
      const target = e.target as HTMLElement
      const isFormField = target.matches('input, textarea, select, [contenteditable="true"]')
      
      // Allow shortcuts with modifiers even in form fields (like Ctrl+S)
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

      // Handle cmd/ctrl interchangeably for cross-platform
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

// Hook for multiple shortcuts
export function useKeyboardShortcuts(
  shortcuts: Record<string, () => void>,
  enabled: boolean = true
) {
  Object.entries(shortcuts).forEach(([shortcut, handler]) => {
    useKeyboardShortcut(shortcut, handler, enabled)
  })
}