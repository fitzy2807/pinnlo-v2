import { BlueprintConfig } from '../types'

export const marketInsightConfig: BlueprintConfig = {
  id: 'market-insight',
  name: 'Market Insight',
  description: 'Capture and analyze market intelligence and competitive insights',
  category: 'Research & Analysis',
  icon: '🌍',
  fields: [
    {
      id: 'insightType',
      name: 'Insight Type',
      type: 'enum',
      required: true,
      options: ['Market Trend', 'Customer Behavior', 'Competitive Intelligence', 'Technology Shift', 'Regulatory Change', 'Economic Factor'],
      description: 'What type of market insight is this?'
    },
    {
      id: 'sourceType',
      name: 'Source Type',
      type: 'enum',
      required: true,
      options: ['Industry Report', 'Customer Interview', 'Competitor Analysis', 'Market Research', 'News/Media', 'Expert Opinion', 'Internal Data'],
      description: 'What is the source of this insight?'
    },
    {
      id: 'summary',
      name: 'Insight Summary',
      type: 'textarea',
      required: true,
      placeholder: 'Summarize the key insight',
      description: 'Clear summary of the market insight'
    },
    {
      id: 'keyInsights',
      name: 'Key Insights',
      type: 'array',
      required: true,
      description: 'Specific insights and learnings from this analysis'
    },
    {
      id: 'evidenceAndData',
      name: 'Evidence & Data',
      type: 'textarea',
      required: true,
      placeholder: 'Supporting data and evidence',
      description: 'Data, statistics, or evidence supporting this insight'
    },
    {
      id: 'implications',
      name: 'Strategic Implications',
      type: 'textarea',
      required: true,
      placeholder: 'How does this impact our strategy?',
      description: 'What this insight means for our strategy and decisions'
    },
    {
      id: 'opportunitiesIdentified',
      name: 'Opportunities Identified',
      type: 'array',
      required: false,
      description: 'Opportunities that arise from this insight'
    },
    {
      id: 'threatsIdentified',
      name: 'Threats Identified',
      type: 'array',
      required: false,
      description: 'Potential threats or challenges identified'
    },
    {
      id: 'actionItems',
      name: 'Action Items',
      type: 'array',
      required: false,
      description: 'Actions we should take based on this insight'
    },
    {
      id: 'relevanceScore',
      name: 'Relevance Score',
      type: 'enum',
      required: false,
      options: ['Low', 'Medium', 'High', 'Critical'],
      description: 'How relevant is this insight to our strategy?'
    },
    {
      id: 'timeframe',
      name: 'Timeframe',
      type: 'text',
      required: false,
      placeholder: 'When is this insight most relevant?',
      description: 'Timeline or timeframe for this insight\'s relevance'
    },
    {
      id: 'relatedInsights',
      name: 'Related Insights',
      type: 'array',
      required: false,
      description: 'Other insights that relate to or support this finding'
    }
  ],
  defaultValues: {
    insightType: 'Market Trend',
    sourceType: 'Industry Report',
    summary: '',
    keyInsights: [],
    evidenceAndData: '',
    implications: '',
    opportunitiesIdentified: [],
    threatsIdentified: [],
    actionItems: [],
    relevanceScore: 'Medium',
    timeframe: '',
    relatedInsights: []
  },
  validation: {
    required: ['insightType', 'sourceType', 'summary', 'keyInsights', 'evidenceAndData', 'implications']
  },
  relationships: {
    linkedBlueprints: ['competitive-analysis', 'swot-analysis', 'strategic-context'],
    requiredBlueprints: ['strategic-context']
  }
}