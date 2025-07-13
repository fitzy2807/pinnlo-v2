/**
 * Load Testing for Enhanced MasterCard Components
 * Phase A.4.1: Create load testing for many cards
 */

import { act, render, fireEvent } from '@testing-library/react'
import React from 'react'
import { useAutoSave } from '../hooks/useAutoSave'
import { useValidation, validators } from '../hooks/useValidation'
import { CollapsibleSection } from '../components/CollapsibleSection'

// Mock toast notifications
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
  }
}))

// Performance monitoring utility
class PerformanceMonitor {
  private startTime: number = 0
  private metrics: Array<{ operation: string; duration: number; timestamp: number }> = []

  start() {
    this.startTime = performance.now()
  }

  end(operation: string) {
    const duration = performance.now() - this.startTime
    this.metrics.push({
      operation,
      duration,
      timestamp: Date.now()
    })
    return duration
  }

  getAverageTime(operation: string): number {
    const operationMetrics = this.metrics.filter(m => m.operation === operation)
    if (operationMetrics.length === 0) return 0
    return operationMetrics.reduce((sum, m) => sum + m.duration, 0) / operationMetrics.length
  }

  getMaxTime(operation: string): number {
    const operationMetrics = this.metrics.filter(m => m.operation === operation)
    return operationMetrics.length > 0 ? Math.max(...operationMetrics.map(m => m.duration)) : 0
  }

  getTotalTime(operation: string): number {
    return this.metrics.filter(m => m.operation === operation)
      .reduce((sum, m) => sum + m.duration, 0)
  }

  clear() {
    this.metrics = []
  }

  getReport() {
    const operations = [...new Set(this.metrics.map(m => m.operation))]
    return operations.map(op => ({
      operation: op,
      count: this.metrics.filter(m => m.operation === op).length,
      avgTime: this.getAverageTime(op),
      maxTime: this.getMaxTime(op),
      totalTime: this.getTotalTime(op)
    }))
  }
}

// Mock card component that uses all major hooks
const TestCardComponent: React.FC<{
  cardId: string
  initialData?: any
  onUpdate?: (data: any) => Promise<void>
  validationRules?: any[]
}> = ({ 
  cardId, 
  initialData = { title: '', description: '', field1: '', field2: '' },
  onUpdate,
  validationRules = []
}) => {
  const perfMonitor = React.useRef(new PerformanceMonitor())
  
  // Auto-save hook
  const { data, updateField, saveStatus } = useAutoSave(
    initialData,
    onUpdate || (() => Promise.resolve()),
    { debounceMs: 100 }
  )
  
  // Validation hook
  const { errors, validateField, getFieldError } = useValidation(data, {
    rules: validationRules
  })
  
  return React.createElement('div', {
    'data-testid': `card-${cardId}`,
    className: 'test-card'
  },
    React.createElement(CollapsibleSection, {
      title: `Card ${cardId}`,
      colorScheme: 'blue' as const,
      defaultExpanded: true
    },
      React.createElement('input', {
        'data-testid': `title-${cardId}`,
        value: data.title,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          perfMonitor.current.start()
          updateField('title', e.target.value)
          perfMonitor.current.end('updateField')
        }
      }),
      React.createElement('input', {
        'data-testid': `description-${cardId}`, 
        value: data.description,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
          perfMonitor.current.start()
          updateField('description', e.target.value)
          perfMonitor.current.end('updateField')
        }
      }),
      React.createElement('div', {
        'data-testid': `save-status-${cardId}`
      }, saveStatus),
      React.createElement('div', {
        'data-testid': `error-${cardId}`
      }, getFieldError('title') || '')
    )
  )
}

// Multi-card container component
const TestMultiCardContainer: React.FC<{
  cardCount: number
  onUpdate?: (cardId: string, data: any) => Promise<void>
}> = ({ cardCount, onUpdate }) => {
  const cards = Array.from({ length: cardCount }, (_, i) => i.toString())
  
  return React.createElement('div', {
    'data-testid': 'multi-card-container'
  },
    ...cards.map(cardId => 
      React.createElement(TestCardComponent, {
        key: cardId,
        cardId,
        onUpdate: onUpdate ? (data) => onUpdate(cardId, data) : undefined,
        validationRules: [
          {
            field: 'title',
            validate: validators.required('Title is required')
          }
        ]
      })
    )
  )
}

