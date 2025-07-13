import { useState, useCallback, useRef, useEffect } from 'react'
import { toast } from 'react-hot-toast'

export type ActionType = 'field_change' | 'batch_update' | 'create' | 'delete' | 'restore' | 'ai_enhance'

export interface UndoAction<T> {
  id: string
  type: ActionType
  timestamp: Date
  description: string
  field?: keyof T
  previousValue?: any
  newValue?: any
  metadata?: Record<string, any>
}

export interface HistoryEntry<T> {
  timestamp: Date
  data: T
  actions: UndoAction<T>[]
  merged?: boolean
}

export interface UseUndoOptions {
  maxHistorySize?: number
  mergingDelay?: number
  enableBatching?: boolean
  persistHistory?: boolean
  storageKey?: string
}

export interface UndoHistoryStats {
  totalEntries: number
  totalActions: number
  currentPosition: number
  canUndo: boolean
  canRedo: boolean
  memoryUsage: number
}

// Enhanced undo/redo hook with comprehensive functionality
export function useAdvancedUndo<T extends Record<string, any>>(
  initialData: T,
  options: UseUndoOptions = {}
) {
  const {
    maxHistorySize = 50,
    mergingDelay = 1000,
    enableBatching = true,
    persistHistory = false,
    storageKey = 'undo-history'
  } = options

  const [currentIndex, setCurrentIndex] = useState(0)
  const [history, setHistory] = useState<HistoryEntry<T>[]>([
    {
      timestamp: new Date(),
      data: { ...initialData },
      actions: [{
        id: generateId(),
        type: 'create',
        timestamp: new Date(),
        description: 'Initial state'
      }]
    }
  ])

  // Refs for managing state
  const isUndoingRef = useRef(false)
  const pendingActionsRef = useRef<UndoAction<T>[]>([])
  const mergingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const listeners = useRef<Set<(event: string, data?: any) => void>>(new Set())

  // Load persisted history on mount
  useEffect(() => {
    if (persistHistory && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey)
        if (saved) {
          const { history: savedHistory, currentIndex: savedIndex } = JSON.parse(saved)
          if (Array.isArray(savedHistory) && savedHistory.length > 0) {
            setHistory(savedHistory.map(entry => ({
              ...entry,
              timestamp: new Date(entry.timestamp),
              actions: entry.actions.map((action: any) => ({
                ...action,
                timestamp: new Date(action.timestamp)
              }))
            })))
            setCurrentIndex(savedIndex)
          }
        }
      } catch (error) {
        console.warn('Failed to load undo history:', error)
      }
    }
  }, [persistHistory, storageKey])

  // Save history to localStorage
  const saveHistory = useCallback(() => {
    if (persistHistory && typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify({
          history: history.slice(-maxHistorySize),
          currentIndex: Math.min(currentIndex, maxHistorySize - 1)
        }))
      } catch (error) {
        console.warn('Failed to save undo history:', error)
      }
    }
  }, [persistHistory, storageKey, history, currentIndex, maxHistorySize])

  // Generate unique IDs
  function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Emit events to listeners
  const emit = useCallback((event: string, data?: any) => {
    listeners.current.forEach(listener => {
      try {
        listener(event, data)
      } catch (error) {
        console.error('Undo listener error:', error)
      }
    })
  }, [])

  // Add event listener
  const addEventListener = useCallback((listener: (event: string, data?: any) => void) => {
    listeners.current.add(listener)
    return () => listeners.current.delete(listener)
  }, [])

  // Check if two actions should be merged
  const shouldMergeActions = useCallback((
    action1: UndoAction<T>,
    action2: UndoAction<T>
  ): boolean => {
    if (!enableBatching) return false
    
    // Merge same field changes within time window
    if (action1.type === 'field_change' && 
        action2.type === 'field_change' && 
        action1.field === action2.field) {
      const timeDiff = action2.timestamp.getTime() - action1.timestamp.getTime()
      return timeDiff < mergingDelay
    }
    
    return false
  }, [enableBatching, mergingDelay])

  // Merge two history entries
  const mergeEntries = useCallback((
    entry1: HistoryEntry<T>,
    entry2: HistoryEntry<T>
  ): HistoryEntry<T> => {
    return {
      timestamp: entry2.timestamp,
      data: entry2.data,
      actions: [...entry1.actions, ...entry2.actions],
      merged: true
    }
  }, [])

  // Add a new entry to history with smart merging
  const addToHistory = useCallback((
    data: T,
    actions: UndoAction<T> | UndoAction<T>[]
  ) => {
    if (isUndoingRef.current) return

    const actionsArray = Array.isArray(actions) ? actions : [actions]
    
    setHistory(prev => {
      // Remove any entries after current index
      let newHistory = prev.slice(0, currentIndex + 1)
      
      const newEntry: HistoryEntry<T> = {
        timestamp: new Date(),
        data: { ...data },
        actions: actionsArray
      }

      // Try to merge with the last entry if conditions are met
      if (newHistory.length > 0 && enableBatching) {
        const lastEntry = newHistory[newHistory.length - 1]
        const lastAction = lastEntry.actions[lastEntry.actions.length - 1]
        const newAction = actionsArray[0]

        if (shouldMergeActions(lastAction, newAction)) {
          newHistory[newHistory.length - 1] = mergeEntries(lastEntry, newEntry)
          return newHistory
        }
      }

      // Add as new entry
      newHistory.push(newEntry)
      
      // Limit history size
      if (newHistory.length > maxHistorySize) {
        const excess = newHistory.length - maxHistorySize
        newHistory = newHistory.slice(excess)
        setCurrentIndex(maxHistorySize - 1)
      } else {
        setCurrentIndex(newHistory.length - 1)
      }
      
      return newHistory
    })

    emit('history-added', { actions: actionsArray, data })
  }, [currentIndex, maxHistorySize, enableBatching, shouldMergeActions, mergeEntries, emit])

  // Add a field change action
  const addFieldChange = useCallback((
    field: keyof T,
    previousValue: any,
    newValue: any,
    newData: T,
    description?: string
  ) => {
    const action: UndoAction<T> = {
      id: generateId(),
      type: 'field_change',
      timestamp: new Date(),
      description: description || `Changed ${String(field)}`,
      field,
      previousValue,
      newValue
    }

    addToHistory(newData, action)
  }, [addToHistory])

  // Add a batch update action
  const addBatchUpdate = useCallback((
    changes: Array<{ field: keyof T; previousValue: any; newValue: any }>,
    newData: T,
    description?: string
  ) => {
    const actions: UndoAction<T>[] = changes.map(change => ({
      id: generateId(),
      type: 'field_change',
      timestamp: new Date(),
      description: `Changed ${String(change.field)}`,
      field: change.field,
      previousValue: change.previousValue,
      newValue: change.newValue
    }))

    // Add a parent batch action
    actions.unshift({
      id: generateId(),
      type: 'batch_update',
      timestamp: new Date(),
      description: description || `Batch update (${changes.length} fields)`,
      metadata: { fieldCount: changes.length }
    })

    addToHistory(newData, actions)
  }, [addToHistory])

  // Add an AI enhancement action
  const addAIEnhancement = useCallback((
    field: keyof T,
    previousValue: any,
    newValue: any,
    newData: T,
    enhancementType: string = 'general'
  ) => {
    const action: UndoAction<T> = {
      id: generateId(),
      type: 'ai_enhance',
      timestamp: new Date(),
      description: `AI enhanced ${String(field)}`,
      field,
      previousValue,
      newValue,
      metadata: { enhancementType }
    }

    addToHistory(newData, action)
  }, [addToHistory])

  // Undo to previous state
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      isUndoingRef.current = true
      
      const newIndex = currentIndex - 1
      setCurrentIndex(newIndex)
      
      const previousEntry = history[newIndex]
      const undoneEntry = history[currentIndex]
      
      isUndoingRef.current = false
      
      // Show toast with undo description
      const actionDescriptions = undoneEntry.actions.map(a => a.description).join(', ')
      toast.success(`Undone: ${actionDescriptions}`, {
        duration: 3000,
        icon: '↶'
      })
      
      emit('undo', { 
        undoneEntry, 
        newData: previousEntry.data,
        newIndex 
      })
      
      return previousEntry.data
    }
    return null
  }, [currentIndex, history, emit])

  // Redo to next state
  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      isUndoingRef.current = true
      
      const newIndex = currentIndex + 1
      setCurrentIndex(newIndex)
      
      const nextEntry = history[newIndex]
      
      isUndoingRef.current = false
      
      // Show toast with redo description
      const actionDescriptions = nextEntry.actions.map(a => a.description).join(', ')
      toast.success(`Redone: ${actionDescriptions}`, {
        duration: 3000,
        icon: '↷'
      })
      
      emit('redo', { 
        redoneEntry: nextEntry, 
        newData: nextEntry.data,
        newIndex 
      })
      
      return nextEntry.data
    }
    return null
  }, [currentIndex, history, emit])

  // Jump to specific point in history
  const jumpToIndex = useCallback((index: number) => {
    if (index >= 0 && index < history.length) {
      isUndoingRef.current = true
      setCurrentIndex(index)
      const entry = history[index]
      isUndoingRef.current = false
      
      emit('jump', { entry, newData: entry.data, newIndex: index })
      return entry.data
    }
    return null
  }, [history, emit])

  // Get current data from history
  const getCurrentData = useCallback(() => {
    return history[currentIndex]?.data || initialData
  }, [history, currentIndex, initialData])

  // Clear history
  const clearHistory = useCallback(() => {
    const newHistory = [{
      timestamp: new Date(),
      data: getCurrentData(),
      actions: [{
        id: generateId(),
        type: 'create' as ActionType,
        timestamp: new Date(),
        description: 'History cleared'
      }]
    }]
    
    setHistory(newHistory)
    setCurrentIndex(0)
    
    emit('history-cleared')
    toast.info('History cleared')
  }, [getCurrentData, emit])

  // Get history for a specific field
  const getFieldHistory = useCallback((field: keyof T) => {
    return history
      .flatMap(entry => entry.actions)
      .filter(action => action.field === field)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }, [history])

  // Get recent actions
  const getRecentActions = useCallback((limit: number = 10) => {
    return history
      .slice(Math.max(0, currentIndex - limit + 1), currentIndex + 1)
      .flatMap(entry => entry.actions)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }, [history, currentIndex])

  // Get statistics
  const getStats = useCallback((): UndoHistoryStats => {
    const totalActions = history.reduce((sum, entry) => sum + entry.actions.length, 0)
    const memoryUsage = JSON.stringify(history).length
    
    return {
      totalEntries: history.length,
      totalActions,
      currentPosition: currentIndex,
      canUndo: currentIndex > 0,
      canRedo: currentIndex < history.length - 1,
      memoryUsage
    }
  }, [history, currentIndex])

  // Compress history by removing intermediate entries
  const compressHistory = useCallback((compressionRatio: number = 0.5) => {
    if (history.length <= maxHistorySize * 0.8) return

    const keepEvery = Math.ceil(1 / compressionRatio)
    const compressedHistory = history.filter((_, index) => 
      index === 0 || // Keep first entry
      index === history.length - 1 || // Keep last entry
      index === currentIndex || // Keep current entry
      index % keepEvery === 0 // Keep every nth entry
    )

    setHistory(compressedHistory)
    
    // Adjust current index
    const newIndex = compressedHistory.findIndex(entry => 
      entry.timestamp === history[currentIndex].timestamp
    )
    setCurrentIndex(Math.max(0, newIndex))
    
    emit('history-compressed', { 
      originalSize: history.length, 
      newSize: compressedHistory.length 
    })
  }, [history, currentIndex, maxHistorySize, emit])

  // Save history periodically if persistence is enabled
  useEffect(() => {
    if (persistHistory) {
      const saveTimeout = setTimeout(saveHistory, 1000)
      return () => clearTimeout(saveTimeout)
    }
  }, [history, currentIndex, persistHistory, saveHistory])

  // Check if we can undo/redo
  const canUndo = currentIndex > 0
  const canRedo = currentIndex < history.length - 1

  return {
    // Core functionality
    undo,
    redo,
    canUndo,
    canRedo,
    
    // Data access
    getCurrentData,
    history,
    currentIndex,
    
    // Advanced features
    addToHistory,
    addFieldChange,
    addBatchUpdate,
    addAIEnhancement,
    jumpToIndex,
    
    // Utilities
    clearHistory,
    getFieldHistory,
    getRecentActions,
    getStats,
    compressHistory,
    
    // Events
    addEventListener,
    
    // Computed properties
    historySize: history.length,
    stats: getStats()
  }
}

