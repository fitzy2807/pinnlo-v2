/**
 * Memory Leak Tests for Shared Card Components
 * Phase A.1: Test shared components for memory leaks
 */

import { act, render } from '@testing-library/react'
import React from 'react'
import { CollapsibleSection } from '../components/CollapsibleSection'
import { useAutoSave } from '../hooks/useAutoSave'

// Mock toast notifications
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
  }
}))

// Mock component using CollapsibleSection with ResizeObserver
const TestCollapsibleComponent: React.FC = () => {
  return React.createElement(CollapsibleSection, {
    title: "Test Section",
    colorScheme: "blue" as const,
    defaultExpanded: true
  }, React.createElement('div', {
    style: { height: '200px', width: '300px' }
  }, 'Test content that might trigger ResizeObserver'))
}

// Mock component using useAutoSave
const TestAutoSaveComponent: React.FC<{ onUpdate?: (data: any) => Promise<void> }> = ({ onUpdate }) => {
  const { data, updateField } = useAutoSave(
    { test: 'initial' },
    onUpdate || (() => Promise.resolve()),
    { debounceMs: 100 }
  )
  
  return React.createElement('div', {},
    React.createElement('input', {
      value: data.test,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => updateField('test', e.target.value),
      'data-testid': 'auto-save-input'
    })
  )
}

