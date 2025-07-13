/**
 * Working Validation Tests for Shared Card Components
 * Phase A.3: Test validation edge cases (simplified version)
 */

import { renderHook, act } from '@testing-library/react'
import { useValidation, validators } from '../hooks/useValidation'

describe('Working Validation Tests', () => {
  describe('Required Field Validation Edge Cases', () => {
    it('should accept zero as a valid required value', async () => {
      const rules = [
        {
          field: 'test_field' as const,
          validate: validators.required('This field is required')
        }
      ]
      
      const { result } = renderHook(() => 
        useValidation({ test_field: 0 }, { rules })
      )
      
      await act(async () => {
        await result.current.validateField('test_field', 0)
        result.current.touchField('test_field')
      })
      
      expect(result.current.getFieldError('test_field')).toBeUndefined()
    })

    it('should accept false as a valid required value', async () => {
      const rules = [
        {
          field: 'test_field' as const,
          validate: validators.required('This field is required')
        }
      ]
      
      const { result } = renderHook(() => 
        useValidation({ test_field: false }, { rules })
      )
      
      await act(async () => {
        await result.current.validateField('test_field', false)
        result.current.touchField('test_field')
      })
      
      expect(result.current.getFieldError('test_field')).toBeUndefined()
    })

    it('should reject null values', async () => {
      const rules = [
        {
          field: 'test_field' as const,
          validate: validators.required('This field is required')
        }
      ]
      
      const { result } = renderHook(() => 
        useValidation({ test_field: null }, { rules })
      )
      
      await act(async () => {
        await result.current.validateField('test_field', null)
        result.current.touchField('test_field')
      })
      
      expect(result.current.getFieldError('test_field')).toBe('This field is required')
    })

    it('should reject empty strings', async () => {
      const rules = [
        {
          field: 'test_field' as const,
          validate: validators.required('This field is required')
        }
      ]
      
      const { result } = renderHook(() => 
        useValidation({ test_field: '' }, { rules })
      )
      
      await act(async () => {
        await result.current.validateField('test_field', '')
        result.current.touchField('test_field')
      })
      
      expect(result.current.getFieldError('test_field')).toBe('This field is required')
    })

    it('should reject whitespace-only strings', async () => {
      const rules = [
        {
          field: 'test_field' as const,
          validate: validators.required('This field is required')
        }
      ]
      
      const { result } = renderHook(() => 
        useValidation({ test_field: '   ' }, { rules })
      )
      
      await act(async () => {
        await result.current.validateField('test_field', '   ')
        result.current.touchField('test_field')
      })
      
      expect(result.current.getFieldError('test_field')).toBe('This field is required')
    })
  })

  describe('Exception Handling', () => {
    it('should handle validators that throw exceptions', async () => {
      const throwingValidator = () => {
        throw new Error('Validator error')
      }
      
      const rules = [
        {
          field: 'test_field' as const,
          validate: throwingValidator
        }
      ]
      
      const { result } = renderHook(() => 
        useValidation({ test_field: 'test' }, { rules })
      )
      
      await act(async () => {
        await result.current.validateField('test_field', 'test')
        result.current.touchField('test_field')
      })
      
      expect(result.current.getFieldError('test_field')).toBe('Validation error')
    })

    it('should handle undefined validator functions', async () => {
      const rules = [
        {
          field: 'test_field' as const,
          validate: undefined as any
        }
      ]
      
      const { result } = renderHook(() => 
        useValidation({ test_field: 'test' }, { rules })
      )
      
      await act(async () => {
        await result.current.validateField('test_field', 'test')
        result.current.touchField('test_field')
      })
      
      // Should not throw and should not have error
      expect(result.current.getFieldError('test_field')).toBeUndefined()
    })
  })

  describe('Email Validation Edge Cases', () => {
    it('should reject emails with spaces', async () => {
      const rules = [
        {
          field: 'email' as const,
          validate: validators.email('Invalid email format')
        }
      ]
      
      const { result } = renderHook(() => 
        useValidation({ email: 'user @example.com' }, { rules })
      )
      
      await act(async () => {
        await result.current.validateField('email', 'user @example.com')
        result.current.touchField('email')
      })
      
      expect(result.current.getFieldError('email')).toBe('Invalid email format')
    })

    it('should accept valid international emails', async () => {
      const rules = [
        {
          field: 'email' as const,
          validate: validators.email('Invalid email format')
        }
      ]
      
      const { result } = renderHook(() => 
        useValidation({ email: 'user@example.co.uk' }, { rules })
      )
      
      await act(async () => {
        await result.current.validateField('email', 'user@example.co.uk')
        result.current.touchField('email')
      })
      
      expect(result.current.getFieldError('email')).toBeUndefined()
    })
  })

  describe('Pattern Validation Edge Cases', () => {
    it('should handle unicode characters in patterns', async () => {
      const rules = [
        {
          field: 'text' as const,
          validate: validators.pattern(/^[\u4e00-\u9fff]+$/, 'Must be Chinese characters')
        }
      ]
      
      const { result } = renderHook(() => 
        useValidation({ text: '你好世界' }, { rules })
      )
      
      await act(async () => {
        await result.current.validateField('text', '你好世界')
        result.current.touchField('text')
      })
      
      expect(result.current.getFieldError('text')).toBeUndefined()
    })

    it('should handle case-sensitive patterns correctly', async () => {
      const rules = [
        {
          field: 'text' as const,
          validate: validators.pattern(/^[A-Z]+$/, 'Must be uppercase letters only')
        }
      ]
      
      const { result } = renderHook(() => 
        useValidation({ text: 'Hello' }, { rules })
      )
      
      await act(async () => {
        await result.current.validateField('text', 'Hello')
        result.current.touchField('text')
      })
      
      expect(result.current.getFieldError('text')).toBe('Must be uppercase letters only')
    })
  })

  describe('Multiple Validation Rules', () => {
    it('should return first failing validation', async () => {
      const rules = [
        {
          field: 'email' as const,
          validate: validators.required('Email is required')
        },
        {
          field: 'email' as const,
          validate: validators.email('Invalid email format')
        },
        {
          field: 'email' as const,
          validate: validators.pattern(/^.+@company\.com$/, 'Must be company email')
        }
      ]
      
      const { result } = renderHook(() => 
        useValidation({ email: 'user@gmail.com' }, { rules })
      )
      
      await act(async () => {
        await result.current.validateField('email', 'user@gmail.com')
        result.current.touchField('email')
      })
      
      expect(result.current.getFieldError('email')).toBe('Must be company email')
    })

    it('should pass when all rules validate', async () => {
      const rules = [
        {
          field: 'email' as const,
          validate: validators.required('Email is required')
        },
        {
          field: 'email' as const,
          validate: validators.email('Invalid email format')
        },
        {
          field: 'email' as const,
          validate: validators.pattern(/^.+@company\.com$/, 'Must be company email')
        }
      ]
      
      const { result } = renderHook(() => 
        useValidation({ email: 'user@company.com' }, { rules })
      )
      
      await act(async () => {
        await result.current.validateField('email', 'user@company.com')
        result.current.touchField('email')
      })
      
      expect(result.current.getFieldError('email')).toBeUndefined()
    })
  })

  describe('Async Validation Edge Cases', () => {
    it('should handle async validation correctly', async () => {
      const asyncValidator = async (value: string) => {
        await new Promise(resolve => setTimeout(resolve, 10))
        return value === 'taken' ? 'This value is already taken' : null
      }
      
      const rules = [
        {
          field: 'username' as const,
          validate: asyncValidator,
          async: true
        }
      ]
      
      const { result } = renderHook(() => 
        useValidation({ username: 'taken' }, { rules })
      )
      
      await act(async () => {
        await result.current.validateField('username', 'taken')
        result.current.touchField('username')
      })
      
      expect(result.current.getFieldError('username')).toBe('This value is already taken')
    })

    it('should handle async validation exceptions', async () => {
      const faultyAsyncValidator = async () => {
        throw new Error('Async validation failed')
      }
      
      const rules = [
        {
          field: 'username' as const,
          validate: faultyAsyncValidator,
          async: true
        }
      ]
      
      const { result } = renderHook(() => 
        useValidation({ username: 'test' }, { rules })
      )
      
      await act(async () => {
        await result.current.validateField('username', 'test')
        result.current.touchField('username')
      })
      
      expect(result.current.getFieldError('username')).toBe('Validation error')
    })
  })

  describe('Data Type Edge Cases', () => {
    it('should handle object values correctly', async () => {
      const rules = [
        {
          field: 'config' as const,
          validate: validators.required('Config is required')
        }
      ]
      
      const { result } = renderHook(() => 
        useValidation({ config: { setting: 'value' } }, { rules })
      )
      
      await act(async () => {
        await result.current.validateField('config', { setting: 'value' })
        result.current.touchField('config')
      })
      
      // Objects should be considered valid (not empty)
      expect(result.current.getFieldError('config')).toBeUndefined()
    })

    it('should handle array values correctly', async () => {
      const rules = [
        {
          field: 'items' as const,
          validate: validators.required('Items are required')
        }
      ]
      
      const { result } = renderHook(() => 
        useValidation({ items: [] }, { rules })
      )
      
      await act(async () => {
        await result.current.validateField('items', [])
        result.current.touchField('items')
      })
      
      // Empty arrays should be considered invalid
      expect(result.current.getFieldError('items')).toBe('Items are required')
    })
  })

  describe('Form Validation State', () => {
    it('should track overall form validity correctly', async () => {
      const rules = [
        {
          field: 'email' as const,
          validate: validators.required('Email is required')
        },
        {
          field: 'name' as const,
          validate: validators.required('Name is required')
        }
      ]
      
      const { result } = renderHook(() => 
        useValidation({ email: '', name: 'John' }, { rules })
      )
      
      // Initially should be valid (no touched fields)
      expect(result.current.isValid).toBe(true)
      
      await act(async () => {
        await result.current.validateField('email', '')
        result.current.touchField('email')
      })
      
      // Should be invalid after touching empty email
      expect(result.current.isValid).toBe(false)
      
      await act(async () => {
        await result.current.validateField('email', 'john@example.com')
      })
      
      // Should be valid after fixing email
      expect(result.current.isValid).toBe(true)
    })
  })
})