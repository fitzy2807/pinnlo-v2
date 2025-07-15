import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { toast } from 'react-hot-toast'
import { debounce } from '../utils/debounce'

interface AutoSaveOptions {
  debounceMs?: number
  onSuccess?: () => void
  onError?: (error: Error) => void
  enableConflictDetection?: boolean
  enableOfflineQueue?: boolean
  fieldDebounceMap?: Record<string, number>
}

interface SaveResult {
  success: boolean
  version?: number
  error?: Error
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'dirty' | 'offline'

export function useAutoSave<T extends Record<string, any>>(
  initialData: T & { __version?: number },
  onSave: (data: Partial<T>) => Promise<SaveResult | void>,
  options: AutoSaveOptions = {}
) {
  const {
    debounceMs = 1000,
    onSuccess,
    onError,
    enableConflictDetection = true,
    enableOfflineQueue = true,
    fieldDebounceMap = {}
  } = options

  const [data, setData] = useState<T>(initialData)
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [saveError, setSaveError] = useState<Error | null>(null)
  const [dirtyFields, setDirtyFields] = useState<Set<keyof T>>(new Set())
  const [version, setVersion] = useState(initialData.__version || 0)
  const [offlineQueue, setOfflineQueue] = useState<Array<Partial<T>>>([])
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  
  // Update data when initialData changes (e.g., when modal opens with new card)
  // Use ID to detect when we're dealing with a different card
  const initialDataId = (initialData as any).id
  useEffect(() => {
    setData(initialData)
    setIsDirty(false)
    setDirtyFields(new Set())
    setVersion(initialData.__version || 0)
  }, [initialDataId]) // Only reset when ID changes, not on every render
  
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const retryCountRef = useRef(0)
  const pendingUpdatesRef = useRef<Partial<T>>({})
  const performSaveRef = useRef<(updates: Partial<T>) => Promise<boolean>>()
  const currentSaveRequestRef = useRef<AbortController | null>(null)
  const isMountedRef = useRef(true)

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      processOfflineQueue()
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Process offline queue when coming back online
  const processOfflineQueue = useCallback(async () => {
    if (offlineQueue.length === 0) return

    toast.info('Syncing offline changes...')
    
    const successfulSyncs = []
    for (const update of offlineQueue) {
      try {
        if (performSaveRef.current) {
          await performSaveRef.current(update)
          successfulSyncs.push(update)
        }
      } catch (error) {
        console.error('Failed to sync offline change:', error)
      }
    }

    // Only clear successfully synced items
    setOfflineQueue(prev => 
      prev.filter(item => !successfulSyncs.includes(item))
    )
    
    if (successfulSyncs.length > 0) {
      toast.success('Offline changes synced')
    }
  }, [offlineQueue])

  // Perform the actual save
  const performSave = useCallback(async (updates: Partial<T>) => {
    // Add version for conflict detection
    const dataToSave = enableConflictDetection
      ? { ...updates, __version: version }
      : updates

    const result = await onSave(dataToSave)

    if (result && 'success' in result) {
      if (result.success) {
        // Update version if provided - this prevents race conditions
        if (result.version && isMountedRef.current) {
          setVersion(result.version)
        }
        return true
      } else if (result.error?.message?.includes('VERSION_CONFLICT')) {
        throw new Error('VERSION_CONFLICT')
      } else {
        throw result.error || new Error('Save failed')
      }
    }

    return true
  }, [onSave, version, enableConflictDetection])

  // Keep performSave ref updated
  useEffect(() => {
    performSaveRef.current = performSave
  }, [performSave])

  // Main save function with retry logic and race condition prevention
  const saveChanges = useCallback(async () => {
    // Check if component is still mounted
    if (!isMountedRef.current) return
    
    if (!isDirty || dirtyFields.size === 0) return
    
    if (!isOnline && enableOfflineQueue) {
      // Queue for later
      const updates = { ...pendingUpdatesRef.current }
      setOfflineQueue(prev => [...prev, updates])
      pendingUpdatesRef.current = {}
      setDirtyFields(new Set())
      setIsDirty(false)
      toast.info('Offline - changes will sync when connected')
      return
    }

    // Cancel any ongoing save request
    if (currentSaveRequestRef.current) {
      currentSaveRequestRef.current.abort()
    }

    // Create new abort controller for this request
    const abortController = new AbortController()
    currentSaveRequestRef.current = abortController

    if (!isMountedRef.current) return
    
    setIsSaving(true)
    setSaveError(null)

    try {
      // Get all pending updates
      const updates = { ...pendingUpdatesRef.current }
      
      // Check if request was aborted before calling save
      if (abortController.signal.aborted || !isMountedRef.current) {
        return
      }
      
      const result = await performSaveRef.current!(updates)
      
      // Check if request was aborted or component unmounted after save
      if (abortController.signal.aborted || !isMountedRef.current) {
        return
      }
      
      // Success - only update state if still mounted and this is the current request
      if (currentSaveRequestRef.current === abortController && isMountedRef.current) {
        pendingUpdatesRef.current = {}
        retryCountRef.current = 0
        currentSaveRequestRef.current = null
        
        // Update all state synchronously to avoid race conditions
        setDirtyFields(new Set())
        setIsDirty(false)
        setLastSaved(new Date())
        setSaveError(null)
        
        onSuccess?.()
        
        // Subtle success indication
        if (document.hasFocus()) {
          toast.success('Changes saved', {
            duration: 2000,
            position: 'bottom-right',
            style: { fontSize: '12px' }
          })
        }
      }
    } catch (error) {
      // Check if this was just an abort or component unmount
      if (abortController.signal.aborted || !isMountedRef.current) {
        return
      }
      
      const err = error as Error
      
      // Only handle error if this is still the current request
      if (currentSaveRequestRef.current === abortController && isMountedRef.current) {
        setSaveError(err)

        if (err.message === 'VERSION_CONFLICT') {
          toast.error('Changes conflict with another user. Refreshing...')
          setTimeout(() => window.location.reload(), 2000)
        } else if (retryCountRef.current < 3) {
          // Exponential backoff retry
          retryCountRef.current++
          const retryDelay = Math.pow(2, retryCountRef.current) * 1000
          toast.error(`Save failed. Retrying in ${retryDelay / 1000}s...`)
          
          // Clear the current request ref before scheduling retry
          currentSaveRequestRef.current = null
          
          setTimeout(() => {
            if (isMountedRef.current) {
              saveChanges()
            }
          }, retryDelay)
        } else {
          toast.error('Failed to save changes. Please refresh.')
          onError?.(err)
          currentSaveRequestRef.current = null
        }
      }
    } finally {
      // Only update state if this is still the current request and component is mounted
      if (currentSaveRequestRef.current === abortController && isMountedRef.current) {
        setIsSaving(false)
      }
    }
  }, [isDirty, dirtyFields, isOnline, enableOfflineQueue, onSuccess, onError])

  // Get debounce delay for a specific field
  const getFieldDebounce = useCallback((field: keyof T) => {
    return fieldDebounceMap[field as string] || debounceMs
  }, [fieldDebounceMap, debounceMs])

  // Debounced save with field-specific delays
  const scheduleSave = useCallback((delay: number) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveChanges()
    }, delay)
  }, [saveChanges])

  // Update single field
  const updateField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setData(prev => ({ ...prev, [field]: value }))
    setDirtyFields(prev => new Set(prev).add(field))
    setIsDirty(true)
    setSaveError(null)
    
    // Track the update
    pendingUpdatesRef.current[field] = value
    
    // Schedule save with field-specific debounce
    const delay = getFieldDebounce(field)
    scheduleSave(delay)
  }, [getFieldDebounce, scheduleSave])

  // Batch update multiple fields
  const updateFields = useCallback((updates: Partial<T>) => {
    setData(prev => ({ ...prev, ...updates }))
    Object.keys(updates).forEach(field => {
      setDirtyFields(prev => new Set(prev).add(field as keyof T))
      pendingUpdatesRef.current[field as keyof T] = updates[field as keyof T]
    })
    setIsDirty(true)
    setSaveError(null)
    
    // Use shortest debounce time from all fields
    const delays = Object.keys(updates).map(field => getFieldDebounce(field as keyof T))
    const shortestDelay = Math.min(...delays, debounceMs)
    scheduleSave(shortestDelay)
  }, [getFieldDebounce, debounceMs, scheduleSave])

  // Force save (bypasses debounce)
  const forceSave = useCallback(async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    await saveChanges()
  }, [saveChanges])

  // Reset to initial data
  const reset = useCallback(() => {
    setData(initialData)
    setDirtyFields(new Set())
    setIsDirty(false)
    setSaveError(null)
    pendingUpdatesRef.current = {}
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
  }, [initialData])

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true
    
    return () => {
      isMountedRef.current = false
      
      // Cancel any pending timeouts
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = null
      }
      
      // Cancel any ongoing save requests
      if (currentSaveRequestRef.current) {
        currentSaveRequestRef.current.abort()
        currentSaveRequestRef.current = null
      }
    }
  }, [])

  // Determine save status
  const saveStatus: SaveStatus = useMemo(() => {
    if (!isOnline && offlineQueue.length > 0) return 'offline'
    if (isSaving) return 'saving'
    if (saveError) return 'error'
    if (isDirty) return 'dirty'
    if (lastSaved) return 'saved'
    return 'idle'
  }, [isOnline, offlineQueue.length, isSaving, saveError, isDirty, lastSaved])

  return {
    data,
    updateField,
    updateFields,
    forceSave,
    reset,
    isSaving,
    isDirty,
    lastSaved,
    saveError,
    saveStatus,
    dirtyFields,
    offlineQueueSize: offlineQueue.length,
    isOnline,
    version
  }
}