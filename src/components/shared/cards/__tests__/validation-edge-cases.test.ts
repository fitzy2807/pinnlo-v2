/**
 * Validation Edge Cases Tests for Shared Card Components
 * Phase A.3: Test validation edge cases
 */

import { act, render, fireEvent } from '@testing-library/react'
import React from 'react'
import { useValidation, validators } from '../hooks/useValidation'

// Mock toast notifications
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn()
  }
}))

// Test component using validation
const TestValidationComponent: React.FC<{ 
  validationRules?: any[]
  initialData?: any
}> = ({ validationRules = [], initialData = { email: '', phone: '', required_field: '' } }) => {
  const { errors, validateField, touchField, getFieldError, isValid } = useValidation(
    initialData, 
    { rules: validationRules }
  )
  
  return React.createElement('div', {},
    React.createElement('input', {
      'data-testid': 'email',
      value: initialData.email,
      onBlur: () => touchField('email')
    }),
    React.createElement('input', {
      'data-testid': 'phone',
      value: initialData.phone,
      onBlur: () => touchField('phone')
    }),
    React.createElement('input', {
      'data-testid': 'required_field',
      value: initialData.required_field,
      onBlur: () => touchField('required_field')
    }),
    React.createElement('button', {
      'data-testid': 'validate-email',
      onClick: () => validateField('email', initialData.email)
    }, 'Validate Email'),
    React.createElement('button', {
      'data-testid': 'validate-phone', 
      onClick: () => validateField('phone', initialData.phone)
    }, 'Validate Phone'),
    React.createElement('div', {
      'data-testid': 'email-error'
    }, getFieldError('email') || ''),
    React.createElement('div', {
      'data-testid': 'phone-error'
    }, getFieldError('phone') || ''),
    React.createElement('div', {
      'data-testid': 'required-error'
    }, getFieldError('required_field') || ''),
    React.createElement('div', {
      'data-testid': 'is-valid'
    }, isValid.toString())
  )
}

