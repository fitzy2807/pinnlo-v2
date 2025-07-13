import { useState, useCallback, useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'

export interface CollaborationUser {
  id: string
  name: string
  avatar?: string
  color: string
  lastActive: Date
  cursor?: {
    x: number
    y: number
    field?: string
  }
}

export interface CollaborationEvent<T> {
  id: string
  type: 'field_change' | 'cursor_move' | 'user_join' | 'user_leave' | 'lock_field' | 'unlock_field'
  userId: string
  timestamp: Date
  data?: {
    field?: keyof T
    value?: any
    previousValue?: any
    cursor?: { x: number; y: number; field?: string }
  }
}

export interface FieldLock<T> {
  field: keyof T
  userId: string
  timestamp: Date
  timeout?: NodeJS.Timeout
}

export interface UseRealTimeCollaborationOptions<T> {
  documentId: string
  userId: string
  userName: string
  websocketUrl?: string
  conflictResolution?: 'last_write_wins' | 'operational_transform' | 'manual'
  lockTimeout?: number
  cursorBroadcastDelay?: number
  onUserJoin?: (user: CollaborationUser) => void
  onUserLeave?: (userId: string) => void
  onFieldChange?: (event: CollaborationEvent<T>) => void
  onConflict?: (localValue: any, remoteValue: any, field: keyof T) => any
}

export function useRealTimeCollaboration<T extends Record<string, any>>(
  options: UseRealTimeCollaborationOptions<T>
) {
  const {
    documentId,
    userId,
    userName,
    websocketUrl = 'ws://localhost:3001',
    conflictResolution = 'last_write_wins',
    lockTimeout = 30000, // 30 seconds
    cursorBroadcastDelay = 100,
    onUserJoin,
    onUserLeave,
    onFieldChange,
    onConflict
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const [activeUsers, setActiveUsers] = useState<Map<string, CollaborationUser>>(new Map())
  const [fieldLocks, setFieldLocks] = useState<Map<keyof T, FieldLock<T>>>(new Map())
  const [events, setEvents] = useState<CollaborationEvent<T>[]>([])
  
  const wsRef = useRef<WebSocket | null>(null)
  const cursorTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const eventQueueRef = useRef<CollaborationEvent<T>[]>([])
  const lastCursorRef = useRef<{ x: number; y: number; field?: string } | null>(null)

  // Generate user colors
  const getUserColor = useCallback((userId: string): string => {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
      '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
    ]
    const hash = userId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    return colors[Math.abs(hash) % colors.length]
  }, [])

  // Initialize WebSocket connection
  const initializeWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    try {
      const ws = new WebSocket(`${websocketUrl}/collaboration/${documentId}`)
      wsRef.current = ws

      ws.onopen = () => {
        setIsConnected(true)
        toast.success('Connected to collaboration server')
        
        // Send join event
        const joinEvent: CollaborationEvent<T> = {
          id: generateId(),
          type: 'user_join',
          userId,
          timestamp: new Date(),
          data: {}
        }
        
        ws.send(JSON.stringify({
          type: 'user_join',
          userId,
          userName,
          documentId
        }))
      }

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          handleWebSocketMessage(message)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      ws.onclose = () => {
        setIsConnected(false)
        toast.error('Disconnected from collaboration server')
        
        // Attempt reconnect after delay
        setTimeout(initializeWebSocket, 3000)
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        toast.error('Collaboration connection error')
      }

    } catch (error) {
      console.error('Failed to initialize WebSocket:', error)
    }
  }, [websocketUrl, documentId, userId, userName])

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = useCallback((message: any) => {
    switch (message.type) {
      case 'user_join':
        if (message.userId !== userId) {
          const user: CollaborationUser = {
            id: message.userId,
            name: message.userName,
            color: getUserColor(message.userId),
            lastActive: new Date()
          }
          
          setActiveUsers(prev => new Map(prev).set(message.userId, user))
          onUserJoin?.(user)
          
          toast.success(`${message.userName} joined the session`, {
            duration: 2000,
            icon: '👋'
          })
        }
        break

      case 'user_leave':
        if (message.userId !== userId) {
          setActiveUsers(prev => {
            const newUsers = new Map(prev)
            newUsers.delete(message.userId)
            return newUsers
          })
          
          // Remove locks held by leaving user
          setFieldLocks(prev => {
            const newLocks = new Map(prev)
            for (const [field, lock] of newLocks) {
              if (lock.userId === message.userId) {
                newLocks.delete(field)
              }
            }
            return newLocks
          })
          
          onUserLeave?.(message.userId)
          toast.info(`${message.userName} left the session`)
        }
        break

      case 'field_change':
        handleRemoteFieldChange(message)
        break

      case 'cursor_move':
        handleRemoteCursorMove(message)
        break

      case 'field_lock':
        handleRemoteFieldLock(message)
        break

      case 'field_unlock':
        handleRemoteFieldUnlock(message)
        break

      case 'users_list':
        const users = new Map<string, CollaborationUser>()
        message.users.forEach((user: any) => {
          if (user.id !== userId) {
            users.set(user.id, {
              ...user,
              color: getUserColor(user.id),
              lastActive: new Date(user.lastActive)
            })
          }
        })
        setActiveUsers(users)
        break
    }
  }, [userId, getUserColor, onUserJoin, onUserLeave])

  // Handle remote field changes
  const handleRemoteFieldChange = useCallback((message: any) => {
    const event: CollaborationEvent<T> = {
      id: message.eventId,
      type: 'field_change',
      userId: message.userId,
      timestamp: new Date(message.timestamp),
      data: {
        field: message.field,
        value: message.value,
        previousValue: message.previousValue
      }
    }

    setEvents(prev => [...prev, event].slice(-100)) // Keep last 100 events
    onFieldChange?.(event)
  }, [onFieldChange])

  // Handle remote cursor moves
  const handleRemoteCursorMove = useCallback((message: any) => {
    setActiveUsers(prev => {
      const user = prev.get(message.userId)
      if (user) {
        const updatedUser = {
          ...user,
          cursor: message.cursor,
          lastActive: new Date()
        }
        return new Map(prev).set(message.userId, updatedUser)
      }
      return prev
    })
  }, [])

  // Handle remote field locks
  const handleRemoteFieldLock = useCallback((message: any) => {
    const lock: FieldLock<T> = {
      field: message.field,
      userId: message.userId,
      timestamp: new Date(message.timestamp)
    }

    setFieldLocks(prev => new Map(prev).set(message.field, lock))
  }, [])

  // Handle remote field unlocks
  const handleRemoteFieldUnlock = useCallback((message: any) => {
    setFieldLocks(prev => {
      const newLocks = new Map(prev)
      newLocks.delete(message.field)
      return newLocks
    })
  }, [])

  // Send WebSocket message
  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    } else {
      // Queue message for when connection is restored
      eventQueueRef.current.push(message)
    }
  }, [])

  // Broadcast field change
  const broadcastFieldChange = useCallback((
    field: keyof T,
    value: any,
    previousValue: any
  ) => {
    const event: CollaborationEvent<T> = {
      id: generateId(),
      type: 'field_change',
      userId,
      timestamp: new Date(),
      data: { field, value, previousValue }
    }

    sendMessage({
      type: 'field_change',
      eventId: event.id,
      userId,
      field,
      value,
      previousValue,
      timestamp: event.timestamp.toISOString()
    })

    setEvents(prev => [...prev, event].slice(-100))
  }, [userId, sendMessage])

  // Broadcast cursor movement with debouncing
  const broadcastCursorMove = useCallback((
    x: number,
    y: number,
    field?: string
  ) => {
    lastCursorRef.current = { x, y, field }
    
    if (cursorTimeoutRef.current) {
      clearTimeout(cursorTimeoutRef.current)
    }

    cursorTimeoutRef.current = setTimeout(() => {
      const cursor = lastCursorRef.current
      if (cursor) {
        sendMessage({
          type: 'cursor_move',
          userId,
          cursor
        })
      }
    }, cursorBroadcastDelay)
  }, [userId, sendMessage, cursorBroadcastDelay])

  // Lock a field for editing
  const lockField = useCallback((field: keyof T) => {
    const existingLock = fieldLocks.get(field)
    
    // Check if field is already locked by another user
    if (existingLock && existingLock.userId !== userId) {
      const user = activeUsers.get(existingLock.userId)
      toast.warning(`Field is being edited by ${user?.name || 'another user'}`)
      return false
    }

    const lock: FieldLock<T> = {
      field,
      userId,
      timestamp: new Date()
    }

    // Set auto-unlock timeout
    lock.timeout = setTimeout(() => {
      unlockField(field)
    }, lockTimeout)

    setFieldLocks(prev => new Map(prev).set(field, lock))

    sendMessage({
      type: 'field_lock',
      userId,
      field,
      timestamp: lock.timestamp.toISOString()
    })

    return true
  }, [fieldLocks, userId, activeUsers, lockTimeout, sendMessage])

  // Unlock a field
  const unlockField = useCallback((field: keyof T) => {
    const lock = fieldLocks.get(field)
    
    if (lock?.userId === userId) {
      if (lock.timeout) {
        clearTimeout(lock.timeout)
      }
      
      setFieldLocks(prev => {
        const newLocks = new Map(prev)
        newLocks.delete(field)
        return newLocks
      })

      sendMessage({
        type: 'field_unlock',
        userId,
        field
      })
    }
  }, [fieldLocks, userId, sendMessage])

  // Check if field is locked by another user
  const isFieldLocked = useCallback((field: keyof T): boolean => {
    const lock = fieldLocks.get(field)
    return !!(lock && lock.userId !== userId)
  }, [fieldLocks, userId])

  // Get lock holder information
  const getFieldLockHolder = useCallback((field: keyof T): CollaborationUser | null => {
    const lock = fieldLocks.get(field)
    return lock ? activeUsers.get(lock.userId) || null : null
  }, [fieldLocks, activeUsers])

  // Get collaboration statistics
  const getCollaborationStats = useCallback(() => {
    return {
      activeUsers: activeUsers.size,
      lockedFields: fieldLocks.size,
      recentEvents: events.length,
      connectionStatus: isConnected ? 'connected' : 'disconnected'
    }
  }, [activeUsers, fieldLocks, events, isConnected])

  // Generate unique ID
  function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Initialize connection on mount
  useEffect(() => {
    initializeWebSocket()

    return () => {
      // Cleanup on unmount
      if (wsRef.current) {
        wsRef.current.close()
      }
      
      if (cursorTimeoutRef.current) {
        clearTimeout(cursorTimeoutRef.current)
      }

      // Clear all field locks
      fieldLocks.forEach(lock => {
        if (lock.timeout) {
          clearTimeout(lock.timeout)
        }
      })
    }
  }, [initializeWebSocket])

  // Send queued events when connection is restored
  useEffect(() => {
    if (isConnected && eventQueueRef.current.length > 0) {
      eventQueueRef.current.forEach(event => {
        sendMessage(event)
      })
      eventQueueRef.current = []
    }
  }, [isConnected, sendMessage])

  return {
    // Connection status
    isConnected,
    
    // Users and collaboration state
    activeUsers: Array.from(activeUsers.values()),
    fieldLocks: Array.from(fieldLocks.values()),
    events: events.slice(-20), // Recent events
    
    // Field operations
    broadcastFieldChange,
    lockField,
    unlockField,
    isFieldLocked,
    getFieldLockHolder,
    
    // Cursor operations
    broadcastCursorMove,
    
    // Utilities
    getCollaborationStats,
    
    // Connection management
    reconnect: initializeWebSocket
  }
}