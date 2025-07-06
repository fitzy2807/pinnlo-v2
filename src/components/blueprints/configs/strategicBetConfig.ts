import { BlueprintConfig } from '../types'

export const strategicBetConfig: BlueprintConfig = {
  id: 'strategic-bet',
  name: 'Strategic Bet',
  description: 'Document and track high-level strategic decisions and investments',
  category: 'Core Strategy',
  icon: '🎲',
  fields: [
    {
      id: 'betType',
      name: 'Bet Type',
      type: 'enum',
      required: true,
      options: ['Market Bet', 'Technology Bet', 'Product Bet', 'Business Model Bet', 'Capability Bet', 'Partnership Bet'],
      description: 'What type of strategic bet is this?'
    },
    {
      id: 'betStatement',
      name: 'Bet Statement',
      type: 'textarea',
      required: true,
      placeholder: 'We are betting that...',
      description: 'Clear statement of what we are betting on'
    },
    {
      id: 'rationale',
      name: 'Strategic Rationale',
      type: 'textarea',
      required: true,
      placeholder: 'Why are we making this bet?',
      description: 'Strategic reasoning behind this bet'
    },
    {
      id: 'riskLevel',
      name: 'Risk Level',
      type: 'enum',
      required: true,
      options: ['Low', 'Medium', 'High', 'Very High'],
      description: 'Overall risk level of this strategic bet'
    },
    {
      id: 'investmentRequired',
      name: 'Investment Required',
      type: 'text',
      required: true,
      placeholder: 'Financial and resource investment needed',
      description: 'Total investment required for this bet'
    },
    {
      id: 'expectedReturn',
      name: 'Expected Return',
      type: 'textarea',
      required: true,
      placeholder: 'What do we expect to gain from this bet?',
      description: 'Expected outcomes and returns from this strategic bet'
    },
    {
      id: 'evidenceSupporting',
      name: 'Supporting Evidence',
      type: 'array',
      required: true,
      description: 'Evidence and research that supports making this bet'
    },
    {
      id: 'evidenceAgainst',
      name: 'Contradicting Evidence',
      type: 'array',
      required: false,
      description: 'Evidence or factors that argue against this bet'
    },
    {
      id: 'keyAssumptions',
      name: 'Key Assumptions',
      type: 'array',
      required: true,
      description: 'Critical assumptions underlying this strategic bet'
    },
    {
      id: 'timeframeToValidate',
      name: 'Validation Timeframe',
      type: 'text',
      required: true,
      placeholder: 'How long to know if this bet is paying off?',
      description: 'Timeline for evaluating whether this bet is successful'
    },
    {
      id: 'successMetrics',
      name: 'Success Metrics',
      type: 'array',
      required: true,
      description: 'How will we measure if this bet is successful?'
    },
    {
      id: 'exitCriteria',
      name: 'Exit Criteria',
      type: 'array',
      required: false,
      description: 'Conditions under which we would abandon this bet'
    },
    {
      id: 'alternativeOptions',
      name: 'Alternative Options',
      type: 'array',
      required: false,
      description: 'Other strategic options we considered instead'
    },
    {
      id: 'stakeholderAlignment',
      name: 'Stakeholder Alignment',
      type: 'text',
      required: false,
      placeholder: 'Level of stakeholder support',
      description: 'How aligned are key stakeholders with this bet?'
    },
    {
      id: 'currentStatus',
      name: 'Current Status',
      type: 'enum',
      required: false,
      options: ['Proposed', 'Approved', 'In Progress', 'Under Review', 'Successful', 'Failed', 'Cancelled'],
      description: 'Current status of this strategic bet'
    }
  ],
  defaultValues: {
    betType: 'Market Bet',
    betStatement: '',
    rationale: '',
    riskLevel: 'Medium',
    investmentRequired: '',
    expectedReturn: '',
    evidenceSupporting: [],
    evidenceAgainst: [],
    keyAssumptions: [],
    timeframeToValidate: '',
    successMetrics: [],
    exitCriteria: [],
    alternativeOptions: [],
    stakeholderAlignment: '',
    currentStatus: 'Proposed'
  },
  validation: {
    required: ['betType', 'betStatement', 'rationale', 'riskLevel', 'investmentRequired', 'expectedReturn', 'evidenceSupporting', 'keyAssumptions', 'timeframeToValidate', 'successMetrics']
  },
  relationships: {
    linkedBlueprints: ['strategic-context', 'okrs', 'market-insight', 'experiment'],
    requiredBlueprints: ['strategic-context']
  }
}