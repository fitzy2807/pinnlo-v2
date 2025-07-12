import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

// Type definition matching database schema
interface TechStackComponent {
  // Primary keys
  id: string
  tech_stack_id: string
  user_id: string
  
  // Core fields
  technology_name: string
  category: string
  subcategory?: string
  version_current?: string
  vendor?: string
  license_type?: string
  language_ecosystem?: string
  implementation_status: string
  
  // Universal card fields (required by MasterCard)
  title: string
  description: string
  priority: 'High' | 'Medium' | 'Low'
  confidence_level: 'High' | 'Medium' | 'Low'
  priority_rationale?: string
  confidence_rationale?: string
  strategic_alignment?: string
  tags: string[]
  relationships: any[]
  
  // JSONB fields
  primary_functions: string[]
  technical_specifications: any
  our_implementation: any
  integration_capabilities: any
  our_integrations: any
  development_patterns: any
  our_workflow: any
  dependencies: any
  ecosystem_compatibility: any
  our_dependencies: any
  recommended_patterns: any
  our_standards: any
  performance_features: any
  our_performance: any
  security_capabilities: any
  our_security: any
  common_issues: any
  our_support: any
  implementation_guidance: any
  
  // Metadata
  ai_generated: boolean
  ai_generation_context?: any
  generation_quality_score?: number
  created_at: string
  updated_at: string
  created_by?: string
}

interface TechStack {
  id: string
  strategy_id: number
  stack_name: string
  stack_type: string
  created_by: string
  layers: any
  metadata: any
  created_at: string
  updated_at: string
}

