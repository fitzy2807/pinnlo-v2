import { BlueprintConfig } from '../types'

export const riskAssessmentConfig: BlueprintConfig = {
  id: 'risk-assessment',
  name: 'Risk Assessment',
  description: 'Identify and analyze potential risks and mitigation strategies',
  category: 'Planning & Execution',
  icon: 'AlertTriangle',
  fields: [
    {
      id: 'riskCategory',
      name: 'Risk Category',
      type: 'enum',
      required: true,
      options: ['Strategic', 'Operational', 'Financial', 'Compliance', 'Technology', 'Market', 'Competitive'],
      description: 'What category does this risk fall into?'
    },
    {
      id: 'riskDescription',
      name: 'Risk Description',
      type: 'textarea',
      required: true,
      placeholder: 'Describe the risk',
      description: 'Detailed description of the risk'
    },
    {
      id: 'probability',
      name: 'Probability',
      type: 'enum',
      required: true,
      options: ['Very Low', 'Low', 'Medium', 'High', 'Very High'],
      description: 'How likely is this risk to occur?'
    },
    {
      id: 'impact',
      name: 'Impact',
      type: 'enum',
      required: true,
      options: ['Very Low', 'Low', 'Medium', 'High', 'Very High'],
      description: 'What would be the impact if this occurs?'
    },
    {
      id: 'riskScore',
      name: 'Risk Score',
      type: 'number',
      required: false,
      description: 'Calculated risk score (probability × impact)'
    },
    {
      id: 'triggerEvents',
      name: 'Trigger Events',
      type: 'array',
      required: false,
      description: 'Events that could trigger this risk'
    },
    {
      id: 'mitigationStrategies',
      name: 'Mitigation Strategies',
      type: 'array',
      required: true,
      description: 'How can this risk be reduced or managed?'
    },
    {
      id: 'contingencyPlans',
      name: 'Contingency Plans',
      type: 'array',
      required: false,
      description: 'What to do if the risk occurs'
    },
    {
      id: 'owner',
      name: 'Risk Owner',
      type: 'text',
      required: true,
      placeholder: 'Who monitors this risk?',
      description: 'Person responsible for monitoring and managing this risk'
    },
    {
      id: 'reviewFrequency',
      name: 'Review Frequency',
      type: 'enum',
      required: false,
      options: ['Weekly', 'Monthly', 'Quarterly', 'Annually'],
      description: 'How often should this risk be reviewed?'
    }
  ],
  defaultValues: {
    riskCategory: 'Strategic',
    riskDescription: '',
    probability: 'Medium',
    impact: 'Medium',
    riskScore: 0,
    triggerEvents: [],
    mitigationStrategies: [],
    contingencyPlans: [],
    owner: '',
    reviewFrequency: 'Monthly'
  },
  validation: {
    required: ['riskCategory', 'riskDescription', 'probability', 'impact', 'mitigationStrategies', 'owner']
  }
}