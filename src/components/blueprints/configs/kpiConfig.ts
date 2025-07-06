import { BlueprintConfig } from '../types'

export const kpiConfig: BlueprintConfig = {
  id: 'kpis',
  name: 'KPIs & Metrics',
  description: 'Define key performance indicators and success metrics',
  category: 'Measurement',
  icon: 'BarChart3',
  fields: [
    {
      id: 'metricCategory',
      name: 'Metric Category',
      type: 'enum',
      required: true,
      options: ['Financial', 'Customer', 'Operational', 'Learning & Growth', 'Strategic'],
      description: 'What category does this metric belong to?'
    },
    {
      id: 'metricName',
      name: 'Metric Name',
      type: 'text',
      required: true,
      placeholder: 'Name of the KPI',
      description: 'Clear name for this metric'
    },
    {
      id: 'definition',
      name: 'Definition',
      type: 'textarea',
      required: true,
      placeholder: 'How is this metric calculated?',
      description: 'Clear definition and calculation method'
    },
    {
      id: 'target',
      name: 'Target Value',
      type: 'text',
      required: true,
      placeholder: 'Target value or range',
      description: 'Target value or acceptable range'
    },
    {
      id: 'currentValue',
      name: 'Current Value',
      type: 'text',
      required: false,
      placeholder: 'Current baseline',
      description: 'Current baseline measurement'
    },
    {
      id: 'frequency',
      name: 'Measurement Frequency',
      type: 'enum',
      required: true,
      options: ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annually'],
      description: 'How often is this measured?'
    },
    {
      id: 'dataSource',
      name: 'Data Source',
      type: 'text',
      required: true,
      placeholder: 'Where does the data come from?',
      description: 'Source of data for this metric'
    },
    {
      id: 'owner',
      name: 'Metric Owner',
      type: 'text',
      required: true,
      placeholder: 'Who is responsible?',
      description: 'Person responsible for this metric'
    },
    {
      id: 'linkedObjectives',
      name: 'Linked Objectives',
      type: 'array',
      required: false,
      description: 'OKRs or objectives this metric supports'
    },
    {
      id: 'reportingMethod',
      name: 'Reporting Method',
      type: 'text',
      required: false,
      placeholder: 'Dashboard, report, etc.',
      description: 'How is this metric reported?'
    }
  ],
  defaultValues: {
    metricCategory: 'Strategic',
    metricName: '',
    definition: '',
    target: '',
    currentValue: '',
    frequency: 'Monthly',
    dataSource: '',
    owner: '',
    linkedObjectives: [],
    reportingMethod: ''
  },
  validation: {
    required: ['metricCategory', 'metricName', 'definition', 'target', 'frequency', 'dataSource', 'owner']
  },
  relationships: {
    linkedBlueprints: ['okrs', 'financial-projections'],
    requiredBlueprints: ['strategic-context']
  }
}