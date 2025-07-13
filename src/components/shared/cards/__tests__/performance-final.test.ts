/**
 * Final Performance Testing for Enhanced MasterCard Components
 * Phase A.4: Performance testing and optimization - Final Implementation
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

describe('Performance Testing - Final', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('Hook Creation Performance', () => {
    it('should create useAutoSave hooks quickly', () => {
      const times: number[] = []
      
      for (let i = 0; i < 10; i++) {
        const start = performance.now()
        
        const { unmount } = renderHook(() =>
          useAutoSave(
            { test: `value${i}` },
            async () => ({ success: true }),
            { debounceMs: 100 }
          )
        )
        
        times.push(performance.now() - start)
        unmount()
      }

      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length
      expect(avgTime).toBeLessThan(50) // Average creation time < 50ms
      
      times.forEach(time => {
        expect(time).toBeLessThan(100) // No individual creation > 100ms
      })
    })

    it('should create useValidation hooks quickly', () => {
      const rules = [
        { field: 'email' as const, validate: validators.email() },
        { field: 'name' as const, validate: validators.required() }
      ]
      
      const times: number[] = []
      
      for (let i = 0; i < 10; i++) {
        const start = performance.now()
        
        const { unmount } = renderHook(() =>
          useValidation({ email: '', name: '' }, { rules })
        )
        
        times.push(performance.now() - start)
        unmount()
      }

      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length
      expect(avgTime).toBeLessThan(30) // Average creation time < 30ms
    })
  })

  describe('Update Performance', () => {
    it('should handle field updates efficiently', () => {
      const mockSave = jest.fn().mockResolvedValue({ success: true })
      
      const { result } = renderHook(() =>
        useAutoSave(
          { title: '', description: '' },
          mockSave,
          { debounceMs: 100 }
        )
      )

      const updateTimes: number[] = []

      // Test 20 rapid updates
      for (let i = 0; i < 20; i++) {
        const start = performance.now()
        
        act(() => {
          result.current.updateField('title', `Title ${i}`)
        })
        
        updateTimes.push(performance.now() - start)
      }

      const avgTime = updateTimes.reduce((sum, time) => sum + time, 0) / updateTimes.length
      expect(avgTime).toBeLessThan(5) // Average update time < 5ms

      updateTimes.forEach(time => {
        expect(time).toBeLessThan(20) // No individual update > 20ms
      })
    })

    it('should handle batch updates efficiently', () => {
      const mockSave = jest.fn().mockResolvedValue({ success: true })
      
      const { result } = renderHook(() =>
        useAutoSave(
          { field1: '', field2: '', field3: '', field4: '', field5: '' },
          mockSave,
          { debounceMs: 100 }
        )
      )

      const start = performance.now()

      act(() => {
        result.current.updateFields({
          field1: 'value1',
          field2: 'value2',
          field3: 'value3',
          field4: 'value4',
          field5: 'value5'
        })
      })

      const batchTime = performance.now() - start
      expect(batchTime).toBeLessThan(10) // Batch update < 10ms
    })
  })

  describe('Validation Performance', () => {
    it('should validate fields quickly', async () => {
      const { result } = renderHook(() =>
        useValidation(
          { email: '', name: '', phone: '' },
          {
            rules: [
              { field: 'email', validate: validators.email() },
              { field: 'name', validate: validators.required() },
              { field: 'phone', validate: validators.pattern(/^\d{10}$/) }
            ]
          }
        )
      )

      const validationTimes: number[] = []

      // Test multiple validations
      const testCases = [
        { field: 'email', value: 'test@example.com' },
        { field: 'name', value: 'John Doe' },
        { field: 'phone', value: '1234567890' },
        { field: 'email', value: 'invalid-email' },
        { field: 'name', value: '' }
      ]

      for (const testCase of testCases) {
        const start = performance.now()
        
        await act(async () => {
          await result.current.validateField(testCase.field as any, testCase.value)
        })
        
        validationTimes.push(performance.now() - start)
      }

      const avgTime = validationTimes.reduce((sum, time) => sum + time, 0) / validationTimes.length
      expect(avgTime).toBeLessThan(10) // Average validation time < 10ms

      validationTimes.forEach(time => {
        expect(time).toBeLessThan(25) // No individual validation > 25ms
      })
    })
  })

  describe('Memory Performance', () => {
    it('should not leak memory during hook lifecycle', () => {
      const initialHeap = (performance as any).memory?.usedJSHeapSize || 0
      
      // Create and destroy many hooks
      for (let i = 0; i < 50; i++) {
        const { unmount: unmount1 } = renderHook(() =>
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

        unmount1()
        unmount2()
      }

      // Force garbage collection if available
      if ((global as any).gc) {
        (global as any).gc()
      }

      const finalHeap = (performance as any).memory?.usedJSHeapSize || 0
      const heapIncrease = finalHeap - initialHeap

      // Memory increase should be reasonable (< 5MB for this test)
      if ((performance as any).memory) {
        expect(heapIncrease).toBeLessThan(5 * 1024 * 1024)
      }
    })
  })

  describe('Debouncing Performance', () => {
    it('should debounce saves efficiently', async () => {
      const mockSave = jest.fn().mockResolvedValue({ success: true })
      
      const { result } = renderHook(() =>
        useAutoSave(
          { counter: 0 },
          mockSave,
          { debounceMs: 100 }
        )
      )

      // Make 50 rapid updates
      for (let i = 0; i < 50; i++) {
        act(() => {
          result.current.updateField('counter', i)
        })
      }

      expect(result.current.isDirty).toBe(true)
      expect(mockSave).not.toHaveBeenCalled()

      // Advance timers to trigger save
      act(() => {
        jest.advanceTimersByTime(150)
      })

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 50))
      })

      // Should have debounced to single save call
      expect(mockSave).toHaveBeenCalledTimes(1)
      expect(mockSave).toHaveBeenCalledWith({ counter: 49 })
    })
  })

  describe('Performance Benchmarks', () => {
    it('should meet overall performance targets', async () => {
      const benchmarks = {
        autoSaveHookCreation: 0,
        validationHookCreation: 0,
        fieldUpdate: 0,
        validation: 0
      }

      // Benchmark autoSave hook creation
      let start = performance.now()
      const { result: autoSaveResult } = renderHook(() =>
        useAutoSave(
          { title: '', priority: 'medium' },
          async () => ({ success: true }),
          { debounceMs: 200 }
        )
      )
      benchmarks.autoSaveHookCreation = performance.now() - start

      // Benchmark validation hook creation
      start = performance.now()
      const { result: validationResult } = renderHook(() =>
        useValidation(
          { email: '' },
          { rules: [{ field: 'email', validate: validators.email() }] }
        )
      )
      benchmarks.validationHookCreation = performance.now() - start

      // Benchmark field update
      start = performance.now()
      act(() => {
        autoSaveResult.current.updateField('title', 'Test Title')
      })
      benchmarks.fieldUpdate = performance.now() - start

      // Benchmark validation
      start = performance.now()
      await act(async () => {
        await validationResult.current.validateField('email', 'test@example.com')
      })
      benchmarks.validation = performance.now() - start

      // Performance targets
      expect(benchmarks.autoSaveHookCreation).toBeLessThan(50) // < 50ms
      expect(benchmarks.validationHookCreation).toBeLessThan(30) // < 30ms
      expect(benchmarks.fieldUpdate).toBeLessThan(10) // < 10ms
      expect(benchmarks.validation).toBeLessThan(15) // < 15ms

      // Log for monitoring
      console.log('Performance Benchmarks:', benchmarks)
    })
  })

  describe('Stress Testing', () => {
    it('should maintain performance under load', () => {
      const mockSave = jest.fn().mockResolvedValue({ success: true })
      
      const { result } = renderHook(() =>
        useAutoSave(
          { value: 0 },
          mockSave,
          { debounceMs: 50 }
        )
      )

      const updateTimes: number[] = []

      // Perform 100 rapid updates
      for (let i = 0; i < 100; i++) {
        const start = performance.now()
        
        act(() => {
          result.current.updateField('value', i)
        })
        
        updateTimes.push(performance.now() - start)
      }

      // Check performance doesn't degrade over time
      const firstQuarter = updateTimes.slice(0, 25)
      const lastQuarter = updateTimes.slice(75)
      
      const firstAvg = firstQuarter.reduce((sum, time) => sum + time, 0) / firstQuarter.length
      const lastAvg = lastQuarter.reduce((sum, time) => sum + time, 0) / lastQuarter.length
      
      // Performance shouldn't degrade by more than 50%
      expect(lastAvg).toBeLessThan(firstAvg * 1.5)
      
      // All updates should be reasonable
      updateTimes.forEach(time => {
        expect(time).toBeLessThan(30)
      })
    })
  })
})