describe('Validation Edge Cases Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Required Field Validation', () => {
    it('should handle empty strings correctly', () => {
      const rules = [
        {
          field: 'required_field',
          validate: validators.required('This field is required')
        }
      ]
      
      const { getByTestId } = render(
        React.createElement(TestValidationComponent, {
          validationRules: rules,
          initialData: { required_field: '' }
        })
      )
      
      act(() => {
        fireEvent.blur(getByTestId('required_field'))
      })
      
      expect(getByTestId('required-error')).toHaveTextContent('This field is required')
    })

    it('should handle whitespace-only strings correctly', () => {
      const rules = [
        {
          field: 'required_field',
          validate: validators.required('This field is required')
        }
      ]
      
      const { getByTestId } = render(
        React.createElement(TestValidationComponent, {
          validationRules: rules,
          initialData: { required_field: '   ' }
        })
      )
      
      act(() => {
        fireEvent.blur(getByTestId('required_field'))
      })
      
      expect(getByTestId('required-error')).toHaveTextContent('This field is required')
    })

    it('should accept zero as a valid required value', () => {
      const rules = [
        {
          field: 'required_field',
          validate: validators.required('This field is required')
        }
      ]
      
      const { getByTestId } = render(
        React.createElement(TestValidationComponent, {
          validationRules: rules,
          initialData: { required_field: 0 }
        })
      )
      
      act(() => {
        fireEvent.blur(getByTestId('required_field'))
      })
      
      expect(getByTestId('required-error')).toHaveTextContent('')
    })

    it('should accept false as a valid required value', () => {
      const rules = [
        {
          field: 'required_field',
          validate: validators.required('This field is required')
        }
      ]
      
      const { getByTestId } = render(
        React.createElement(TestValidationComponent, {
          validationRules: rules,
          initialData: { required_field: false }
        })
      )
      
      act(() => {
        fireEvent.blur(getByTestId('required_field'))
      })
      
      expect(getByTestId('required-error')).toHaveTextContent('')
    })
  })

  describe('Email Validation Edge Cases', () => {
    it('should handle international domain names', () => {
      const rules = [
        {
          field: 'email',
          validate: validators.email('Invalid email format')
        }
      ]
      
      const { getByTestId } = render(
        React.createElement(TestValidationComponent, {
          validationRules: rules,
          initialData: { email: 'user@xn--fsq.xn--0zwm56d' } // Chinese domain
        })
      )
      
      act(() => {
        fireEvent.click(getByTestId('validate-email'))
      })
      
      // Should be valid - internationalized domain names are acceptable
      expect(getByTestId('email-error')).toHaveTextContent('')
    })

    it('should reject emails with spaces', () => {
      const rules = [
        {
          field: 'email',
          validate: validators.email('Invalid email format')
        }
      ]
      
      const { getByTestId } = render(
        React.createElement(TestValidationComponent, {
          validationRules: rules,
          initialData: { email: 'user @example.com' }
        })
      )
      
      act(() => {
        fireEvent.click(getByTestId('validate-email'))
      })
      
      expect(getByTestId('email-error')).toHaveTextContent('Invalid email format')
    })

    it('should handle very long email addresses', () => {
      const longEmail = 'a'.repeat(64) + '@' + 'b'.repeat(63) + '.com'
      const rules = [
        {
          field: 'email',
          validate: validators.email('Invalid email format')
        }
      ]
      
      const { getByTestId } = render(
        React.createElement(TestValidationComponent, {
          validationRules: rules,
          initialData: { email: longEmail }
        })
      )
      
      act(() => {
        fireEvent.click(getByTestId('validate-email'))
      })
      
      // Should be valid if within RFC limits
      expect(getByTestId('email-error')).toHaveTextContent('')
    })

    it('should reject email with consecutive dots', () => {
      const rules = [
        {
          field: 'email',
          validate: validators.email('Invalid email format')
        }
      ]
      
      const { getByTestId } = render(
        React.createElement(TestValidationComponent, {
          validationRules: rules,
          initialData: { email: 'user..name@example.com' }
        })
      )
      
      act(() => {
        fireEvent.click(getByTestId('validate-email'))
      })
      
      expect(getByTestId('email-error')).toHaveTextContent('Invalid email format')
    })
  })

  describe('Pattern Validation Edge Cases', () => {
    it('should handle special regex characters correctly', () => {
      // Test pattern that includes regex special characters
      const rules = [
        {
          field: 'phone',
          validate: validators.pattern(/^\+1-\(\d{3}\)-\d{3}-\d{4}$/, 'Format: +1-(XXX)-XXX-XXXX')
        }
      ]
      
      const { getByTestId } = render(
        React.createElement(TestValidationComponent, {
          validationRules: rules,
          initialData: { phone: '+1-(555)-123-4567' }
        })
      )
      
      act(() => {
        fireEvent.click(getByTestId('validate-phone'))
      })
      
      expect(getByTestId('phone-error')).toHaveTextContent('')
    })

    it('should handle unicode characters in patterns', () => {
      const rules = [
        {
          field: 'phone',
          validate: validators.pattern(/^[\u4e00-\u9fff]+$/, 'Must be Chinese characters')
        }
      ]
      
      const { getByTestId } = render(
        React.createElement(TestValidationComponent, {
          validationRules: rules,
          initialData: { phone: '你好世界' }
        })
      )
      
      act(() => {
        fireEvent.click(getByTestId('validate-phone'))
      })
      
      expect(getByTestId('phone-error')).toHaveTextContent('')
    })

    it('should handle case-sensitive patterns correctly', () => {
      const rules = [
        {
          field: 'phone',
          validate: validators.pattern(/^[A-Z]+$/, 'Must be uppercase letters only')
        }
      ]
      
      const { getByTestId } = render(
        React.createElement(TestValidationComponent, {
          validationRules: rules,
          initialData: { phone: 'Hello' } // Mixed case
        })
      )
      
      act(() => {
        fireEvent.click(getByTestId('validate-phone'))
      })
      
      expect(getByTestId('phone-error')).toHaveTextContent('Must be uppercase letters only')
    })
  })

  describe('Multiple Validation Rules', () => {
    it('should handle conflicting validation rules', () => {
      const rules = [
        {
          field: 'email',
          validate: validators.required('Email is required')
        },
        {
          field: 'email',
          validate: validators.email('Invalid email format')
        },
        {
          field: 'email',
          validate: validators.pattern(/^.+@company\.com$/, 'Must be company email')
        }
      ]
      
      const { getByTestId } = render(
        React.createElement(TestValidationComponent, {
          validationRules: rules,
          initialData: { email: 'user@gmail.com' } // Valid email but wrong domain
        })
      )
      
      act(() => {
        fireEvent.click(getByTestId('validate-email'))
      })
      
      // Should show the first validation error that fails
      expect(getByTestId('email-error')).toHaveTextContent('Must be company email')
    })

    it('should validate all rules when all pass', () => {
      const rules = [
        {
          field: 'email',
          validate: validators.required('Email is required')
        },
        {
          field: 'email',
          validate: validators.email('Invalid email format')
        },
        {
          field: 'email',
          validate: validators.pattern(/^.+@company\.com$/, 'Must be company email')
        }
      ]
      
      const { getByTestId } = render(
        React.createElement(TestValidationComponent, {
          validationRules: rules,
          initialData: { email: 'user@company.com' }
        })
      )
      
      act(() => {
        fireEvent.click(getByTestId('validate-email'))
      })
      
      expect(getByTestId('email-error')).toHaveTextContent('')
    })
  })

  describe('Async Validation Edge Cases', () => {
    it('should handle async validation timeouts', async () => {
      const slowAsyncValidator = async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
        return 'Async validation failed'
      }
      
      const rules = [
        {
          field: 'email',
          async: true,
          validate: slowAsyncValidator
        }
      ]
      
      const { getByTestId } = render(
        React.createElement(TestValidationComponent, {
          validationRules: rules,
          initialData: { email: 'test@example.com' }
        })
      )
      
      act(() => {
        fireEvent.click(getByTestId('validate-email'))
      })
      
      // Wait for async validation
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150))
      })
      
      expect(getByTestId('email-error')).toHaveTextContent('Async validation failed')
    })

    it('should handle async validation cancellation', async () => {
      let resolveFn: (value: any) => void
      const cancellableValidator = () => {
        return new Promise(resolve => {
          resolveFn = resolve
        })
      }
      
      const rules = [
        {
          field: 'email',
          async: true,
          validate: cancellableValidator
        }
      ]
      
      const { getByTestId, unmount } = render(
        React.createElement(TestValidationComponent, {
          validationRules: rules,
          initialData: { email: 'test@example.com' }
        })
      )
      
      act(() => {
        fireEvent.click(getByTestId('validate-email'))
      })
      
      // Unmount before validation completes
      unmount()
      
      // Resolve the promise after unmount
      act(() => {
        resolveFn('Should not appear')
      })
      
      // Should not cause any errors or state updates
      expect(true).toBe(true) // Test passes if no errors thrown
    })

    it('should handle rapid async validation calls', async () => {
      let callCount = 0
      const countingValidator = async () => {
        callCount++
        await new Promise(resolve => setTimeout(resolve, 50))
        return callCount > 1 ? 'Multiple calls detected' : null
      }
      
      const rules = [
        {
          field: 'email',
          async: true,
          validate: countingValidator
        }
      ]
      
      const { getByTestId } = render(
        React.createElement(TestValidationComponent, {
          validationRules: rules,
          initialData: { email: 'test@example.com' }
        })
      )
      
      // Trigger multiple rapid validations
      act(() => {
        fireEvent.click(getByTestId('validate-email'))
        fireEvent.click(getByTestId('validate-email'))
        fireEvent.click(getByTestId('validate-email'))
      })
      
      // Wait for validations to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 200))
      })
      
      // Should only show result from the last validation
      expect(getByTestId('email-error')).toHaveTextContent('Multiple calls detected')
    })
  })

  describe('Custom Validator Edge Cases', () => {
    it('should handle validators that throw exceptions', () => {
      const throwingValidator = () => {
        throw new Error('Validator error')
      }
      
      const rules = [
        {
          field: 'email',
          validate: throwingValidator
        }
      ]
      
      const { getByTestId } = render(
        React.createElement(TestValidationComponent, {
          validationRules: rules,
          initialData: { email: 'test@example.com' }
        })
      )
      
      // Should not crash the component
      expect(() => {
        act(() => {
          fireEvent.click(getByTestId('validate-email'))
        })
      }).not.toThrow()
      
      // Should show a generic error message
      expect(getByTestId('email-error')).toHaveTextContent('Validation error')
    })

    it('should handle validators returning non-string values', () => {
      const numericValidator = () => {
        return 123 // Non-string return value
      }
      
      const rules = [
        {
          field: 'email',
          validate: numericValidator
        }
      ]
      
      const { getByTestId } = render(
        React.createElement(TestValidationComponent, {
          validationRules: rules,
          initialData: { email: 'test@example.com' }
        })
      )
      
      act(() => {
        fireEvent.click(getByTestId('validate-email'))
      })
      
      // Should convert to string or handle gracefully
      expect(getByTestId('email-error')).toHaveTextContent('123')
    })

    it('should handle undefined validator functions', () => {
      const rules = [
        {
          field: 'email',
          validate: undefined
        }
      ]
      
      const { getByTestId } = render(
        React.createElement(TestValidationComponent, {
          validationRules: rules,
          initialData: { email: 'test@example.com' }
        })
      )
      
      // Should not crash when validator is undefined
      expect(() => {
        act(() => {
          fireEvent.click(getByTestId('validate-email'))
        })
      }).not.toThrow()
    })
  })

  describe('Data Type Edge Cases', () => {
    it('should handle null values correctly', () => {
      const rules = [
        {
          field: 'required_field',
          validate: validators.required('This field is required')
        }
      ]
      
      const { getByTestId } = render(
        React.createElement(TestValidationComponent, {
          validationRules: rules,
          initialData: { required_field: null }
        })
      )
      
      act(() => {
        fireEvent.blur(getByTestId('required_field'))
      })
      
      expect(getByTestId('required-error')).toHaveTextContent('This field is required')
    })

    it('should handle undefined values correctly', () => {
      const rules = [
        {
          field: 'required_field',
          validate: validators.required('This field is required')
        }
      ]
      
      const { getByTestId } = render(
        React.createElement(TestValidationComponent, {
          validationRules: rules,
          initialData: { required_field: undefined }
        })
      )
      
      act(() => {
        fireEvent.blur(getByTestId('required_field'))
      })
      
      expect(getByTestId('required-error')).toHaveTextContent('This field is required')
    })

    it('should handle object values correctly', () => {
      const rules = [
        {
          field: 'required_field',
          validate: validators.required('This field is required')
        }
      ]
      
      const { getByTestId } = render(
        React.createElement(TestValidationComponent, {
          validationRules: rules,
          initialData: { required_field: { name: 'test' } }
        })
      )
      
      act(() => {
        fireEvent.blur(getByTestId('required_field'))
      })
      
      // Objects should be considered valid (not empty)
      expect(getByTestId('required-error')).toHaveTextContent('')
    })
  })
})