// Backward compatibility - simple undo hook
export function useUndo<T extends Record<string, any>>(
  initialData: T,
  options: UseUndoOptions = {}
) {
  const { maxHistorySize = 20 } = options

  const [currentIndex, setCurrentIndex] = useState(0)
  const [history, setHistory] = useState<HistoryEntry<T>[]>([
    {
      timestamp: new Date(),
      data: initialData,
      actions: [{
        id: `${Date.now()}-init`,
        type: 'create',
        timestamp: new Date(),
        description: 'Initial state'
      }]
    }
  ])

  const isUndoingRef = useRef(false)

  const addToHistory = useCallback((
    data: T,
    field?: keyof T,
    previousValue?: any,
    newValue?: any
  ) => {
    if (isUndoingRef.current) return

    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1)
      
      const entry: HistoryEntry<T> = {
        timestamp: new Date(),
        data: { ...data },
        actions: [{
          id: `${Date.now()}-${Math.random()}`,
          type: 'field_change',
          timestamp: new Date(),
          description: field ? `Changed ${String(field)}` : 'Updated',
          field,
          previousValue,
          newValue
        }]
      }
      
      newHistory.push(entry)
      
      if (newHistory.length > maxHistorySize) {
        newHistory.shift()
      } else {
        setCurrentIndex(newHistory.length - 1)
      }
      
      return newHistory
    })
  }, [currentIndex, maxHistorySize])

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      isUndoingRef.current = true
      setCurrentIndex(prev => prev - 1)
      const previousEntry = history[currentIndex - 1]
      isUndoingRef.current = false
      return previousEntry.data
    }
    return null
  }, [currentIndex, history])

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      isUndoingRef.current = true
      setCurrentIndex(prev => prev + 1)
      const nextEntry = history[currentIndex + 1]
      isUndoingRef.current = false
      return nextEntry.data
    }
    return null
  }, [currentIndex, history])

  const getCurrentData = useCallback(() => {
    return history[currentIndex]?.data || initialData
  }, [history, currentIndex, initialData])

  const clearHistory = useCallback(() => {
    setHistory([{
      timestamp: new Date(),
      data: getCurrentData(),
      actions: [{
        id: `${Date.now()}-clear`,
        type: 'create',
        timestamp: new Date(),
        description: 'History cleared'
      }]
    }])
    setCurrentIndex(0)
  }, [getCurrentData])

  const getFieldHistory = useCallback((field: keyof T) => {
    return history
      .flatMap(entry => entry.actions)
      .filter(action => action.field === field)
  }, [history])

  const canUndo = currentIndex > 0
  const canRedo = currentIndex < history.length - 1

  return {
    undo,
    redo,
    canUndo,
    canRedo,
    history,
    currentIndex,
    addToHistory,
    clearHistory,
    getFieldHistory,
    getCurrentData,
    historySize: history.length
  }
}