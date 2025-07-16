// Blueprint Configuration Types
export interface BlueprintField {
  id: string
  name: string
  type: 'text' | 'textarea' | 'number' | 'enum' | 'boolean' | 'array' | 'object' | 'date'
  required?: boolean
  placeholder?: string
  description?: string
  options?: string[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    custom?: (value: any) => boolean | string
  }
}

export interface BlueprintConfig {
  id: string
  name: string
  description: string
  category: 'Core Strategy' | 'Research & Analysis' | 'Planning & Execution' | 'Management' | 'Measurement' | 'User Experience' | 'Organizational & Technical' | 'Template' | 'Organisation'
  icon: string
  fields: BlueprintField[]
  defaultValues: Record<string, any>
  validation: {
    required: string[]
    dependencies?: Record<string, string[]>
  }
  relationships?: {
    linkedBlueprints?: string[]
    requiredBlueprints?: string[]
  }
}

export interface BlueprintData extends Record<string, any> {
  // Universal fields are handled by the MasterCard
  // Blueprint-specific fields are defined by each config
}