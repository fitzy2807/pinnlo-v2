import { useState, useCallback, useMemo, useRef, useEffect } from 'react'

type SyncValidator<T> = (value: any, data: T) => string | null
type AsyncValidator<T> = (value: any, data: T) => Promise<string | null>

type ValidationRule<T> = {
  field: keyof T
  validate: SyncValidator<T> | AsyncValidator<T>
  message?: string
  async?: boolean
  debounceMs?: number
}

type ValidationErrors<T> = Partial<Record<keyof T, string>>
type ValidationLoading<T> = Partial<Record<keyof T, boolean>>

interface UseValidationOptions<T> {
  rules: ValidationRule<T>[]
  validateOnChange?: boolean
  validateOnBlur?: boolean
}

export function useValidation<T extends Record<string, any>>(
  data: T,
  options: UseValidationOptions<T>
) {
  const { rules, validateOnChange = true, validateOnBlur = false } = options
  const [errors, setErrors] = useState<ValidationErrors<T>>({})
  const [touchedFields, setTouchedFields] = useState<Set<keyof T>>(new Set())
  const [loadingFields, setLoadingFields] = useState<ValidationLoading<T>>({})
  const validationTimeoutsRef = useRef<Record<keyof T, NodeJS.Timeout>>({})

  // Update errors for a specific field
  const setFieldError = useCallback((field: keyof T, error: string | null) => {
    setErrors(prev => {
      if (error) {
        return { ...prev, [field]: error }
      } else {
        const { [field]: _, ...rest } = prev
        return rest
      }
    })
  }, [])

  // Validate a single field (with async support and error handling)
  const validateField = useCallback(async (field: keyof T, value: any): Promise<string | null> => {
    const fieldRules = rules.filter(rule => rule.field === field)
    
    // Clear any existing timeout for this field
    if (validationTimeoutsRef.current[field]) {
      clearTimeout(validationTimeoutsRef.current[field])
    }
    
    let validationError: string | null = null
    
    // Process sync rules first
    for (const rule of fieldRules.filter(r => !r.async)) {
      try {
        if (typeof rule.validate === 'function') {
          const error = rule.validate(value, data) as string | null
          if (error) {
            validationError = rule.message || String(error)
            break
          }
        }
      } catch (e) {
        console.warn(`Validation error for field ${String(field)}:`, e)
        validationError = 'Validation error'
        break
      }
    }
    
    // Process async rules if no sync errors
    if (!validationError) {
      const asyncRules = fieldRules.filter(r => r.async)
      if (asyncRules.length > 0) {
        setLoadingFields(prev => ({ ...prev, [field]: true }))
        
        try {
          for (const rule of asyncRules) {
            try {
              // Apply debouncing if specified
              if (rule.debounceMs) {
                await new Promise(resolve => {
                  validationTimeoutsRef.current[field] = setTimeout(resolve, rule.debounceMs)
                })
              }
              
              if (typeof rule.validate === 'function') {
                const error = await (rule.validate as AsyncValidator<T>)(value, data)
                if (error) {
                  validationError = rule.message || String(error)
                  break
                }
              }
            } catch (e) {
              console.warn(`Async validation error for field ${String(field)}:`, e)
              validationError = 'Validation error'
              break
            }
          }
        } finally {
          setLoadingFields(prev => ({ ...prev, [field]: false }))
        }
      }
    }
    
    // Update the error state
    setFieldError(field, validationError)
    
    return validationError
  }, [rules, data, setFieldError])

  // Validate all fields
  const validateAll = useCallback(async (): Promise<ValidationErrors<T>> => {
    const newErrors: ValidationErrors<T> = {}
    
    // Set all fields as loading if they have async rules
    const fieldsWithAsyncRules = rules
      .filter(rule => rule.async)
      .map(rule => rule.field)
    
    if (fieldsWithAsyncRules.length > 0) {
      const loadingState: ValidationLoading<T> = {}
      fieldsWithAsyncRules.forEach(field => {
        loadingState[field] = true
      })
      setLoadingFields(loadingState)
    }
    
    try {
      // Validate all fields in parallel
      const validationPromises = Array.from(new Set(rules.map(r => r.field))).map(async field => {
        const value = data[field]
        const error = await validateField(field, value)
        if (error) {
          newErrors[field] = error
        }
      })
      
      await Promise.all(validationPromises)
    } finally {
      setLoadingFields({})
    }
    
    return newErrors
  }, [rules, data, validateField])

  // Mark field as touched
  const touchField = useCallback((field: keyof T) => {
    setTouchedFields(prev => new Set(prev).add(field))
  }, [])

  // Reset validation state
  const resetValidation = useCallback(() => {
    setErrors({})
    setTouchedFields(new Set())
  }, [])

  // Check if form is valid
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0
  }, [errors])

  // Get error for a specific field (only if touched)
  const getFieldError = useCallback((field: keyof T): string | undefined => {
    if (touchedFields.has(field)) {
      return errors[field]
    }
    return undefined
  }, [errors, touchedFields])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(validationTimeoutsRef.current).forEach(timeout => {
        clearTimeout(timeout as NodeJS.Timeout)
      })
    }
  }, [])

  return {
    errors,
    isValid,
    validateField,
    validateAll,
    setFieldError,
    touchField,
    resetValidation,
    getFieldError,
    touchedFields,
    loadingFields,
    isValidating: Object.keys(loadingFields).length > 0
  }
}

// Common validation rules
export const validators = {
  required: (message = 'This field is required') => 
    (value: any) => {
      // Handle different types of "empty" values correctly
      if (value === null || value === undefined) return message
      if (typeof value === 'string' && !value.trim()) return message
      if (Array.isArray(value) && value.length === 0) return message
      // 0 and false are considered valid values
      return null
    },
  
  minLength: (min: number, message?: string) => 
    (value: string) => value && value.length < min 
      ? message || `Must be at least ${min} characters` 
      : null,
  
  maxLength: (max: number, message?: string) => 
    (value: string) => value && value.length > max 
      ? message || `Must be no more than ${max} characters` 
      : null,
  
  pattern: (regex: RegExp, message = 'Invalid format') => 
    (value: string) => value && !regex.test(value) ? message : null,
  
  email: (message = 'Invalid email address') => 
    (value: string) => value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? message : null,
  
  url: (message = 'Invalid URL') => 
    (value: string) => {
      if (!value) return null
      try {
        new URL(value)
        return null
      } catch {
        return message
      }
    },
  
  numeric: (message = 'Must be a number') => 
    (value: any) => value && isNaN(Number(value)) ? message : null,
  
  min: (min: number, message?: string) => 
    (value: number) => value < min ? message || `Must be at least ${min}` : null,
  
  max: (max: number, message?: string) => 
    (value: number) => value > max ? message || `Must be no more than ${max}` : null,
  
  // Async validators
  unique: (checkFn: (value: string) => Promise<boolean>, message = 'This value is already taken') => 
    async (value: string) => {
      if (!value) return null
      const isUnique = await checkFn(value)
      return isUnique ? null : message
    },
  
  asyncPattern: (checkFn: (value: string) => Promise<boolean>, message = 'Invalid format') =>
    async (value: string) => {
      if (!value) return null
      const isValid = await checkFn(value)
      return isValid ? null : message
    }
}