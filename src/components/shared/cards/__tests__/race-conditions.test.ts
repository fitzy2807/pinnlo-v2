/**
 * Race Condition Tests for useAutoSave Hook
 * Phase A.2: Fix race conditions in useAutoSave
 */

import { act, render, fireEvent } from '@testing-library/react'
import React from 'react'
import { useAutoSave } from '../hooks/useAutoSave'

// Mock toast notifications
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
  }
}))

// Test component that uses useAutoSave
const TestAutoSaveComponent: React.FC<{ 
  onUpdate?: (data: any) => Promise<any>
  initialData?: any
  debounceMs?: number
}> = ({ onUpdate, initialData = { field1: '', field2: '' }, debounceMs = 100 }) => {
  const { data, updateField, isDirty, saveStatus } = useAutoSave(
    initialData,
    onUpdate || (() => Promise.resolve()),
    { debounceMs }
  )
  
  return React.createElement('div', {},
    React.createElement('input', {
      'data-testid': 'field1',
      value: data.field1,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => updateField('field1', e.target.value)
    }),
    React.createElement('input', {
      'data-testid': 'field2', 
      value: data.field2,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => updateField('field2', e.target.value)
    }),
    React.createElement('div', {
      'data-testid': 'save-status'
    }, saveStatus),
    React.createElement('div', {
      'data-testid': 'is-dirty'
    }, isDirty.toString())
  )
}

