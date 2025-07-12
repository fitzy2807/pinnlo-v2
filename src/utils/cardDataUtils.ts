// Utility functions for card data validation and normalization

export function ensureArrayField(value: any): string[] {
  // If it's already an array, return it
  if (Array.isArray(value)) {
    return value.filter(item => typeof item === 'string')
  }
  
  // If it's a string, split by comma or return single item array
  if (typeof value === 'string') {
    if (value.trim() === '') return []
    return value.split(',').map(item => item.trim()).filter(Boolean)
  }
  
  // If it's null, undefined, or any other type, return empty array
  return []
}

export function ensureObjectField(value: any): Record<string, any> {
  // If it's already an object (but not an array), return it
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value
  }
  
  // Otherwise return empty object
  return {}
}

export function normalizeCardData(cardData: any, blueprintConfig?: any): any {
  if (!cardData || typeof cardData !== 'object') {
    return {}
  }

  const normalized = { ...cardData }

  // If we have blueprint config, use it to normalize fields
  if (blueprintConfig?.fields) {
    blueprintConfig.fields.forEach((field: any) => {
      if (field.type === 'array') {
        normalized[field.id] = ensureArrayField(cardData[field.id])
      } else if (field.type === 'object') {
        normalized[field.id] = ensureObjectField(cardData[field.id])
      }
    })
  }

  // Common array fields that should always be arrays
  const commonArrayFields = [
    'dependencies', 
    'designRefs', 
    'tags', 
    'categories',
    'stakeholders',
    'requirements',
    'responsible',
    'accountable', 
    'consulted',
    'informed',
    'businessRequirementIds',
    'userStoryIds',
    'testScenarioIds',
    'implementationTaskIds',
    'complianceRequirements'
  ]

  commonArrayFields.forEach(fieldName => {
    if (fieldName in normalized) {
      normalized[fieldName] = ensureArrayField(normalized[fieldName])
    }
  })

  // Common object fields that should always be objects
  const commonObjectFields = [
    'userStories',
    'acceptanceCriteria',
    'metadata',
    'settings',
    'configuration'
  ]

  commonObjectFields.forEach(fieldName => {
    if (fieldName in normalized) {
      normalized[fieldName] = ensureObjectField(normalized[fieldName])
    }
  })

  return normalized
}

// Recursively normalize nested objects with array/object fields
export function deepNormalizeCardData(data: any): any {
  if (!data || typeof data !== 'object') {
    return data
  }

  if (Array.isArray(data)) {
    return data.map(item => deepNormalizeCardData(item))
  }

  const normalized: any = {}
  
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Recursively normalize nested objects
      normalized[key] = deepNormalizeCardData(value)
    } else {
      normalized[key] = value
    }
  }

  // Apply field-specific normalization
  return normalizeCardData(normalized)
}
