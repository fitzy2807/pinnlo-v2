import { BlueprintConfig } from '../types'

export const technologyIntelligenceConfig: BlueprintConfig = {
  id: 'technologyIntelligence',
  name: 'Technology Intelligence',
  description: 'Tech stack evolution, emerging technologies, and technical innovations',
  category: 'Research & Analysis',
  icon: 'Cpu',
  fields: [
    {
      id: 'intelligence_content',
      name: 'Intelligence Content',
      type: 'textarea',
      required: true,
      placeholder: 'Detailed technology analysis...',
      description: 'Comprehensive technology intelligence and analysis'
    },
    {
      id: 'technology_name',
      name: 'Technology/Platform',
      type: 'text',
      required: false,
      placeholder: 'e.g., AI/ML Platform, Cloud Infrastructure, Framework',
      description: 'Specific technology or platform being analyzed'
    },
    {
      id: 'technology_category',
      name: 'Technology Category',
      type: 'enum',
      required: false,
      options: ['AI/ML', 'Cloud', 'Security', 'Data', 'DevOps', 'Frontend', 'Backend', 'Mobile', 'IoT', 'Blockchain'],
      placeholder: 'Select technology category',
      description: 'Type of technology'
    },
    {
      id: 'key_findings',
      name: 'Key Findings',
      type: 'array',
      required: false,
      placeholder: 'Add key technology insights...',
      description: 'Critical technology discoveries'
    },
    {
      id: 'maturity_level',
      name: 'Technology Maturity',
      type: 'enum',
      required: false,
      options: ['Experimental', 'Emerging', 'Growth', 'Mature', 'Declining'],
      placeholder: 'Select maturity level',
      description: 'Current maturity of the technology'
    },
    {
      id: 'source_reference',
      name: 'Source Reference',
      type: 'text',
      required: false,
      placeholder: 'e.g., Tech documentation, Industry report, Vendor analysis',
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
      id: 'relevance_score',
      name: 'Relevance Score',
      type: 'number',
      required: false,
      placeholder: '1-10',
      description: 'How relevant to our tech strategy? (1-10)',
      validation: {
        min: 1,
        max: 10
      }
    },
    {
      id: 'technical_advantages',
      name: 'Technical Advantages',
      type: 'array',
      required: false,
      placeholder: 'Add technical benefit...',
      description: 'Key technical benefits and capabilities'
    },
    {
      id: 'technical_limitations',
      name: 'Technical Limitations',
      type: 'array',
      required: false,
      placeholder: 'Add limitation or constraint...',
      description: 'Known limitations or constraints'
    },
    {
      id: 'strategic_implications',
      name: 'Strategic Implications',
      type: 'textarea',
      required: false,
      placeholder: 'How does this impact our technical strategy?',
      description: 'Analysis of technology implications'
    },
    {
      id: 'recommended_actions',
      name: 'Recommended Actions',
      type: 'textarea',
      required: false,
      placeholder: 'What technical decisions should we make?',
      description: 'Actionable technology recommendations'
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
    credibility_score: 5,
    relevance_score: 5,
    technical_advantages: [],
    technical_limitations: [],
    relevant_blueprint_pages: []
  },
  validation: {
    required: ['intelligence_content']
  },
  relationships: {
    linkedBlueprints: ['techStack', 'techRequirements', 'roadmap']
  }
}