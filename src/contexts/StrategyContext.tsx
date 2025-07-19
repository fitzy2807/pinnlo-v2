'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Strategy, CreateStrategyData, UpdateStrategyData, StrategyContextType } from '@/types/strategy'
import StrategyService from '@/services/strategyService'

const StrategyContext = createContext<StrategyContextType | undefined>(undefined)

interface StrategyProviderProps {
  children: ReactNode
}

export function StrategyProvider({ children }: StrategyProviderProps) {
  const [currentStrategy, setCurrentStrategy] = useState<Strategy | null>(null)
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load strategies and current strategy from localStorage on mount
  useEffect(() => {
    loadStrategies()
    loadCurrentStrategy()
  }, [])

  // Save current strategy to localStorage when it changes
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    if (currentStrategy) {
      localStorage.setItem('currentStrategy', JSON.stringify(currentStrategy))
    } else {
      localStorage.removeItem('currentStrategy')
    }
  }, [currentStrategy])

  const loadStrategies = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const fetchedStrategies = await StrategyService.getStrategies()
      setStrategies(fetchedStrategies)
    } catch (err) {
      setError('Failed to load strategies')
      console.error('Error loading strategies:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadCurrentStrategy = () => {
    if (typeof window === 'undefined') return
    
    try {
      const stored = localStorage.getItem('currentStrategy')
      if (stored) {
        const strategy = JSON.parse(stored)
        setCurrentStrategy(strategy)
      }
    } catch (err) {
      console.error('Error parsing stored strategy:', err)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('currentStrategy')
      }
    }
  }

  const createStrategy = async (data: CreateStrategyData): Promise<Strategy> => {
    try {
      setIsLoading(true)
      setError(null)

      const newStrategy = await StrategyService.createStrategy(data)
      setStrategies(prev => [...prev, newStrategy])
      setCurrentStrategy(newStrategy)
      
      return newStrategy
    } catch (err) {
      setError('Failed to create strategy')
      console.error('Error creating strategy:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const updateStrategy = async (id: string, data: UpdateStrategyData): Promise<Strategy> => {
    try {
      setIsLoading(true)
      setError(null)

      const updated = await StrategyService.updateStrategy(id, data)
      setStrategies(prev => prev.map(s => s.id === id ? updated : s))
      
      if (currentStrategy?.id === id) {
        setCurrentStrategy(updated)
      }

      return updated
    } catch (err) {
      setError('Failed to update strategy')
      console.error('Error updating strategy:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const deleteStrategy = async (id: string): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)

      await StrategyService.deleteStrategy(id)
      setStrategies(prev => prev.filter(s => s.id !== id))
      
      if (currentStrategy?.id === id) {
        setCurrentStrategy(null)
      }
    } catch (err) {
      setError('Failed to delete strategy')
      console.error('Error deleting strategy:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const value: StrategyContextType = {
    currentStrategy,
    strategies,
    setCurrentStrategy,
    createStrategy,
    updateStrategy,
    deleteStrategy,
    isLoading,
    error,
    hasStrategies: strategies.length > 0
  }

  return (
    <StrategyContext.Provider value={value}>
      {children}
    </StrategyContext.Provider>
  )
}

export function useStrategy(): StrategyContextType {
  const context = useContext(StrategyContext)
  if (context === undefined) {
    throw new Error('useStrategy must be used within a StrategyProvider')
  }
  return context
}

// Helper hook to check if user needs to select a strategy
export function useRequiresStrategy(): boolean {
  const { currentStrategy, hasStrategies } = useStrategy()
  return hasStrategies && !currentStrategy
}