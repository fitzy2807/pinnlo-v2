import { BlueprintConfig } from '../types'
import { Users } from 'lucide-react'

export const departmentConfig: BlueprintConfig = {
  id: 'department',
  name: 'Department',
  icon: '🏬',
  lucideIcon: Users,
  description: 'Capture information about organizational departments',
  category: 'Organisation',
  prefix: 'DEP',
  color: 'bg-green-100',
  fields: [
    // Basic Department Information
    {
      id: 'department_name',
      name: 'Department Name',
      label: 'Department Name',
      type: 'text',
      required: true,
      placeholder: 'Enter department name',
      helpText: 'Name of the department'
    },
    {
      id: 'department_code',
      name: 'Department Code',
      label: 'Department Code',
      type: 'text',
      required: false,
      placeholder: 'e.g., ENG, SALES, HR',
      helpText: 'Short code or abbreviation'
    },
    {
      id: 'department_type',
      name: 'Department Type',
      label: 'Department Type',
      type: 'select',
      required: true,
      options: [
        { value: 'core', label: 'Core Business' },
        { value: 'support', label: 'Support Function' },
        { value: 'revenue', label: 'Revenue Generating' },
        { value: 'cost_center', label: 'Cost Center' },
        { value: 'shared_service', label: 'Shared Service' }
      ],
      helpText: 'Type of department function'
    },
    {
      id: 'parent_department',
      name: 'Parent Department',
      label: 'Parent Department',
      type: 'text',
      required: false,
      placeholder: 'Parent department name',
      helpText: 'Department this reports to'
    },
    
    // Leadership & Structure
    {
      id: 'department_head',
      name: 'Department Head',
      label: 'Department Head',
      type: 'text',
      required: false,
      placeholder: 'Name of department head',
      helpText: 'Person leading this department'
    },
    {
      id: 'head_title',
      name: 'Head Title',
      label: 'Head\'s Title',
      type: 'text',
      required: false,
      placeholder: 'e.g., VP of Engineering, Director of Sales',
      helpText: 'Title of department head'
    },
    {
      id: 'reports_to',
      name: 'Reports To',
      label: 'Reports To',
      type: 'text',
      required: false,
      placeholder: 'e.g., CEO, COO',
      helpText: 'Who the department head reports to'
    },
    {
      id: 'team_size',
      name: 'Team Size',
      label: 'Team Size',
      type: 'text',
      required: false,
      placeholder: 'e.g., 25, 50-100',
      helpText: 'Number of people in department'
    },
    
    // Purpose & Function
    {
      id: 'purpose',
      name: 'Purpose',
      label: 'Department Purpose',
      type: 'textarea',
      required: false,
      placeholder: 'Describe the department\'s purpose',
      helpText: 'Why this department exists'
    },
    {
      id: 'key_responsibilities',
      name: 'Key Responsibilities',
      label: 'Key Responsibilities',
      type: 'textarea',
      required: false,
      placeholder: 'List main responsibilities',
      helpText: 'Primary functions and duties'
    },
    {
      id: 'services_provided',
      name: 'Services Provided',
      label: 'Services Provided',
      type: 'textarea',
      required: false,
      placeholder: 'List services this department provides',
      helpText: 'Internal or external services'
    },
    
    // Budget & Resources
    {
      id: 'annual_budget',
      name: 'Annual Budget',
      label: 'Annual Budget',
      type: 'text',
      required: false,
      placeholder: 'e.g., $2M, $5-10M',
      helpText: 'Department budget range'
    },
    {
      id: 'cost_center_code',
      name: 'Cost Center Code',
      label: 'Cost Center Code',
      type: 'text',
      required: false,
      placeholder: 'Financial cost center code',
      helpText: 'Accounting/finance code'
    },
    {
      id: 'primary_location',
      name: 'Primary Location',
      label: 'Primary Location',
      type: 'text',
      required: false,
      placeholder: 'e.g., HQ - Building A',
      helpText: 'Main physical location'
    },
    
    // Performance & Metrics
    {
      id: 'key_metrics',
      name: 'Key Metrics',
      label: 'Key Performance Metrics',
      type: 'textarea',
      required: false,
      placeholder: 'List KPIs and metrics',
      helpText: 'How department performance is measured'
    },
    {
      id: 'objectives',
      name: 'Objectives',
      label: 'Current Objectives',
      type: 'textarea',
      required: false,
      placeholder: 'List current objectives or OKRs',
      helpText: 'Department goals for current period'
    },
    {
      id: 'achievements',
      name: 'Achievements',
      label: 'Recent Achievements',
      type: 'textarea',
      required: false,
      placeholder: 'List recent wins or accomplishments',
      helpText: 'Notable department achievements'
    },
    
    // Teams & Structure
    {
      id: 'sub_teams',
      name: 'Sub Teams',
      label: 'Sub-teams/Units',
      type: 'textarea',
      required: false,
      placeholder: 'List teams within this department',
      helpText: 'Teams or units within department'
    },
    {
      id: 'key_roles',
      name: 'Key Roles',
      label: 'Key Roles',
      type: 'textarea',
      required: false,
      placeholder: 'List important roles/positions',
      helpText: 'Critical positions in department'
    },
    
    // Collaboration & Dependencies
    {
      id: 'key_stakeholders',
      name: 'Key Stakeholders',
      label: 'Key Stakeholders',
      type: 'textarea',
      required: false,
      placeholder: 'List main internal/external stakeholders',
      helpText: 'Who this department works with'
    },
    {
      id: 'dependencies',
      name: 'Dependencies',
      label: 'Dependencies',
      type: 'textarea',
      required: false,
      placeholder: 'List key dependencies',
      helpText: 'What this department depends on'
    },
    {
      id: 'collaboration_model',
      name: 'Collaboration Model',
      label: 'Collaboration Model',
      type: 'textarea',
      required: false,
      placeholder: 'How this department collaborates',
      helpText: 'Working style and collaboration approach'
    },
    
    // Current State
    {
      id: 'current_projects',
      name: 'Current Projects',
      label: 'Current Projects',
      type: 'textarea',
      required: false,
      placeholder: 'List major ongoing projects',
      helpText: 'Active initiatives or projects'
    },
    {
      id: 'challenges',
      name: 'Challenges',
      label: 'Current Challenges',
      type: 'textarea',
      required: false,
      placeholder: 'List current challenges',
      helpText: 'Issues or obstacles facing department'
    },
    {
      id: 'improvement_areas',
      name: 'Improvement Areas',
      label: 'Improvement Areas',
      type: 'textarea',
      required: false,
      placeholder: 'Areas needing improvement',
      helpText: 'Opportunities for enhancement'
    },
    
    // Additional Information
    {
      id: 'tools_systems',
      name: 'Tools & Systems',
      label: 'Tools & Systems Used',
      type: 'textarea',
      required: false,
      placeholder: 'List main tools and systems',
      helpText: 'Technology and tools used'
    },
    {
      id: 'status',
      name: 'Status',
      label: 'Status',
      type: 'select',
      required: false,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'restructuring', label: 'Restructuring' },
        { value: 'expanding', label: 'Expanding' },
        { value: 'downsizing', label: 'Downsizing' },
        { value: 'merged', label: 'Merged' }
      ],
      helpText: 'Current department status'
    },
    {
      id: 'tags',
      name: 'Tags',
      label: 'Tags',
      type: 'tags',
      required: false,
      placeholder: 'Add tags',
      helpText: 'Tags for categorization'
    }
  ],
  defaultValues: {
    priority: 'medium',
    confidence: 'medium',
    department_type: 'core',
    status: 'active',
    tags: ['department']
  }
}