/**
 * Simplified Performance Testing for Enhanced MasterCard Components
 * Phase A.4: Performance testing and optimization
 */

import { renderHook, act } from '@testing-library/react'
import { useAutoSave } from '../hooks/useAutoSave'
import { useValidation, validators } from '../hooks/useValidation'

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

  getMetrics() {
    return this.metrics
  }

  clear() {
    this.metrics = []
  }
}

describe('Performance Testing - Simplified', () => {
  let perfMonitor: PerformanceMonitor

  beforeEach(() => {
    perfMonitor = new PerformanceMonitor()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
    perfMonitor.clear()
  })

  describe('Hook Performance', () => {
    it('should handle rapid useAutoSave updates efficiently', async () => {
      const mockSave = jest.fn().mockResolvedValue({ success: true })
      const updateTimes: number[] = []

      const { result } = renderHook(() =>
        useAutoSave(
          { title: '', description: '' },
          mockSave,
          { debounceMs: 100 }
        )
      )

      // Perform rapid updates
      for (let i = 0; i < 10; i++) {
        perfMonitor.start()
        
        act(() => {
          result.current.updateField('title', `Title ${i}`)
        })
        
        updateTimes.push(perfMonitor.end('rapid_update'))
      }

      // Each update should be fast
      updateTimes.forEach(time => {
        expect(time).toBeLessThan(10) // Each update < 10ms
      })

      const avgTime = updateTimes.reduce((sum, time) => sum + time, 0) / updateTimes.length
      expect(avgTime).toBeLessThan(5) // Average < 5ms

      // Trigger saves
      act(() => {
        jest.advanceTimersByTime(150)
      })

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
      })

      // Should debounce to single save call
      expect(mockSave).toHaveBeenCalledTimes(1)
    })

    it('should handle multiple useValidation hooks efficiently', async () => {
      const rules = [
        {
          field: 'email' as const,
          validate: validators.required('Email required')
        },
        {
          field: 'name' as const,
          validate: validators.required('Name required')
        }
      ]

      const hookTimes: number[] = []

      // Create multiple validation hooks
      for (let i = 0; i < 5; i++) {
        perfMonitor.start()
        
        const { result } = renderHook(() =>
          useValidation({ email: '', name: '' }, { rules })
        )

        hookTimes.push(perfMonitor.end('validation_hook_creation'))

        // Test validation performance
        perfMonitor.start()
        
        await act(async () => {
          await result.current.validateField('email', 'test@example.com')
        })

        const validationTime = perfMonitor.end('validation_execution')
        expect(validationTime).toBeLessThan(5) // Validation < 5ms
      }

      // Hook creation should be fast
      hookTimes.forEach(time => {
        expect(time).toBeLessThan(20) // Hook creation < 20ms
      })
    })

    it('should handle batch updates in useAutoSave efficiently', async () => {
      const mockSave = jest.fn().mockResolvedValue({ success: true })

      const { result } = renderHook(() =>
        useAutoSave(
          { field1: '', field2: '', field3: '', field4: '', field5: '' },
          mockSave,
          { debounceMs: 100 }
        )
      )

      perfMonitor.start()

      // Batch update multiple fields
      act(() => {
        result.current.updateFields({
          field1: 'value1',
          field2: 'value2',
          field3: 'value3',
          field4: 'value4',
          field5: 'value5'
        })
      })

      const batchUpdateTime = perfMonitor.end('batch_update')
      
      // Batch update should be fast
      expect(batchUpdateTime).toBeLessThan(10)

      // Trigger save
      act(() => {
        jest.advanceTimersByTime(150)
      })

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
      })

      // Should save once with all updates
      expect(mockSave).toHaveBeenCalledTimes(1)
      expect(mockSave).toHaveBeenCalledWith({
        field1: 'value1',
        field2: 'value2',
        field3: 'value3',
        field4: 'value4',
        field5: 'value5'
      })
    })
  })

  describe('Memory Performance', () => {
    it('should not accumulate memory with hook creation/destruction', () => {
      const initialHeap = (performance as any).memory?.usedJSHeapSize || 0
      
      // Create and destroy many hooks
      for (let i = 0; i < 20; i++) {
        const { unmount } = renderHook(() =>
          useAutoSave(
            { data: `test${i}` },
            async () => ({ success: true }),
            { debounceMs: 50 }
          )
        )
        
        const { unmount: unmount2 } = renderHook(() =>
          useValidation(
            { field: `value${i}` },
            { rules: [{ field: 'field', validate: validators.required() }] }
          )
        )

        unmount()
        unmount2()
      }

      // Force garbage collection if available
      if ((global as any).gc) {
        (global as any).gc()
      }

      const finalHeap = (performance as any).memory?.usedJSHeapSize || 0
      const heapIncrease = finalHeap - initialHeap

      // Memory increase should be reasonable (< 2MB for this test)
      if ((performance as any).memory) {
        expect(heapIncrease).toBeLessThan(2 * 1024 * 1024)
      }
    })
  })

  describe('Async Validation Performance', () => {
    it('should handle async validation efficiently', async () => {
      const asyncValidator = async (value: string) => {
        await new Promise(resolve => setTimeout(resolve, 5))
        return value.includes('invalid') ? 'Invalid value' : null
      }

      const rules = [
        {
          field: 'username' as const,
          validate: asyncValidator,
          async: true
        }
      ]

      const { result } = renderHook(() =>
        useValidation({ username: '' }, { rules })
      )

      const validationTimes: number[] = []

      // Test multiple async validations
      for (let i = 0; i < 5; i++) {
        perfMonitor.start()
        
        await act(async () => {
          await result.current.validateField('username', `user${i}`)
        })

        validationTimes.push(perfMonitor.end('async_validation'))
      }

      // Async validations should complete reasonably fast
      validationTimes.forEach(time => {
        expect(time).toBeLessThan(50) // Each async validation < 50ms
      })

      const avgTime = validationTimes.reduce((sum, time) => sum + time, 0) / validationTimes.length
      expect(avgTime).toBeLessThan(30) // Average < 30ms
    })
  })

  describe('Performance Benchmarks', () => {
    it('should meet performance SLA for typical operations', async () => {
      const benchmarks = {
        hookCreation: 0,
        fieldUpdate: 0,
        validation: 0,
        batchUpdate: 0
      }

      // Benchmark hook creation
      perfMonitor.start()
      const { result } = renderHook(() =>
        useAutoSave(
          { title: '', description: '', priority: 'medium' },
          async () => ({ success: true }),
          { debounceMs: 200 }
        )
      )
      benchmarks.hookCreation = perfMonitor.end('hook_creation')

      // Benchmark field update
      perfMonitor.start()
      act(() => {
        result.current.updateField('title', 'Test Title')
      })
      benchmarks.fieldUpdate = perfMonitor.end('field_update')

      // Benchmark validation
      const { result: validationResult } = renderHook(() =>
        useValidation(
          { email: 'test@example.com' },
          { rules: [{ field: 'email', validate: validators.email() }] }
        )
      )

      perfMonitor.start()
      await act(async () => {
        await validationResult.current.validateField('email', 'test@example.com')
      })
      benchmarks.validation = perfMonitor.end('validation')

      // Benchmark batch update
      perfMonitor.start()
      act(() => {
        result.current.updateFields({
          title: 'Batch Title',
          description: 'Batch Description',
          priority: 'high'
        })
      })
      benchmarks.batchUpdate = perfMonitor.end('batch_update')

      // Performance SLA expectations
      expect(benchmarks.hookCreation).toBeLessThan(50) // Hook creation < 50ms
      expect(benchmarks.fieldUpdate).toBeLessThan(10) // Field update < 10ms
      expect(benchmarks.validation).toBeLessThan(20) // Validation < 20ms
      expect(benchmarks.batchUpdate).toBeLessThan(15) // Batch update < 15ms

      // Log benchmarks for monitoring
      console.log('Performance Benchmarks:', benchmarks)
    })
  })

  describe('Stress Testing', () => {
    it('should handle high frequency updates without degradation', async () => {
      const mockSave = jest.fn().mockResolvedValue({ success: true })

      const { result } = renderHook(() =>
        useAutoSave(
          { counter: 0 },
          mockSave,
          { debounceMs: 50 }
        )
      )

      const updateTimes: number[] = []

      // Perform 100 rapid updates
      for (let i = 0; i < 100; i++) {
        perfMonitor.start()
        
        act(() => {
          result.current.updateField('counter', i)
        })
        
        updateTimes.push(perfMonitor.end('stress_update'))
      }

      // Performance should not degrade significantly
      const firstTenAvg = updateTimes.slice(0, 10).reduce((sum, time) => sum + time, 0) / 10
      const lastTenAvg = updateTimes.slice(-10).reduce((sum, time) => sum + time, 0) / 10
      
      // Last updates should not be more than 2x slower than first updates
      expect(lastTenAvg).toBeLessThan(firstTenAvg * 2)

      // All updates should be reasonably fast
      updateTimes.forEach(time => {
        expect(time).toBeLessThan(20)
      })

      // Trigger save
      act(() => {
        jest.advanceTimersByTime(100)
      })

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
      })

      // Should debounce to single save
      expect(mockSave).toHaveBeenCalledTimes(1)
    })
  })
})