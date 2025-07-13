'use client'

import React, { useState, useEffect } from 'react'
import { X, Keyboard, Search, Settings, RotateCcw } from 'lucide-react'
import { ShortcutHelpGroup, ShortcutContext } from '../hooks/useKeyboardShortcuts'

interface KeyboardShortcutsHelpProps {
  isOpen: boolean
  onClose: () => void
  helpGroups: ShortcutHelpGroup[]
  onCustomize?: () => void
  context?: ShortcutContext
}

export function KeyboardShortcutsHelp({
  isOpen,
  onClose,
  helpGroups,
  onCustomize,
  context = 'global'
}: KeyboardShortcutsHelpProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Filter shortcuts based on search and category
  const filteredGroups = helpGroups
    .map(group => ({
      ...group,
      shortcuts: group.shortcuts.filter(shortcut =>
        (selectedCategory === 'all' || group.category === selectedCategory) &&
        (searchTerm === '' || 
         shortcut.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
         shortcut.keys.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }))
    .filter(group => group.shortcuts.length > 0)

  // Get all categories
  const categories = ['all', ...Array.from(new Set(helpGroups.map(g => g.category)))]

  // Reset search when opening
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('')
      setSelectedCategory('all')
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Keyboard className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Keyboard Shortcuts
              </h2>
              <p className="text-sm text-gray-500">
                Current context: <span className="font-medium">{context}</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {onCustomize && (
              <button
                onClick={onCustomize}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Customize shortcuts"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search and filters */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search shortcuts..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Shortcuts list */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredGroups.length === 0 ? (
            <div className="text-center py-12">
              <Keyboard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No shortcuts found</p>
              <p className="text-gray-400 text-sm">
                Try adjusting your search or category filter
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredGroups.map(group => (
                <div key={group.category}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span>{group.category}</span>
                    <span className="text-sm font-normal text-gray-500">
                      ({group.shortcuts.length} shortcuts)
                    </span>
                  </h3>
                  
                  <div className="grid gap-3 md:grid-cols-2">
                    {group.shortcuts.map((shortcut, index) => (
                      <div
                        key={`${group.category}-${index}`}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {shortcut.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Context: {shortcut.context}
                          </p>
                        </div>
                        
                        <div className="ml-4">
                          <KeyCombination keys={shortcut.keys} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>💡 Tip: Most shortcuts work with Cmd on Mac, Ctrl on Windows/Linux</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span>Press</span>
              <KeyCombination keys="?" />
              <span>to open this help anytime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Component to display key combinations
function KeyCombination({ keys }: { keys: string }) {
  const keyParts = keys.split('+').map(key => key.trim())
  
  return (
    <div className="flex items-center gap-1">
      {keyParts.map((key, index) => (
        <React.Fragment key={key}>
          {index > 0 && <span className="text-gray-400 text-xs">+</span>}
          <kbd className="inline-flex items-center px-2 py-1 bg-white border border-gray-300 rounded text-xs font-medium text-gray-700 shadow-sm min-w-[24px] h-6 justify-center">
            {formatKey(key)}
          </kbd>
        </React.Fragment>
      ))}
    </div>
  )
}

// Format key names for display
function formatKey(key: string): string {
  const keyMap: Record<string, string> = {
    'ctrl': '⌃',
    'cmd': '⌘',
    'shift': '⇧',
    'alt': '⌥',
    'option': '⌥',
    'meta': '⌘',
    'enter': '↵',
    'return': '↵',
    'backspace': '⌫',
    'delete': '⌦',
    'del': '⌦',
    'tab': '⇥',
    'space': '␣',
    'esc': '⎋',
    'escape': '⎋',
    'up': '↑',
    'down': '↓',
    'left': '←',
    'right': '→',
    'home': '↖',
    'end': '↘',
    'pageup': '⇞',
    'pagedown': '⇟'
  }

  return keyMap[key.toLowerCase()] || key.toUpperCase()
}

// Hook to manage keyboard shortcuts help
export function useKeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false)

  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)
  const toggle = () => setIsOpen(prev => !prev)

  return {
    isOpen,
    open,
    close,
    toggle
  }
}