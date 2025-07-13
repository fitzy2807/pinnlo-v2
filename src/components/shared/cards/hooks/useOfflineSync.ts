import { useState, useCallback, useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'

export type SyncStatus = 'online' | 'offline' | 'syncing' | 'error' | 'conflict'

export interface OfflineQueueItem<T> {
  id: string
  action: 'create' | 'update' | 'delete'
  data: T
  timestamp: Date
  retryCount: number
  metadata?: Record<string, any>
}

export interface ConflictResolution<T> {
  id: string
  localData: T
  serverData: T
  resolution: 'use_local' | 'use_server' | 'merge' | 'manual'
  mergedData?: T
}

export interface UseOfflineSyncOptions<T> {
  storageKey: string
  syncEndpoint: string
  maxRetries?: number
  retryDelay?: number
  batchSize?: number
  enableConflictDetection?: boolean
  onConflict?: (conflict: ConflictResolution<T>) => Promise<T>
  onSyncSuccess?: (synced: OfflineQueueItem<T>[]) => void
  onSyncError?: (error: Error, items: OfflineQueueItem<T>[]) => void
}

export function useOfflineSync<T extends Record<string, any>>(
  options: UseOfflineSyncOptions<T>
) {
  const {
    storageKey,
    syncEndpoint,
    maxRetries = 3,
    retryDelay = 1000,
    batchSize = 10,
    enableConflictDetection = true,
    onConflict,
    onSyncSuccess,
    onSyncError
  } = options

  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('online')
  const [queueSize, setQueueSize] = useState(0)
  const [conflicts, setConflicts] = useState<ConflictResolution<T>[]>([])
  
  const offlineQueueRef = useRef<OfflineQueueItem<T>[]>([])
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isInitializedRef = useRef(false)

  // Load offline queue from localStorage
  const loadOfflineQueue = useCallback(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const queue = JSON.parse(saved).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }))
        offlineQueueRef.current = queue
        setQueueSize(queue.length)
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error)
    }
  }, [storageKey])

  // Save offline queue to localStorage
  const saveOfflineQueue = useCallback(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(offlineQueueRef.current))
      setQueueSize(offlineQueueRef.current.length)
    } catch (error) {
      console.error('Failed to save offline queue:', error)
    }
  }, [storageKey])

  // Add item to offline queue
  const queueItem = useCallback((
    action: 'create' | 'update' | 'delete',
    data: T,
    metadata?: Record<string, any>
  ) => {
    const item: OfflineQueueItem<T> = {
      id: generateId(),
      action,
      data: { ...data },
      timestamp: new Date(),
      retryCount: 0,
      metadata
    }

    offlineQueueRef.current.push(item)
    saveOfflineQueue()

    // Trigger sync if online
    if (isOnline) {
      scheduledSync()
    }

    return item.id
  }, [isOnline, saveOfflineQueue])

  // Remove item from queue
  const removeFromQueue = useCallback((id: string) => {
    offlineQueueRef.current = offlineQueueRef.current.filter(item => item.id !== id)
    saveOfflineQueue()
  }, [saveOfflineQueue])

  // Clear entire queue
  const clearQueue = useCallback(() => {
    offlineQueueRef.current = []
    saveOfflineQueue()
    toast.info('Offline queue cleared')
  }, [saveOfflineQueue])

  // Generate unique ID
  function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Detect conflicts between local and server data
  const detectConflict = useCallback((
    localItem: OfflineQueueItem<T>,
    serverData: T
  ): ConflictResolution<T> | null => {
    if (!enableConflictDetection) return null

    // Simple conflict detection based on timestamps or version
    const localVersion = localItem.data.__version || 0
    const serverVersion = serverData.__version || 0
    
    if (serverVersion > localVersion) {
      return {
        id: generateId(),
        localData: localItem.data,
        serverData,
        resolution: 'use_server' // Default to server version
      }
    }

    return null
  }, [enableConflictDetection])

  // Sync a single item with the server
  const syncItem = useCallback(async (item: OfflineQueueItem<T>): Promise<boolean> => {
    try {
      const response = await fetch(`${syncEndpoint}/${item.action}`, {
        method: item.action === 'delete' ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: item.data,
          metadata: item.metadata,
          timestamp: item.timestamp.toISOString()
        })
      })

      if (!response.ok) {
        if (response.status === 409) {
          // Conflict detected
          const serverData = await response.json()
          const conflict = detectConflict(item, serverData)
          
          if (conflict && onConflict) {
            const resolvedData = await onConflict(conflict)
            item.data = resolvedData
            return await syncItem(item) // Retry with resolved data
          }
        }
        throw new Error(`Sync failed: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      
      // Update local data with server response if needed
      if (result.data) {
        Object.assign(item.data, result.data)
      }

      return true
    } catch (error) {
      console.error('Sync item error:', error)
      item.retryCount++
      
      if (item.retryCount >= maxRetries) {
        onSyncError?.(error as Error, [item])
        return false
      }
      
      // Exponential backoff for retry
      const delay = retryDelay * Math.pow(2, item.retryCount - 1)
      setTimeout(() => syncItem(item), delay)
      
      return false
    }
  }, [syncEndpoint, detectConflict, onConflict, maxRetries, retryDelay, onSyncError])

  // Sync all items in queue
  const syncQueue = useCallback(async () => {
    if (!isOnline || offlineQueueRef.current.length === 0) return

    setSyncStatus('syncing')
    
    const itemsToSync = offlineQueueRef.current.slice(0, batchSize)
    const syncPromises = itemsToSync.map(syncItem)
    
    try {
      const results = await Promise.allSettled(syncPromises)
      const synced: OfflineQueueItem<T>[] = []
      const failed: OfflineQueueItem<T>[] = []

      results.forEach((result, index) => {
        const item = itemsToSync[index]
        if (result.status === 'fulfilled' && result.value) {
          synced.push(item)
          removeFromQueue(item.id)
        } else {
          failed.push(item)
        }
      })

      if (synced.length > 0) {
        onSyncSuccess?.(synced)
        toast.success(`Synced ${synced.length} items`, {
          duration: 2000,
          icon: '🔄'
        })
      }

      if (failed.length > 0) {
        toast.error(`Failed to sync ${failed.length} items`, {
          duration: 3000
        })
      }

      // Continue syncing if there are more items
      if (offlineQueueRef.current.length > 0) {
        scheduledSync()
      } else {
        setSyncStatus(isOnline ? 'online' : 'offline')
      }

    } catch (error) {
      console.error('Sync queue error:', error)
      setSyncStatus('error')
      onSyncError?.(error as Error, itemsToSync)
    }
  }, [isOnline, batchSize, syncItem, removeFromQueue, onSyncSuccess, onSyncError])

  // Schedule sync with debouncing
  const scheduledSync = useCallback(() => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current)
    }
    
    syncTimeoutRef.current = setTimeout(() => {
      syncQueue()
    }, 500) // Debounce sync requests
  }, [syncQueue])

  // Force immediate sync
  const forceSync = useCallback(async () => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current)
    }
    await syncQueue()
  }, [syncQueue])

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setSyncStatus('online')
      
      if (offlineQueueRef.current.length > 0) {
        toast.info('Back online - syncing changes...')
        scheduledSync()
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      setSyncStatus('offline')
      toast.warning('You are offline - changes will sync when reconnected')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [scheduledSync])

  // Initialize on mount
  useEffect(() => {
    if (!isInitializedRef.current) {
      loadOfflineQueue()
      isInitializedRef.current = true
      
      // Start initial sync if online and has items
      if (isOnline && offlineQueueRef.current.length > 0) {
        scheduledSync()
      }
    }
  }, [loadOfflineQueue, isOnline, scheduledSync])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
    }
  }, [])

  // Get queue statistics
  const getQueueStats = useCallback(() => {
    const queue = offlineQueueRef.current
    const actionCounts = queue.reduce((acc, item) => {
      acc[item.action] = (acc[item.action] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      total: queue.length,
      actions: actionCounts,
      oldestItem: queue.length > 0 ? queue[0].timestamp : null,
      newestItem: queue.length > 0 ? queue[queue.length - 1].timestamp : null
    }
  }, [])

  // Resolve conflict manually
  const resolveConflict = useCallback((
    conflictId: string,
    resolution: 'use_local' | 'use_server' | 'merge',
    mergedData?: T
  ) => {
    const conflict = conflicts.find(c => c.id === conflictId)
    if (!conflict) return

    conflict.resolution = resolution
    if (mergedData) {
      conflict.mergedData = mergedData
    }

    setConflicts(prev => prev.filter(c => c.id !== conflictId))
    
    // Re-queue the resolved item
    const resolvedData = resolution === 'use_local' 
      ? conflict.localData 
      : resolution === 'use_server' 
        ? conflict.serverData 
        : mergedData || conflict.localData

    queueItem('update', resolvedData, { conflict: true })
  }, [conflicts, queueItem])

  return {
    // Status
    isOnline,
    syncStatus,
    queueSize,
    conflicts,
    
    // Queue management
    queueItem,
    removeFromQueue,
    clearQueue,
    
    // Sync operations
    forceSync,
    scheduledSync,
    
    // Conflict resolution
    resolveConflict,
    
    // Utilities
    getQueueStats,
    
    // Queue access (read-only)
    getQueue: () => [...offlineQueueRef.current]
  }
}