describe('Race Condition Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('useAutoSave Race Conditions', () => {
    it('should handle rapid field updates without data loss', async () => {
      const mockUpdate = jest.fn().mockResolvedValue({ success: true })
      const { getByTestId } = render(
        React.createElement(TestAutoSaveComponent, { onUpdate: mockUpdate, debounceMs: 50 })
      )
      
      const field1 = getByTestId('field1') as HTMLInputElement
      
      // Rapidly update the same field multiple times
      act(() => {
        fireEvent.change(field1, { target: { value: 'value1' } })
        fireEvent.change(field1, { target: { value: 'value2' } })
        fireEvent.change(field1, { target: { value: 'value3' } })
        fireEvent.change(field1, { target: { value: 'final' } })
      })
      
      // Wait for debounce to complete
      act(() => {
        jest.advanceTimersByTime(100)
      })
      
      // Should only save once with the final value
      expect(mockUpdate).toHaveBeenCalledTimes(1)
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ field1: 'final' })
      )
    })

    it('should handle concurrent updates to different fields', async () => {
      const mockUpdate = jest.fn().mockResolvedValue({ success: true })
      const { getByTestId } = render(
        React.createElement(TestAutoSaveComponent, { onUpdate: mockUpdate, debounceMs: 50 })
      )
      
      const field1 = getByTestId('field1') as HTMLInputElement
      const field2 = getByTestId('field2') as HTMLInputElement
      
      // Update different fields concurrently
      act(() => {
        fireEvent.change(field1, { target: { value: 'field1_value' } })
        fireEvent.change(field2, { target: { value: 'field2_value' } })
      })
      
      // Wait for debounce
      act(() => {
        jest.advanceTimersByTime(100)
      })
      
      // Should save both fields together
      expect(mockUpdate).toHaveBeenCalledTimes(1)
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          field1: 'field1_value',
          field2: 'field2_value'
        })
      )
    })

    it('should handle save errors during concurrent updates', async () => {
      const mockUpdate = jest.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ success: true })
      
      const { getByTestId } = render(
        React.createElement(TestAutoSaveComponent, { onUpdate: mockUpdate, debounceMs: 50 })
      )
      
      const field1 = getByTestId('field1') as HTMLInputElement
      
      // Make an update that will fail
      act(() => {
        fireEvent.change(field1, { target: { value: 'value1' } })
      })
      
      // Wait for debounce and initial save attempt
      await act(async () => {
        jest.advanceTimersByTime(100)
        await new Promise(resolve => setTimeout(resolve, 0))
      })
      
      // Should have attempted the first save (which failed)
      expect(mockUpdate).toHaveBeenCalledTimes(1)
      
      // Make another update while retry is pending
      act(() => {
        fireEvent.change(field1, { target: { value: 'value2' } })
      })
      
      // Advance time for retry
      await act(async () => {
        jest.advanceTimersByTime(2100) // Exponential backoff + debounce
        await new Promise(resolve => setTimeout(resolve, 0))
      })
      
      // Should not lose the second update
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ field1: 'value2' })
      )
    })

    it('should prevent race conditions with version conflicts', async () => {
      const mockUpdate = jest.fn()
        .mockResolvedValueOnce({ success: true, version: 2 })
        .mockRejectedValueOnce(new Error('VERSION_CONFLICT'))
        .mockResolvedValueOnce({ success: true, version: 3 })
      
      const { getByTestId } = render(
        React.createElement(TestAutoSaveComponent, { 
          onUpdate: mockUpdate, 
          debounceMs: 50,
          initialData: { field1: '', __version: 1 }
        })
      )
      
      const field1 = getByTestId('field1') as HTMLInputElement
      
      // First update
      act(() => {
        fireEvent.change(field1, { target: { value: 'value1' } })
      })
      
      act(() => {
        jest.advanceTimersByTime(100)
      })
      
      // Second update while first is in progress
      act(() => {
        fireEvent.change(field1, { target: { value: 'value2' } })
      })
      
      act(() => {
        jest.advanceTimersByTime(100)
      })
      
      // Should handle version conflict gracefully
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ __version: 2 })
      )
    })

    it('should handle unmount during pending save', async () => {
      let resolveUpdate: (value: any) => void
      const mockUpdate = jest.fn(() => {
        return new Promise(resolve => {
          resolveUpdate = resolve
        })
      })
      
      const { getByTestId, unmount } = render(
        React.createElement(TestAutoSaveComponent, { onUpdate: mockUpdate, debounceMs: 50 })
      )
      
      const field1 = getByTestId('field1') as HTMLInputElement
      
      // Start an update
      act(() => {
        fireEvent.change(field1, { target: { value: 'value1' } })
      })
      
      act(() => {
        jest.advanceTimersByTime(100)
      })
      
      // Unmount while save is pending
      unmount()
      
      // Resolve the pending save
      act(() => {
        resolveUpdate({ success: true })
      })
      
      // Should not throw or cause issues
      expect(mockUpdate).toHaveBeenCalledTimes(1)
    })

    it('should handle offline/online transitions correctly', async () => {
      const mockUpdate = jest.fn().mockResolvedValue({ success: true })
      
      const { getByTestId } = render(
        React.createElement(TestAutoSaveComponent, { onUpdate: mockUpdate, debounceMs: 50 })
      )
      
      const field1 = getByTestId('field1') as HTMLInputElement
      
      // Simulate going offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      })
      
      // Make updates while offline
      act(() => {
        fireEvent.change(field1, { target: { value: 'offline_value' } })
      })
      
      act(() => {
        jest.advanceTimersByTime(100)
      })
      
      // Should not call update while offline
      expect(mockUpdate).not.toHaveBeenCalled()
      
      // Come back online
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      })
      
      // Trigger online event
      act(() => {
        window.dispatchEvent(new Event('online'))
      })
      
      // Should now sync the offline changes
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })
      
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ field1: 'offline_value' })
      )
    })

    it('should handle rapid mount/unmount without race conditions', async () => {
      const mockUpdate = jest.fn().mockResolvedValue({ success: true })
      
      for (let i = 0; i < 10; i++) {
        const { getByTestId, unmount } = render(
          React.createElement(TestAutoSaveComponent, { onUpdate: mockUpdate })
        )
        
        const field1 = getByTestId('field1') as HTMLInputElement
        
        // Make a quick update
        act(() => {
          fireEvent.change(field1, { target: { value: `value${i}` } })
        })
        
        // Unmount before debounce completes
        unmount()
      }
      
      // Wait for any pending operations
      act(() => {
        jest.advanceTimersByTime(1000)
      })
      
      // Should not have any saves from unmounted components
      expect(mockUpdate).not.toHaveBeenCalled()
    })

    it('should maintain data consistency under load', async () => {
      const saveOrder: string[] = []
      const mockUpdate = jest.fn().mockImplementation(async (data) => {
        saveOrder.push(data.field1)
        return { success: true }
      })
      
      const { getByTestId } = render(
        React.createElement(TestAutoSaveComponent, { onUpdate: mockUpdate, debounceMs: 100 })
      )
      
      const field1 = getByTestId('field1') as HTMLInputElement
      
      // Simulate rapid typing
      const values = ['a', 'ab', 'abc', 'abcd', 'abcde']
      
      values.forEach((value, index) => {
        act(() => {
          fireEvent.change(field1, { target: { value } })
        })
        
        // Small delay between each change
        act(() => {
          jest.advanceTimersByTime(20)
        })
      })
      
      // Wait for final debounce
      act(() => {
        jest.advanceTimersByTime(200)
      })
      
      // Should only save the final value
      expect(mockUpdate).toHaveBeenCalledTimes(1)
      expect(saveOrder).toEqual(['abcde'])
    })
  })
})