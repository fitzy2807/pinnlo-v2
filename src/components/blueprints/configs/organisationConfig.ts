import { BlueprintConfig } from '../types'
import { Building2 } from 'lucide-react'

export const organisationConfig: BlueprintConfig = {
  id: 'organisation',
  name: 'Organisation',
  icon: '🏢',
  lucideIcon: Building2,
  description: 'Capture organisation structure, departments, teams, and people',
  category: 'Organisation',
  prefix: 'ORG',
  color: 'bg-blue-100',
  fields: [
    // Basic Organisation Information
    {
      id: 'organisation_name',
      name: 'Organisation Name',
      label: 'Organisation Name',
      type: 'text',
      required: true,
      placeholder: 'Enter organisation name',
      helpText: 'The full name of the organisation or department'
    },
    {
      id: 'organisation_type',
      name: 'Organisation Type',
      label: 'Organisation Type',
      type: 'select',
      required: true,
      options: [
        { value: 'company', label: 'Company' },
        { value: 'department', label: 'Department' },
        { value: 'team', label: 'Team' },
        { value: 'division', label: 'Division' },
        { value: 'business_unit', label: 'Business Unit' },
        { value: 'subsidiary', label: 'Subsidiary' }
      ],
      helpText: 'Select the type of organisation entity'
    },
    {
      id: 'organisation_level',
      name: 'Organisation Level',
      label: 'Organisation Level',
      type: 'select',
      required: false,
      options: [
        { value: 'group', label: 'Group' },
        { value: 'company', label: 'Company' },
        { value: 'division', label: 'Division' },
        { value: 'department', label: 'Department' },
        { value: 'team', label: 'Team' },
        { value: 'individual', label: 'Individual' }
      ],
      helpText: 'The hierarchical level of this organisation'
    },
    {
      id: 'parent_organisation',
      name: 'Parent Organisation',
      label: 'Parent Organisation',
      type: 'text',
      required: false,
      placeholder: 'Enter parent organisation name',
      helpText: 'The organisation this entity reports to'
    },
    
    // Leadership & Contact
    {
      id: 'leader_name',
      name: 'Leader/Manager Name',
      label: 'Leader/Manager Name',
      type: 'text',
      required: false,
      placeholder: 'Enter leader or manager name',
      helpText: 'The person who leads this organisation'
    },
    {
      id: 'leader_title',
      name: 'Leader Title',
      label: 'Leader Title',
      type: 'text',
      required: false,
      placeholder: 'e.g., CEO, Director, Team Lead',
      helpText: 'The title of the organisation leader'
    },
    {
      id: 'contact_email',
      name: 'Contact Email',
      label: 'Contact Email',
      type: 'text',
      required: false,
      placeholder: 'contact@example.com',
      helpText: 'Primary contact email for this organisation'
    },
    
    // Organisation Details
    {
      id: 'description',
      name: 'Description',
      label: 'Description',
      type: 'textarea',
      required: false,
      placeholder: 'Describe the organisation\'s purpose and responsibilities',
      helpText: 'A brief description of what this organisation does'
    },
    {
      id: 'mission',
      name: 'Mission Statement',
      label: 'Mission Statement',
      type: 'textarea',
      required: false,
      placeholder: 'Enter the organisation\'s mission',
      helpText: 'The organisation\'s mission or purpose statement'
    },
    {
      id: 'objectives',
      name: 'Key Objectives',
      label: 'Key Objectives',
      type: 'textarea',
      required: false,
      placeholder: 'List the key objectives',
      helpText: 'The main objectives or goals of this organisation'
    },
    
    // Size & Structure
    {
      id: 'employee_count',
      name: 'Employee Count',
      label: 'Employee Count',
      type: 'text',
      required: false,
      placeholder: 'e.g., 50, 100-500, 1000+',
      helpText: 'Number of employees in this organisation'
    },
    {
      id: 'location',
      name: 'Primary Location',
      label: 'Primary Location',
      type: 'text',
      required: false,
      placeholder: 'e.g., London, UK',
      helpText: 'The main location of this organisation'
    },
    {
      id: 'budget',
      name: 'Annual Budget',
      label: 'Annual Budget',
      type: 'text',
      required: false,
      placeholder: 'e.g., $5M, £10M-50M',
      helpText: 'The annual budget for this organisation'
    },
    
    // Relationships
    {
      id: 'key_stakeholders',
      name: 'Key Stakeholders',
      label: 'Key Stakeholders',
      type: 'textarea',
      required: false,
      placeholder: 'List key stakeholders and their roles',
      helpText: 'Important stakeholders for this organisation'
    },
    {
      id: 'key_partnerships',
      name: 'Key Partnerships',
      label: 'Key Partnerships',
      type: 'textarea',
      required: false,
      placeholder: 'List key internal and external partnerships',
      helpText: 'Important partnerships and collaborations'
    },
    
    // Performance
    {
      id: 'key_metrics',
      name: 'Key Performance Metrics',
      label: 'Key Performance Metrics',
      type: 'textarea',
      required: false,
      placeholder: 'List the KPIs this organisation tracks',
      helpText: 'The main metrics used to measure performance'
    },
    {
      id: 'current_initiatives',
      name: 'Current Initiatives',
      label: 'Current Initiatives',
      type: 'textarea',
      required: false,
      placeholder: 'List major current initiatives or projects',
      helpText: 'Major initiatives currently underway'
    },
    
    // Tags & Status
    {
      id: 'status',
      name: 'Status',
      label: 'Status',
      type: 'select',
      required: false,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'forming', label: 'Forming' },
        { value: 'restructuring', label: 'Restructuring' },
        { value: 'merged', label: 'Merged' },
        { value: 'dissolved', label: 'Dissolved' }
      ],
      helpText: 'Current status of the organisation'
    },
    {
      id: 'tags',
      name: 'Tags',
      label: 'Tags',
      type: 'tags',
      required: false,
      placeholder: 'Add relevant tags',
      helpText: 'Tags to categorise this organisation'
    }
  ],
  defaultValues: {
    priority: 'medium',
    confidence: 'medium',
    organisation_type: 'department',
    status: 'active',
    tags: ['organisation']
  }
}
