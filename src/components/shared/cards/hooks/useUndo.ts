import { useState, useCallback, useRef } from 'react'

interface HistoryEntry<T> {
  timestamp: Date
  data: T
  field?: keyof T
  previousValue?: any
  newValue?: any
}

interface UseUndoOptions {
  maxHistorySize?: number
}

export function useUndo<T extends Record<string, any>>(
  initialData: T,
  options: UseUndoOptions = {}
) {
  const { maxHistorySize = 20 } = options

  const [currentIndex, setCurrentIndex] = useState(0)
  const [history, setHistory] = useState<HistoryEntry<T>[]>([
    {
      timestamp: new Date(),
      data: initialData
    }
  ])

  // Track if we're in the middle of an undo/redo operation
  const isUndoingRef = useRef(false)

  // Add a new entry to history
  const addToHistory = useCallback((
    data: T,
    field?: keyof T,
    previousValue?: any,
    newValue?: any
  ) => {
    if (isUndoingRef.current) return

    setHistory(prev => {
      // Remove any entries after current index (when we've undone and then make a new change)
      const newHistory = prev.slice(0, currentIndex + 1)
      
      // Add new entry
      const entry: HistoryEntry<T> = {
        timestamp: new Date(),
        data: { ...data },
        field,
        previousValue,
        newValue
      }
      
      newHistory.push(entry)
      
      // Limit history size
      if (newHistory.length > maxHistorySize) {
        newHistory.shift()
      } else {
        setCurrentIndex(newHistory.length - 1)
      }
      
      return newHistory
    })
  }, [currentIndex, maxHistorySize])

  // Undo to previous state
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

  // Redo to next state
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

  // Get current data from history
  const getCurrentData = useCallback(() => {
    return history[currentIndex]?.data || initialData
  }, [history, currentIndex, initialData])

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory([{
      timestamp: new Date(),
      data: getCurrentData()
    }])
    setCurrentIndex(0)
  }, [getCurrentData])

  // Get history for a specific field
  const getFieldHistory = useCallback((field: keyof T) => {
    return history.filter(entry => entry.field === field)
  }, [history])

  // Check if we can undo/redo
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