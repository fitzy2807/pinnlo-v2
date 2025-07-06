// Core field types for dynamic blueprint system
export type FieldType = 
  | 'text' 
  | 'textarea' 
  | 'enum' 
  | 'boolean'
  | 'number'
  | 'date'
  | 'dateRange'
  | 'array'
  | 'objectArray'
  | 'linkedCard'
  | 'linkedCards'

export interface BaseField {
  key: string
  type: FieldType
  label: string
  description?: string
  required?: boolean
  placeholder?: string
  defaultValue?: any
  conditional?: {
    dependsOn: string
    value: any
  }
}

export interface TextField extends BaseField {
  type: 'text'
  maxLength?: number
  pattern?: string
}

export interface TextareaField extends BaseField {
  type: 'textarea'
  rows?: number
  maxLength?: number
}

export interface EnumField extends BaseField {
  type: 'enum'
  options: string[]
  multiple?: boolean
}

export interface BooleanField extends BaseField {
  type: 'boolean'
}

export interface NumberField extends BaseField {
  type: 'number'
  min?: number
  max?: number
  step?: number
}

export interface DateField extends BaseField {
  type: 'date'
}

export interface DateRangeField extends BaseField {
  type: 'dateRange'
}

export interface ArrayField extends BaseField {
  type: 'array'
  itemType: 'text' | 'textarea'
  maxItems?: number
  minItems?: number
}

export interface ObjectArrayField extends BaseField {
  type: 'objectArray'
  schema: BlueprintField[]
  maxItems?: number
  addButtonText?: string
}

export interface LinkedCardField extends BaseField {
  type: 'linkedCard'
  targetBlueprintType: string
}

export interface LinkedCardsField extends BaseField {
  type: 'linkedCards'
  targetBlueprintType: string
  maxItems?: number
}

export type BlueprintField = 
  | TextField 
  | TextareaField 
  | EnumField 
  | BooleanField
  | NumberField
  | DateField
  | DateRangeField
  | ArrayField
  | ObjectArrayField
  | LinkedCardField
  | LinkedCardsField

export interface BlueprintConfig {
  name: string
  icon: string
  description: string
  category: 'Core Strategy' | 'Research & Analysis' | 'Planning & Execution' | 'Measurement & Analytics'
  fields: BlueprintField[]
}

export interface BlueprintRegistry {
  [key: string]: BlueprintConfig
}

// Extended card data type that includes blueprint-specific fields
export interface ExtendedCardData {
  // Universal fields
  id: string
  title: string
  description: string
  cardType: string
  priority: 'High' | 'Medium' | 'Low'
  confidenceLevel: 'High' | 'Medium' | 'Low'
  priorityRationale?: string
  confidenceRationale?: string
  tags: string[]
  relationships: Array<{
    id: string
    title: string
    type: 'supports' | 'relates-to' | 'conflicts-with' | 'supported-by'
  }>
  strategicAlignment: string
  createdDate: string
  lastModified: string
  creator: string
  owner: string
  
  // Blueprint-specific fields (dynamic)
  blueprintData: Record<string, any>
}