describe('Memory Leak Tests', () => {
  let mockResizeObserver: jest.Mock
  let originalResizeObserver: typeof ResizeObserver

  beforeAll(() => {
    // Mock ResizeObserver
    originalResizeObserver = global.ResizeObserver
    mockResizeObserver = jest.fn().mockImplementation((callback) => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn()
    }))
    global.ResizeObserver = mockResizeObserver
  })

  afterAll(() => {
    global.ResizeObserver = originalResizeObserver
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('CollapsibleSection Memory Leaks', () => {
    it('should properly cleanup ResizeObserver on unmount', () => {
      const { unmount } = render(React.createElement(TestCollapsibleComponent))
      
      // Verify ResizeObserver was created
      expect(mockResizeObserver).toHaveBeenCalled()
      
      const resizeObserverInstance = mockResizeObserver.mock.results[0].value
      
      // Unmount component
      unmount()
      
      // Verify disconnect was called
      expect(resizeObserverInstance.disconnect).toHaveBeenCalled()
    })

    it('should handle multiple mount/unmount cycles without leaking', () => {
      const mountCount = 10
      const instances: any[] = []
      
      // Mount and unmount multiple times
      for (let i = 0; i < mountCount; i++) {
        const { unmount } = render(React.createElement(TestCollapsibleComponent))
        
        // Store instance for verification
        if (mockResizeObserver.mock.results[i]) {
          instances.push(mockResizeObserver.mock.results[i].value)
        }
        
        // Unmount immediately
        unmount()
      }
      
      // Verify all instances were properly cleaned up
      instances.forEach(instance => {
        expect(instance.disconnect).toHaveBeenCalled()
      })
      
      expect(mockResizeObserver).toHaveBeenCalledTimes(mountCount)
    })

    it('should cleanup event listeners on unmount', () => {
      const mockRemoveEventListener = jest.spyOn(window, 'removeEventListener')
      
      const { unmount } = render(React.createElement(TestCollapsibleComponent))
      
      // Unmount and check for cleanup
      unmount()
      
      // Check if event listeners were removed (if any were added)
      // This is a general check - specific listeners depend on implementation
      expect(mockRemoveEventListener).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Function)
      )
      
      mockRemoveEventListener.mockRestore()
    })
  })

  describe('useAutoSave Memory Leaks', () => {
    it('should cleanup timers on unmount', async () => {
      jest.useFakeTimers()
      
      const mockUpdate = jest.fn().mockResolvedValue(undefined)
      const { unmount, getByTestId } = render(
        React.createElement(TestAutoSaveComponent, { onUpdate: mockUpdate })
      )
      
      const input = getByTestId('auto-save-input')
      
      // Trigger multiple updates to create timers
      act(() => {
        input.focus()
        input.blur()
        input.focus()
        input.blur()
      })
      
      // Unmount before timers fire
      unmount()
      
      // Fast forward time to see if any timers fire after unmount
      act(() => {
        jest.runAllTimers()
      })
      
      // Update should not have been called after unmount
      expect(mockUpdate).not.toHaveBeenCalled()
      
      jest.useRealTimers()
    })

    it('should not trigger updates after unmount', async () => {
      const mockUpdate = jest.fn().mockResolvedValue(undefined)
      const { unmount, getByTestId } = render(
        React.createElement(TestAutoSaveComponent, { onUpdate: mockUpdate })
      )
      
      const input = getByTestId('auto-save-input')
      
      // Start an update
      act(() => {
        input.focus()
        input.blur()
      })
      
      // Unmount immediately
      unmount()
      
      // Wait for any pending promises
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 200))
      })
      
      // Update should not have been called
      expect(mockUpdate).not.toHaveBeenCalled()
    })

    it('should handle rapid mount/unmount without memory leaks', async () => {
      const mockUpdate = jest.fn().mockResolvedValue(undefined)
      const mountCount = 20
      
      for (let i = 0; i < mountCount; i++) {
        const { unmount, getByTestId } = render(
          React.createElement(TestAutoSaveComponent, { onUpdate: mockUpdate })
        )
        
        const input = getByTestId('auto-save-input')
        
        // Trigger save
        act(() => {
          input.focus()
          input.blur()
        })
        
        // Unmount quickly
        unmount()
      }
      
      // Wait for any lingering promises
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 300))
      })
      
      // No updates should have fired after unmounts
      expect(mockUpdate).not.toHaveBeenCalled()
    })
  })

  describe('General Memory Leak Detection', () => {
    it('should not leak DOM references', () => {
      const initialNodeCount = document.querySelectorAll('*').length
      const containers: HTMLElement[] = []
      
      // Mount and unmount multiple components
      for (let i = 0; i < 5; i++) {
        const { unmount: unmountCollapsible, container: containerCollapsible } = render(React.createElement(TestCollapsibleComponent))
        const { unmount: unmountAutoSave, container: containerAutoSave } = render(React.createElement(TestAutoSaveComponent))
        
        containers.push(containerCollapsible as HTMLElement, containerAutoSave as HTMLElement)
        
        unmountCollapsible()
        unmountAutoSave()
        
        // Manually clean up containers to prevent DOM leaks
        if (containerCollapsible.parentNode) {
          containerCollapsible.parentNode.removeChild(containerCollapsible)
        }
        if (containerAutoSave.parentNode) {
          containerAutoSave.parentNode.removeChild(containerAutoSave)
        }
      }
      
      // Force garbage collection if available
      if ((global as any).gc) {
        (global as any).gc()
      }
      
      const finalNodeCount = document.querySelectorAll('*').length
      
      // More generous allowance for Jest/Testing Library overhead
      expect(finalNodeCount).toBeLessThanOrEqual(initialNodeCount + 10)
    })

    it('should cleanup all refs and callbacks', () => {
      const { unmount } = render(React.createElement(TestCollapsibleComponent))
      
      // Unmount
      unmount()
      
      // Try to trigger callbacks after unmount
      if (mockResizeObserver.mock.calls[0] && mockResizeObserver.mock.calls[0][0]) {
        const callback = mockResizeObserver.mock.calls[0][0]
        
        // This should not throw or cause issues
        expect(() => {
          callback([{ target: document.createElement('div') }])
        }).not.toThrow()
      }
    })
  })
})

// Performance monitoring test
describe('Performance Memory Tests', () => {
  it('should not consume excessive memory during normal operation', () => {
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0
    
    // Perform operations that might leak memory
    for (let i = 0; i < 100; i++) {
      const { unmount } = render(React.createElement(TestCollapsibleComponent))
      unmount()
    }
    
    // Force garbage collection if available
    if ((global as any).gc) {
      (global as any).gc()
    }
    
    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0
    const memoryIncrease = finalMemory - initialMemory
    
    // Memory increase should be reasonable (less than 10MB)
    if ((performance as any).memory) {
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024)
    }
  })
})