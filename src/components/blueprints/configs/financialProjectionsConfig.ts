import { BlueprintConfig } from '../types'

export const financialProjectionsConfig: BlueprintConfig = {
  id: 'financial-projections',
  name: 'Financial Projections',
  description: 'Create financial forecasts and projections',
  category: 'Measurement',
  icon: 'TrendingUp',
  fields: [
    {
      id: 'projectionType',
      name: 'Projection Type',
      type: 'enum',
      required: true,
      options: ['Revenue', 'P&L', 'Cash Flow', 'Budget', 'ROI Analysis'],
      description: 'What type of financial projection is this?'
    },
    {
      id: 'timeframe',
      name: 'Timeframe',
      type: 'enum',
      required: true,
      options: ['Monthly', 'Quarterly', 'Annual', '3-Year', '5-Year'],
      description: 'What period does this cover?'
    },
    {
      id: 'assumptions',
      name: 'Key Assumptions',
      type: 'array',
      required: true,
      description: 'Critical assumptions underlying these projections'
    },
    {
      id: 'revenueModel',
      name: 'Revenue Model',
      type: 'textarea',
      required: true,
      placeholder: 'How revenue is generated',
      description: 'Description of how revenue is created'
    },
    {
      id: 'revenueProjections',
      name: 'Revenue Projections',
      type: 'object',
      required: true,
      description: 'Revenue forecasts by period'
    },
    {
      id: 'costProjections',
      name: 'Cost Projections',
      type: 'object',
      required: true,
      description: 'Cost forecasts by category'
    },
    {
      id: 'profitability',
      name: 'Profitability Analysis',
      type: 'object',
      required: false,
      description: 'Break-even, margins, profitability metrics'
    },
    {
      id: 'sensitivityAnalysis',
      name: 'Sensitivity Analysis',
      type: 'textarea',
      required: false,
      placeholder: 'How sensitive are projections to key variables?',
      description: 'Analysis of how changes affect projections'
    },
    {
      id: 'scenarioPlanning',
      name: 'Scenario Planning',
      type: 'object',
      required: false,
      description: 'Best case, worst case, most likely scenarios'
    },
    {
      id: 'fundingRequirements',
      name: 'Funding Requirements',
      type: 'text',
      required: false,
      placeholder: 'Capital needed',
      description: 'Investment or funding needed'
    }
  ],
  defaultValues: {
    projectionType: 'Revenue',
    timeframe: 'Annual',
    assumptions: [],
    revenueModel: '',
    revenueProjections: {},
    costProjections: {},
    profitability: {},
    sensitivityAnalysis: '',
    scenarioPlanning: {},
    fundingRequirements: ''
  },
  validation: {
    required: ['projectionType', 'timeframe', 'assumptions', 'revenueModel', 'revenueProjections', 'costProjections']
  },
  relationships: {
    linkedBlueprints: ['business-model', 'kpis'],
    requiredBlueprints: ['business-model']
  }
}