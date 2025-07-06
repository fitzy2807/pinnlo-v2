import { BlueprintConfig } from '../types'

export const experimentConfig: BlueprintConfig = {
  id: 'experiment',
  name: 'Experiment',
  description: 'Design and track experiments to validate hypotheses and reduce risk',
  category: 'Research & Analysis',
  icon: '🧪',
  fields: [
    {
      id: 'experimentType',
      name: 'Experiment Type',
      type: 'enum',
      required: true,
      options: ['A/B Test', 'MVP', 'Prototype Test', 'User Interview', 'Survey', 'Market Test', 'Technical Proof of Concept', 'Other'],
      description: 'What type of experiment is this?'
    },
    {
      id: 'hypothesis',
      name: 'Hypothesis',
      type: 'textarea',
      required: true,
      placeholder: 'We believe that [change] will result in [outcome] because [assumption]',
      description: 'Clear hypothesis statement for this experiment'
    },
    {
      id: 'objective',
      name: 'Experiment Objective',
      type: 'textarea',
      required: true,
      placeholder: 'What are we trying to learn or validate?',
      description: 'Primary objective and learning goal'
    },
    {
      id: 'testMethod',
      name: 'Test Method',
      type: 'textarea',
      required: true,
      placeholder: 'How will we conduct this experiment?',
      description: 'Methodology and approach for running the experiment'
    },
    {
      id: 'successCriteria',
      name: 'Success Criteria',
      type: 'array',
      required: true,
      description: 'Specific criteria that will indicate experiment success'
    },
    {
      id: 'metrics',
      name: 'Key Metrics',
      type: 'array',
      required: true,
      description: 'Metrics we will track to measure results'
    },
    {
      id: 'targetAudience',
      name: 'Target Audience',
      type: 'text',
      required: true,
      placeholder: 'Who will participate in this experiment?',
      description: 'Target audience or participant group'
    },
    {
      id: 'duration',
      name: 'Duration',
      type: 'text',
      required: true,
      placeholder: 'How long will this experiment run?',
      description: 'Timeline for the experiment'
    },
    {
      id: 'resourcesRequired',
      name: 'Resources Required',
      type: 'array',
      required: false,
      description: 'People, tools, budget, or other resources needed'
    },
    {
      id: 'risks',
      name: 'Experiment Risks',
      type: 'array',
      required: false,
      description: 'Potential risks or issues with this experiment'
    },
    {
      id: 'status',
      name: 'Status',
      type: 'enum',
      required: false,
      options: ['Planned', 'In Progress', 'Completed', 'Cancelled'],
      description: 'Current status of the experiment'
    },
    {
      id: 'resultSummary',
      name: 'Result Summary',
      type: 'textarea',
      required: false,
      placeholder: 'Summary of experiment results',
      description: 'Key findings and results from the experiment'
    },
    {
      id: 'learnings',
      name: 'Key Learnings',
      type: 'array',
      required: false,
      description: 'Important learnings from this experiment'
    },
    {
      id: 'nextSteps',
      name: 'Next Steps',
      type: 'array',
      required: false,
      description: 'Actions to take based on experiment results'
    },
    {
      id: 'linkedHypotheses',
      name: 'Linked Hypotheses',
      type: 'array',
      required: false,
      description: 'Other hypotheses or experiments this relates to'
    }
  ],
  defaultValues: {
    experimentType: 'A/B Test',
    hypothesis: '',
    objective: '',
    testMethod: '',
    successCriteria: [],
    metrics: [],
    targetAudience: '',
    duration: '',
    resourcesRequired: [],
    risks: [],
    status: 'Planned',
    resultSummary: '',
    learnings: [],
    nextSteps: [],
    linkedHypotheses: []
  },
  validation: {
    required: ['experimentType', 'hypothesis', 'objective', 'testMethod', 'successCriteria', 'metrics', 'targetAudience', 'duration']
  },
  relationships: {
    linkedBlueprints: ['problem-statement', 'feature', 'market-insight'],
    requiredBlueprints: ['strategic-context']
  }
}