import { BlueprintConfig } from '../types'

export const problemStatementConfig: BlueprintConfig = {
  id: 'problemStatement',
  name: 'Problem Statement',
  description: 'Define and validate key problems to solve',
  category: 'Planning & Execution',
  icon: '❗',
  fields: [
    {
      id: 'whoIsAffected',
      name: 'Who Is Affected',
      type: 'text',
      required: true,
      placeholder: 'Target users, customers, stakeholders...',
      description: 'Who experiences this problem?'
    },
    {
      id: 'coreProblem',
      name: 'Core Problem',
      type: 'textarea',
      required: true,
      placeholder: 'Describe the main problem clearly and concisely...',
      description: 'What is the fundamental problem to solve?'
    },
    {
      id: 'rootCause',
      name: 'Root Cause',
      type: 'textarea',
      required: true,
      placeholder: 'What is causing this problem to exist?',
      description: 'The underlying cause of the problem'
    },
    {
      id: 'impactOfProblem',
      name: 'Impact of Problem',
      type: 'textarea',
      required: true,
      placeholder: 'How does this problem affect users/business?',
      description: 'Consequences if this problem remains unsolved'
    },
    {
      id: 'evidence',
      name: 'Evidence',
      type: 'textarea',
      required: true,
      placeholder: 'Data, research, feedback that validates this problem...',
      description: 'What evidence supports the existence of this problem?'
    },
    {
      id: 'solutionHypothesis',
      name: 'Solution Hypothesis',
      type: 'textarea',
      required: false,
      placeholder: 'Initial ideas for solving this problem...',
      description: 'Early thoughts on potential solutions'
    },
    {
      id: 'validated',
      name: 'Validated',
      type: 'boolean',
      required: false,
      description: 'Has this problem been validated with users/data?'
    },
    {
      id: 'linkedPersonaIds',
      name: 'Linked Personas',
      type: 'array',
      required: false,
      description: 'Which personas experience this problem?'
    },
    {
      id: 'linkedOKRId',
      name: 'Linked OKR',
      type: 'text',
      required: false,
      placeholder: 'OKR ID that addresses this problem',
      description: 'Which OKR does solving this problem support?'
    }
  ],
  defaultValues: {
    whoIsAffected: '',
    coreProblem: '',
    rootCause: '',
    impactOfProblem: '',
    evidence: '',
    solutionHypothesis: '',
    validated: false,
    linkedPersonaIds: [],
    linkedOKRId: ''
  },
  validation: {
    required: ['whoIsAffected', 'coreProblem', 'rootCause', 'impactOfProblem', 'evidence']
  },
  relationships: {
    linkedBlueprints: ['personas', 'okrs', 'feature'],
    requiredBlueprints: ['strategic-context']
  }
}