export function useTechStackComponents(strategyId: number) {
  const [techStack, setTechStack] = useState<TechStack | null>(null)
  const [components, setComponents] = useState<TechStackComponent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Load or create tech stack
  const loadTechStack = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Try to get existing tech stack
      const { data: existingStack, error: fetchError } = await supabase
        .from('tech_stacks')
        .select('*')
        .eq('strategy_id', strategyId)
        .single()

      if (existingStack && !fetchError) {
        setTechStack(existingStack)
        return existingStack
      }

      // If not found, create new tech stack
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')

      const { data: newStack, error: createError } = await supabase
        .from('tech_stacks')
        .insert({
          strategy_id: strategyId,
          stack_name: 'Primary Tech Stack',
          stack_type: 'primary',
          created_by: user.id,
          layers: {},
          metadata: {}
        })
        .select()
        .single()

      if (createError) throw createError
      setTechStack(newStack)
      return newStack
    } catch (err) {
      console.error('Failed to load/create tech stack:', err)
      setError(err instanceof Error ? err.message : 'Failed to load tech stack')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [strategyId])

  // Load components
  const loadComponents = useCallback(async (techStackId: string) => {
    try {
      const { data, error } = await supabase
        .from('tech_stack_components')
        .select('*')
        .eq('tech_stack_id', techStackId)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Map components to ensure MasterCard compatibility
      const mappedComponents = (data || []).map(component => ({
        ...component,
        // Ensure universal card fields exist
        title: component.title || component.technology_name,
        description: component.description || `${component.category} technology`,
        tags: Array.isArray(component.tags) ? component.tags : [],
        relationships: Array.isArray(component.relationships) ? component.relationships : [],
        // Ensure JSONB fields are arrays/objects
        primary_functions: Array.isArray(component.primary_functions) ? component.primary_functions : [],
        our_implementation: component.our_implementation || {},
        our_integrations: component.our_integrations || {},
        our_workflow: component.our_workflow || {},
        our_support: component.our_support || {},
        common_issues: component.common_issues || {},
        // Ensure nested array fields from blueprint config
        'our_implementation.key_features_enabled': Array.isArray(component.our_implementation?.key_features_enabled) 
          ? component.our_implementation.key_features_enabled 
          : [],
        'our_integrations.connects_to': Array.isArray(component.our_integrations?.connects_to) 
          ? component.our_integrations.connects_to 
          : [],
        'our_integrations.data_flow_patterns': Array.isArray(component.our_integrations?.data_flow_patterns) 
          ? component.our_integrations.data_flow_patterns 
          : [],
        'our_support.internal_expertise': Array.isArray(component.our_support?.internal_expertise) 
          ? component.our_support.internal_expertise 
          : [],
        'common_issues.typical_problems': Array.isArray(component.common_issues?.typical_problems) 
          ? component.common_issues.typical_problems 
          : []
      }))

      setComponents(mappedComponents)
    } catch (err) {
      console.error('Failed to load components:', err)
      setError(err instanceof Error ? err.message : 'Failed to load components')
    }
  }, [])

  // Initial load
  useEffect(() => {
    if (!strategyId) return

    const initialize = async () => {
      const stack = await loadTechStack()
      if (stack?.id) {
        await loadComponents(stack.id)
      }
    }

    initialize()
  }, [strategyId, loadTechStack, loadComponents])

  // Create component
  const createComponent = useCallback(async (componentData: Partial<TechStackComponent>) => {
    if (!techStack?.id) {
      setError('No tech stack found')
      return null
    }

    try {
      setIsCreating(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')

      // Prepare component data with all required fields
      const newComponent = {
        // Required fields
        tech_stack_id: techStack.id,
        user_id: user.id,
        created_by: user.id,
        technology_name: componentData.technology_name || componentData.title || 'New Technology',
        title: componentData.title || componentData.technology_name || 'New Technology',
        category: componentData.category || 'General',

        // Default values for required fields
        priority: componentData.priority || 'Medium',
        confidence_level: componentData.confidence_level || 'Medium',
        implementation_status: componentData.implementation_status || 'planned',
        description: componentData.description || '',
        tags: componentData.tags || [],
        relationships: componentData.relationships || [],

        // Initialize all JSONB fields with empty structures
        primary_functions: componentData.primary_functions || [],
        technical_specifications: componentData.technical_specifications || {},
        our_implementation: componentData.our_implementation || {},
        integration_capabilities: componentData.integration_capabilities || {},
        our_integrations: componentData.our_integrations || {},
        development_patterns: componentData.development_patterns || {},
        our_workflow: componentData.our_workflow || {},
        dependencies: componentData.dependencies || {},
        ecosystem_compatibility: componentData.ecosystem_compatibility || {},
        our_dependencies: componentData.our_dependencies || {},
        recommended_patterns: componentData.recommended_patterns || {},
        our_standards: componentData.our_standards || {},
        performance_features: componentData.performance_features || {},
        our_performance: componentData.our_performance || {},
        security_capabilities: componentData.security_capabilities || {},
        our_security: componentData.our_security || {},
        common_issues: componentData.common_issues || {},
        our_support: componentData.our_support || {},
        implementation_guidance: componentData.implementation_guidance || {},

        // Metadata
        ai_generated: componentData.ai_generated || false,
        ai_generation_context: componentData.ai_generation_context || {},

        // Optional fields
        ...(componentData.subcategory && { subcategory: componentData.subcategory }),
        ...(componentData.version_current && { version_current: componentData.version_current }),
        ...(componentData.vendor && { vendor: componentData.vendor }),
        ...(componentData.license_type && { license_type: componentData.license_type }),
        ...(componentData.language_ecosystem && { language_ecosystem: componentData.language_ecosystem })
      }

      const { data, error } = await supabase
        .from('tech_stack_components')
        .insert(newComponent)
        .select()
        .single()

      if (error) throw error

      // Add to local state
      setComponents(prev => [data, ...prev])
      return data
    } catch (err) {
      console.error('Failed to create tech stack component:', err)
      setError(err instanceof Error ? err.message : 'Failed to create component')
      return null
    } finally {
      setIsCreating(false)
    }
  }, [techStack?.id])

  // Update component
  const updateComponent = useCallback(async (id: string, updates: Partial<TechStackComponent>) => {
    try {
      setIsUpdating(true)
      setError(null)

      // Handle title/technology_name sync
      if (updates.title && !updates.technology_name) {
        updates.technology_name = updates.title
      }
      if (updates.technology_name && !updates.title) {
        updates.title = updates.technology_name
      }

      // Handle nested JSONB updates (dot notation from form)
      const processedUpdates: any = { ...updates }

      // Process dot notation fields (e.g., 'our_implementation.version_used')
      Object.keys(updates).forEach(key => {
        if (key.includes('.')) {
          const [parent, child] = key.split('.')
          const currentComponent = components.find(c => c.id === id)
          const currentValue = currentComponent?.[parent as keyof TechStackComponent] || {}
          processedUpdates[parent] = {
            ...(typeof currentValue === 'object' ? currentValue : {}),
            [child]: (updates as any)[key]
          }
          delete processedUpdates[key]
        }
      })

      const { data, error } = await supabase
        .from('tech_stack_components')
        .update(processedUpdates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Update local state
      setComponents(prev => prev.map(c => c.id === id ? data : c))
      return data
    } catch (err) {
      console.error('Failed to update tech stack component:', err)
      setError(err instanceof Error ? err.message : 'Failed to update component')
      return null
    } finally {
      setIsUpdating(false)
    }
  }, [components])

  // Delete component
  const deleteComponent = useCallback(async (id: string) => {
    try {
      setIsDeleting(true)
      setError(null)

      const { error } = await supabase
        .from('tech_stack_components')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Remove from local state
      setComponents(prev => prev.filter(c => c.id !== id))
      return true
    } catch (err) {
      console.error('Failed to delete tech stack component:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete component')
      return false
    } finally {
      setIsDeleting(false)
    }
  }, [])

  // Duplicate component
  const duplicateComponent = useCallback(async (componentId: string) => {
    const original = components.find(c => c.id === componentId)
    if (!original) {
      setError('Component not found')
      return null
    }

    // Remove unique fields and metadata
    const {
      id,
      created_at,
      updated_at,
      ...componentData
    } = original

    // Create duplicate with modified title
    return createComponent({
      ...componentData,
      technology_name: `${componentData.technology_name} (Copy)`,
      title: `${componentData.title} (Copy)`
    })
  }, [components, createComponent])

  // Refetch function
  const refetch = useCallback(async () => {
    if (techStack?.id) {
      await loadComponents(techStack.id)
    }
  }, [techStack?.id, loadComponents])

  return {
    // Data
    components,
    techStackId: techStack?.id,

    // Loading states
    isLoading,
    error,

    // Mutations
    createComponent,
    updateComponent,
    deleteComponent,
    duplicateComponent,

    // Async versions
    createComponentAsync: createComponent,
    updateComponentAsync: updateComponent,

    // Mutation states
    isCreating,
    isUpdating,
    isDeleting,

    // Refetch function
    refetch
  }
}