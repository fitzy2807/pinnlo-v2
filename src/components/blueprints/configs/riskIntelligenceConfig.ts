import { BlueprintConfig } from '../types'

export const riskIntelligenceConfig: BlueprintConfig = {
  id: 'riskIntelligence',
  name: 'Risk Intelligence',
  description: 'Threat assessments, regulatory changes, and risk factors',
  category: 'Research & Analysis',
  icon: 'AlertTriangle',
  fields: [
    {
      id: 'intelligence_content',
      name: 'Intelligence Content',
      type: 'textarea',
      required: true,
      placeholder: 'Detailed risk analysis and threat assessment...',
      description: 'Comprehensive risk intelligence and analysis'
    },
    {
      id: 'risk_category',
      name: 'Risk Category',
      type: 'enum',
      required: false,
      options: ['Market', 'Competitive', 'Technology', 'Regulatory', 'Financial', 'Operational', 'Security', 'Reputation', 'Strategic'],
      placeholder: 'Select risk category',
      description: 'Type of risk identified'
    },
    {
      id: 'risk_level',
      name: 'Risk Level',
      type: 'enum',
      required: false,
      options: ['Critical', 'High', 'Medium', 'Low', 'Minimal'],
      placeholder: 'Select risk level',
      description: 'Severity of the identified risk'
    },
    {
      id: 'key_findings',
      name: 'Key Findings',
      type: 'array',
      required: false,
      placeholder: 'Add key risk insights...',
      description: 'Critical risk discoveries and threats'
    },
    {
      id: 'risk_indicators',
      name: 'Risk Indicators',
      type: 'array',
      required: false,
      placeholder: 'Add early warning signal...',
      description: 'Early warning signals and risk indicators'
    },
    {
      id: 'likelihood_score',
      name: 'Likelihood Score',
      type: 'number',
      required: false,
      placeholder: '1-10',
      description: 'Probability of risk materializing (1-10)',
      validation: {
        min: 1,
        max: 10
      }
    },
    {
      id: 'impact_score',
      name: 'Impact Score',
      type: 'number',
      required: false,
      placeholder: '1-10',
      description: 'Potential impact if risk materializes (1-10)',
      validation: {
        min: 1,
        max: 10
      }
    },
    {
      id: 'source_reference',
      name: 'Source Reference',
      type: 'text',
      required: false,
      placeholder: 'e.g., Security audit, Regulatory filing, Industry analysis',
      description: 'Primary source of this intelligence'
    },
    {
      id: 'date_accessed',
      name: 'Date Accessed',
      type: 'date',
      required: false,
      description: 'When this information was obtained'
    },
    {
      id: 'credibility_score',
      name: 'Credibility Score',
      type: 'number',
      required: false,
      placeholder: '1-10',
      description: 'How reliable is this source? (1-10)',
      validation: {
        min: 1,
        max: 10
      }
    },
    {
      id: 'mitigation_strategies',
      name: 'Mitigation Strategies',
      type: 'array',
      required: false,
      placeholder: 'Add mitigation approach...',
      description: 'Potential strategies to mitigate this risk'
    },
    {
      id: 'monitoring_requirements',
      name: 'Monitoring Requirements',
      type: 'textarea',
      required: false,
      placeholder: 'How should we monitor this risk?',
      description: 'Ongoing monitoring needs for this risk'
    },
    {
      id: 'strategic_implications',
      name: 'Strategic Implications',
      type: 'textarea',
      required: false,
      placeholder: 'How does this risk impact our strategy?',
      description: 'Analysis of risk implications for business strategy'
    },
    {
      id: 'recommended_actions',
      name: 'Recommended Actions',
      type: 'textarea',
      required: false,
      placeholder: 'What immediate actions should we take?',
      description: 'Urgent risk mitigation recommendations'
    },
    {
      id: 'relevant_blueprint_pages',
      name: 'Related Blueprints',
      type: 'array',
      required: false,
      placeholder: 'Link to related strategy cards...',
      description: 'Other cards this intelligence relates to'
    }
  ],
  defaultValues: {
    intelligence_content: '',
    key_findings: [],
    risk_indicators: [],
    likelihood_score: 5,
    impact_score: 5,
    credibility_score: 5,
    mitigation_strategies: [],
    relevant_blueprint_pages: []
  },
  validation: {
    required: ['intelligence_content']
  },
  relationships: {
    linkedBlueprints: ['risks', 'strategic-context', 'governance']
  }
}