describe('Load Testing - Many Cards Performance', () => {
  let perfMonitor: PerformanceMonitor

  beforeEach(() => {
    perfMonitor = new PerformanceMonitor()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
    perfMonitor.clear()
  })

  describe('Rendering Performance', () => {
    it('should render 10 cards within acceptable time', () => {
      perfMonitor.start()
      
      const { getByTestId } = render(
        React.createElement(TestMultiCardContainer, { cardCount: 10 })
      )
      
      const renderTime = perfMonitor.end('render_10_cards')
      
      // All cards should be present
      expect(getByTestId('multi-card-container')).toBeInTheDocument()
      for (let i = 0; i < 10; i++) {
        expect(getByTestId(`card-${i}`)).toBeInTheDocument()
      }
      
      // Performance expectation: rendering 10 cards should take < 100ms
      expect(renderTime).toBeLessThan(100)
    })

    it('should render 50 cards within acceptable time', () => {
      perfMonitor.start()
      
      const { getByTestId } = render(
        React.createElement(TestMultiCardContainer, { cardCount: 50 })
      )
      
      const renderTime = perfMonitor.end('render_50_cards')
      
      // Spot check cards are present
      expect(getByTestId('card-0')).toBeInTheDocument()
      expect(getByTestId('card-25')).toBeInTheDocument()
      expect(getByTestId('card-49')).toBeInTheDocument()
      
      // Performance expectation: rendering 50 cards should take < 500ms
      expect(renderTime).toBeLessThan(500)
    })

    it('should handle 100 cards without crashing', () => {
      // This test focuses on stability rather than speed
      const { getByTestId } = render(
        React.createElement(TestMultiCardContainer, { cardCount: 100 })
      )
      
      // Should not crash and key cards should exist
      expect(getByTestId('card-0')).toBeInTheDocument()
      expect(getByTestId('card-50')).toBeInTheDocument()
      expect(getByTestId('card-99')).toBeInTheDocument()
    })
  })

  describe('Update Performance', () => {
    it('should handle rapid updates across multiple cards efficiently', async () => {
      const updateTimes: number[] = []
      const mockUpdate = jest.fn().mockResolvedValue(undefined)
      
      const { getByTestId } = render(
        React.createElement(TestMultiCardContainer, { 
          cardCount: 10, 
          onUpdate: mockUpdate 
        })
      )
      
      // Simulate rapid updates across multiple cards
      for (let cardIndex = 0; cardIndex < 5; cardIndex++) {
        perfMonitor.start()
        
        const titleInput = getByTestId(`title-${cardIndex}`)
        
        await act(async () => {
          fireEvent.change(titleInput, { 
            target: { value: `Updated title ${cardIndex}` } 
          })
        })
        
        updateTimes.push(perfMonitor.end('rapid_update'))
      }
      
      // Average update time should be reasonable
      const avgUpdateTime = updateTimes.reduce((sum, time) => sum + time, 0) / updateTimes.length
      expect(avgUpdateTime).toBeLessThan(50) // Each update should be < 50ms
      
      // No update should take excessively long
      expect(Math.max(...updateTimes)).toBeLessThan(100)
    })

    it('should handle concurrent updates without performance degradation', async () => {
      const updatePromises: Promise<void>[] = []
      const mockUpdate = jest.fn().mockResolvedValue(undefined)
      
      const { getByTestId } = render(
        React.createElement(TestMultiCardContainer, { 
          cardCount: 10, 
          onUpdate: mockUpdate 
        })
      )
      
      perfMonitor.start()
      
      // Trigger updates on all cards simultaneously
      for (let cardIndex = 0; cardIndex < 10; cardIndex++) {
        const titleInput = getByTestId(`title-${cardIndex}`)
        
        const updatePromise = act(async () => {
          fireEvent.change(titleInput, { 
            target: { value: `Concurrent update ${cardIndex}` } 
          })
        })
        
        updatePromises.push(updatePromise)
      }
      
      // Wait for all updates to complete
      await Promise.all(updatePromises)
      
      const totalConcurrentTime = perfMonitor.end('concurrent_updates')
      
      // Concurrent updates should not take significantly longer than sequential
      expect(totalConcurrentTime).toBeLessThan(200)
    })
  })

  describe('Auto-save Performance Under Load', () => {
    it('should efficiently batch auto-saves across multiple cards', async () => {
      const saveCallTimes: number[] = []
      const mockUpdate = jest.fn().mockImplementation(async () => {
        const start = performance.now()
        await new Promise(resolve => setTimeout(resolve, 10)) // Simulate API call
        saveCallTimes.push(performance.now() - start)
        return undefined
      })
      
      const { getByTestId } = render(
        React.createElement(TestMultiCardContainer, { 
          cardCount: 5, 
          onUpdate: mockUpdate 
        })
      )
      
      // Trigger updates on multiple cards
      await act(async () => {
        for (let i = 0; i < 5; i++) {
          const titleInput = getByTestId(`title-${i}`)
          fireEvent.change(titleInput, { target: { value: `Auto-save test ${i}` } })
        }
        
        // Advance timers to trigger debounced saves
        jest.advanceTimersByTime(150)
        await new Promise(resolve => setTimeout(resolve, 50))
      })
      
      // Each individual save should be efficient
      saveCallTimes.forEach(time => {
        expect(time).toBeLessThan(50) // Individual save < 50ms
      })
      
      // Should have been called for each card
      expect(mockUpdate).toHaveBeenCalledTimes(5)
    })

    it('should handle save queue backlog efficiently', async () => {
      const mockUpdate = jest.fn()
        .mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)))
        .mockImplementation(() => Promise.resolve())
      
      const { getByTestId } = render(
        React.createElement(TestMultiCardContainer, { 
          cardCount: 3, 
          onUpdate: mockUpdate 
        })
      )
      
      perfMonitor.start()
      
      // Create a save backlog by triggering rapid updates
      await act(async () => {
        for (let i = 0; i < 3; i++) {
          const titleInput = getByTestId(`title-${i}`)
          fireEvent.change(titleInput, { target: { value: `Backlog test ${i}` } })
        }
        
        jest.advanceTimersByTime(150)
        await new Promise(resolve => setTimeout(resolve, 150))
      })
      
      const backlogHandlingTime = perfMonitor.end('save_backlog')
      
      // Should handle backlog without excessive delay
      expect(backlogHandlingTime).toBeLessThan(200)
      expect(mockUpdate).toHaveBeenCalledTimes(3)
    })
  })

  describe('Memory Performance Under Load', () => {
    it('should not leak memory with many card operations', () => {
      const initialHeapSize = (performance as any).memory?.usedJSHeapSize || 0
      
      // Render cards and perform operations
      const { unmount } = render(
        React.createElement(TestMultiCardContainer, { cardCount: 20 })
      )
      
      // Simulate user interactions
      for (let i = 0; i < 20; i++) {
        const { unmount: tempUnmount } = render(
          React.createElement(TestCardComponent, { cardId: `temp-${i}` })
        )
        tempUnmount()
      }
      
      // Cleanup main component
      unmount()
      
      // Force garbage collection if available
      if ((global as any).gc) {
        (global as any).gc()
      }
      
      const finalHeapSize = (performance as any).memory?.usedJSHeapSize || 0
      const heapIncrease = finalHeapSize - initialHeapSize
      
      // Memory increase should be reasonable (< 5MB for this test)
      if ((performance as any).memory) {
        expect(heapIncrease).toBeLessThan(5 * 1024 * 1024)
      }
    })

    it('should efficiently handle card expansion/collapse cycles', async () => {
      const { getByTestId } = render(
        React.createElement(TestMultiCardContainer, { cardCount: 10 })
      )
      
      perfMonitor.start()
      
      // Simulate rapid expand/collapse operations
      for (let cycle = 0; cycle < 5; cycle++) {
        for (let cardIndex = 0; cardIndex < 10; cardIndex++) {
          const card = getByTestId(`card-${cardIndex}`)
          const button = card.querySelector('button')
          
          if (button) {
            await act(async () => {
              fireEvent.click(button) // Expand
            })
            
            await act(async () => {
              fireEvent.click(button) // Collapse
            })
          }
        }
      }
      
      const cycleTime = perfMonitor.end('expand_collapse_cycles')
      
      // 50 expand/collapse operations should be fast
      expect(cycleTime).toBeLessThan(300)
    })
  })

  describe('Network Resilience Under Load', () => {
    it('should handle network failures gracefully across multiple cards', async () => {
      let failureCount = 0
      const mockUpdate = jest.fn().mockImplementation(() => {
        failureCount++
        if (failureCount <= 3) {
          return Promise.reject(new Error('Network error'))
        }
        return Promise.resolve()
      })
      
      const { getByTestId } = render(
        React.createElement(TestMultiCardContainer, { 
          cardCount: 5, 
          onUpdate: mockUpdate 
        })
      )
      
      perfMonitor.start()
      
      // Trigger saves that will initially fail
      await act(async () => {
        for (let i = 0; i < 5; i++) {
          const titleInput = getByTestId(`title-${i}`)
          fireEvent.change(titleInput, { target: { value: `Network test ${i}` } })
        }
        
        jest.advanceTimersByTime(150)
        
        // Advance time for retries
        jest.advanceTimersByTime(2000)
        jest.advanceTimersByTime(4000)
        jest.advanceTimersByTime(8000)
        
        await new Promise(resolve => setTimeout(resolve, 100))
      })
      
      const recoveryTime = perfMonitor.end('network_recovery')
      
      // Should recover from network issues efficiently
      expect(recoveryTime).toBeLessThan(500)
      
      // Should have attempted retries
      expect(mockUpdate).toHaveBeenCalledTimes(8) // 5 initial + 3 retries
    })
  })

  describe('Performance Benchmarks', () => {
    it('should meet performance SLA for typical usage', async () => {
      const benchmarks = {
        cardRenderTime: 0,
        updateResponseTime: 0,
        saveOperationTime: 0
      }
      
      // Benchmark card rendering
      perfMonitor.start()
      const { getByTestId } = render(
        React.createElement(TestMultiCardContainer, { cardCount: 10 })
      )
      benchmarks.cardRenderTime = perfMonitor.end('render_benchmark')
      
      // Benchmark update response time
      perfMonitor.start()
      await act(async () => {
        const titleInput = getByTestId('title-0')
        fireEvent.change(titleInput, { target: { value: 'Benchmark test' } })
      })
      benchmarks.updateResponseTime = perfMonitor.end('update_benchmark')
      
      // Benchmark save operation
      const mockUpdate = jest.fn().mockResolvedValue(undefined)
      perfMonitor.start()
      
      const { getByTestId: getByTestId2 } = render(
        React.createElement(TestCardComponent, { 
          cardId: 'benchmark',
          onUpdate: mockUpdate
        })
      )
      
      await act(async () => {
        const titleInput = getByTestId2('title-benchmark')
        fireEvent.change(titleInput, { target: { value: 'Save benchmark' } })
        jest.advanceTimersByTime(150)
        await new Promise(resolve => setTimeout(resolve, 50))
      })
      
      benchmarks.saveOperationTime = perfMonitor.end('save_benchmark')
      
      // SLA expectations
      expect(benchmarks.cardRenderTime).toBeLessThan(100) // 10 cards < 100ms
      expect(benchmarks.updateResponseTime).toBeLessThan(20) // UI update < 20ms
      expect(benchmarks.saveOperationTime).toBeLessThan(200) // Save operation < 200ms
      
      // Log benchmarks for monitoring
      console.log('Performance Benchmarks:', benchmarks)
    })
  })
})