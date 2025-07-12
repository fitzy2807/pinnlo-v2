import React, { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { 
  Settings, 
  Database, 
  Code, 
  Shield, 
  Activity, 
  Link, 
  AlertTriangle,
  Copy,
  Sparkles
} from 'lucide-react'

interface TechStackCard {
  id: string
  strategy_id: string
  user_id: string
  
  // Technology Identity
  technology_name: string
  category: string
  subcategory?: string
  version_current?: string
  vendor?: string
  license_type?: string
  language_ecosystem?: string
  
  // Technical Capabilities
  primary_functions: string[]
  technical_specifications: {
    performance_characteristics?: string
    scalability_limits?: string
    resource_requirements?: string
    security_features?: string[]
  }
  
  // Company Implementation
  our_implementation: {
    version_used?: string
    key_features_enabled?: string[]
    custom_configurations?: string[]
    performance_optimizations?: string[]
  }
  
  // Integration
  integration_capabilities: {
    apis_supported?: string[]
    data_formats?: string[]
    authentication_methods?: string[]
    communication_patterns?: string[]
  }
  
  our_integrations: {
    connects_to?: string[]
    data_flow_patterns?: string[]
    authentication_implementation?: string
    error_handling_strategy?: string
  }
  
  // Development
  development_patterns: {
    build_tools?: string[]
    testing_frameworks?: string[]
    deployment_targets?: string[]
  }
  
  our_workflow: {
    build_process?: string
    testing_approach?: string
    deployment_method?: string
    environment_config?: string
    ci_cd_integration?: string
  }
  
  // Dependencies
  dependencies: {
    runtime_dependencies?: string[]
    development_dependencies?: string[]
    peer_dependencies?: string[]
  }
  
  ecosystem_compatibility: {
    works_with?: string[]
    common_libraries?: string[]
  }
  
  our_dependencies: {
    ui_library?: string
    state_management?: string
    routing?: string
    http_client?: string
    form_handling?: string
  }
  
  // Standards
  recommended_patterns: {
    component_structure?: string
    state_management?: string
    error_handling?: string
    performance?: string
  }
  
  our_standards: {
    code_structure?: string
    naming_conventions?: string
    state_patterns?: string
    testing_requirements?: string
    documentation?: string
  }
  
  // Performance
  performance_features: {
    optimization_techniques?: string[]
    monitoring_options?: string[]
    caching_strategies?: string[]
  }
  
  our_performance: {
    target_metrics?: Record<string, string>
    monitoring_tools?: string
    performance_budget?: string
  }
  
  // Security
  security_capabilities: {
    built_in_protections?: string[]
    secure_coding_practices?: string[]
    vulnerability_scanning?: string
  }
  
  our_security: {
    authentication_flow?: string
    data_protection?: string
    compliance_measures?: string
    security_tools?: string
  }
  
  // Support
  common_issues: {
    typical_problems?: string[]
    debugging_tools?: string[]
    community_resources?: string[]
  }
  
  our_support: {
    internal_expertise?: string[]
    escalation_path?: string
    documentation_location?: string
    known_issues?: string
  }
  
  // TRD Context
  implementation_guidance: {
    typical_tasks?: string[]
    code_patterns?: Record<string, string>
    quality_requirements?: Record<string, string>
    deployment_considerations?: Record<string, string>
  }
  
  // Universal fields
  title: string
  description: string
  priority: 'High' | 'Medium' | 'Low'
  confidence_level: 'High' | 'Medium' | 'Low'
  priority_rationale?: string
  confidence_rationale?: string
  strategic_alignment?: string
  tags: string[]
  relationships: string[]
  
  // AI metadata
  ai_generated: boolean
  ai_generation_context?: Record<string, any>
  generation_quality_score?: number
  
  // Timestamps
  created_at: string
  updated_at: string
  created_by: string
}

interface TechStackCardComponentProps {
  card: TechStackCard
  onUpdate: (cardId: string, updates: Partial<TechStackCard>) => void
  onDelete: (cardId: string) => void
  isEditing?: boolean
  onEdit?: (cardId: string) => void
  onCancelEdit?: () => void
}

const CATEGORIES = ['Frontend', 'Backend', 'Database', 'Infrastructure', 'DevOps', 'Analytics', 'Security', 'Integration', 'Mobile']
const PRIORITIES = ['High', 'Medium', 'Low']

export function TechStackCardComponent({ 
  card, 
  onUpdate, 
  onDelete, 
  isEditing = false, 
  onEdit, 
  onCancelEdit 
}: TechStackCardComponentProps) {
  const [editedCard, setEditedCard] = useState<TechStackCard>(card)

  useEffect(() => {
    setEditedCard(card)
  }, [card])

  const generateStreamlinedSummary = () => {
    const summary = {
      technology_identity: {
        name: editedCard.technology_name,
        category: editedCard.category,
        subcategory: editedCard.subcategory,
        version: editedCard.version_current,
        ecosystem: editedCard.language_ecosystem
      },
      technical_implementation: {
        capabilities: editedCard.primary_functions,
        our_setup: editedCard.our_implementation
      },
      integration_context: {
        connects_to: editedCard.our_integrations.connects_to,
        data_patterns: editedCard.our_integrations.data_flow_patterns,
        auth_method: editedCard.our_integrations.authentication_implementation
      },
      development_standards: {
        structure: editedCard.our_standards.code_structure,
        testing: editedCard.our_standards.testing_requirements,
        performance: editedCard.our_performance.target_metrics
      },
      trd_generation_context: editedCard.implementation_guidance
    }
    
    return JSON.stringify(summary, null, 2)
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      'Frontend': <Code className="h-4 w-4" />,
      'Backend': <Database className="h-4 w-4" />,
      'Database': <Database className="h-4 w-4" />,
      'Infrastructure': <Settings className="h-4 w-4" />,
      'DevOps': <Activity className="h-4 w-4" />,
      'Analytics': <Activity className="h-4 w-4" />,
      'Security': <Shield className="h-4 w-4" />,
      'Integration': <Link className="h-4 w-4" />,
      'Mobile': <Code className="h-4 w-4" />
    }
    return icons[category] || <Settings className="h-4 w-4" />
  }

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {getCategoryIcon(card.category)}
            <div>
              <h3 className="text-lg font-semibold">{card.technology_name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">{card.category}</Badge>
                {card.subcategory && <Badge variant="secondary">{card.subcategory}</Badge>}
                {card.version_current && <Badge variant="outline">v{card.version_current}</Badge>}
                {card.ai_generated && <Badge variant="outline" className="text-purple-600"><Sparkles className="h-3 w-3 mr-1" />AI</Badge>}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(card.id)}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(generateStreamlinedSummary())
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="implementation">Implementation</TabsTrigger>
            <TabsTrigger value="integration">Integration</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Primary Functions</h4>
              <div className="flex flex-wrap gap-1">
                {card.primary_functions?.map((func, index) => (
                  <Badge key={index} variant="secondary">{func}</Badge>
                ))}
              </div>
            </div>
            
            {card.technical_specifications?.performance_characteristics && (
              <div>
                <h4 className="font-medium mb-2">Performance Characteristics</h4>
                <p className="text-sm text-gray-600">{card.technical_specifications.performance_characteristics}</p>
              </div>
            )}
            
            <div>
              <h4 className="font-medium mb-2">Our Implementation</h4>
              {card.our_implementation?.version_used && (
                <p className="text-sm"><strong>Version:</strong> {card.our_implementation.version_used}</p>
              )}
              {card.our_implementation?.key_features_enabled?.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Features Enabled:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {card.our_implementation.key_features_enabled.map((feature, index) => (
                      <Badge key={index} variant="outline">{feature}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="implementation" className="space-y-4">
            {card.our_workflow?.build_process && (
              <div>
                <h4 className="font-medium mb-2">Build Process</h4>
                <p className="text-sm text-gray-600">{card.our_workflow.build_process}</p>
              </div>
            )}
            
            {card.our_standards?.code_structure && (
              <div>
                <h4 className="font-medium mb-2">Code Structure</h4>
                <p className="text-sm text-gray-600">{card.our_standards.code_structure}</p>
              </div>
            )}
            
            {card.our_standards?.testing_requirements && (
              <div>
                <h4 className="font-medium mb-2">Testing Requirements</h4>
                <p className="text-sm text-gray-600">{card.our_standards.testing_requirements}</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="integration" className="space-y-4">
            {card.our_integrations?.connects_to?.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Connects To</h4>
                <div className="flex flex-wrap gap-1">
                  {card.our_integrations.connects_to.map((connection, index) => (
                    <Badge key={index} variant="outline">{connection}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            {card.our_integrations?.authentication_implementation && (
              <div>
                <h4 className="font-medium mb-2">Authentication</h4>
                <p className="text-sm text-gray-600">{card.our_integrations.authentication_implementation}</p>
              </div>
            )}
            
            {card.integration_capabilities?.apis_supported?.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Supported APIs</h4>
                <div className="flex flex-wrap gap-1">
                  {card.integration_capabilities.apis_supported.map((api, index) => (
                    <Badge key={index} variant="secondary">{api}</Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="performance" className="space-y-4">
            {card.our_performance?.target_metrics && Object.keys(card.our_performance.target_metrics).length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Target Metrics</h4>
                <div className="space-y-1">
                  {Object.entries(card.our_performance.target_metrics).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="font-medium">{key}:</span>
                      <span className="text-gray-600">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {card.performance_features?.optimization_techniques?.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Optimization Techniques</h4>
                <div className="flex flex-wrap gap-1">
                  {card.performance_features.optimization_techniques.map((technique, index) => (
                    <Badge key={index} variant="outline">{technique}</Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="support" className="space-y-4">
            {card.our_support?.internal_expertise?.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Internal Expertise</h4>
                <div className="flex flex-wrap gap-1">
                  {card.our_support.internal_expertise.map((expert, index) => (
                    <Badge key={index} variant="outline">{expert}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            {card.our_support?.documentation_location && (
              <div>
                <h4 className="font-medium mb-2">Documentation Location</h4>
                <p className="text-sm text-gray-600">{card.our_support.documentation_location}</p>
              </div>
            )}
            
            {card.common_issues?.typical_problems?.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Common Issues</h4>
                <div className="space-y-1">
                  {card.common_issues.typical_problems.map((problem, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{problem}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <Separator className="my-4" />
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span>Priority: <Badge variant={card.priority === 'High' ? 'destructive' : card.priority === 'Medium' ? 'default' : 'secondary'}>{card.priority}</Badge></span>
            <span>Confidence: <Badge variant="outline">{card.confidence_level}</Badge></span>
          </div>
          {card.ai_generated && (
            <div className="flex items-center gap-1 text-purple-600">
              <Sparkles className="h-3 w-3" />
              <span className="text-xs">AI Generated</span>
              {card.generation_quality_score && (
                <Badge variant="outline" className="text-xs">{card.generation_quality_score}/10</Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TechStackCardComponent