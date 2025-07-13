import { BlueprintConfig } from '../types'
import { User } from 'lucide-react'

export const personConfig: BlueprintConfig = {
  id: 'person',
  name: 'Person',
  icon: '👤',
  lucideIcon: User,
  description: 'Capture information about individuals in your organization',
  category: 'Organisation',
  prefix: 'PER',
  color: 'bg-purple-100',
  fields: [
    // Basic Information
    {
      id: 'full_name',
      name: 'Full Name',
      label: 'Full Name',
      type: 'text',
      required: true,
      placeholder: 'Enter full name',
      helpText: 'The person\'s full name'
    },
    {
      id: 'job_title',
      name: 'Job Title',
      label: 'Job Title',
      type: 'text',
      required: true,
      placeholder: 'e.g., Senior Software Engineer',
      helpText: 'Current job title or role'
    },
    {
      id: 'department',
      name: 'Department',
      label: 'Department',
      type: 'text',
      required: false,
      placeholder: 'e.g., Engineering, Sales, Marketing',
      helpText: 'The department this person belongs to'
    },
    {
      id: 'reports_to',
      name: 'Reports To',
      label: 'Reports To',
      type: 'text',
      required: false,
      placeholder: 'Manager\'s name',
      helpText: 'Who this person reports to'
    },
    
    // Contact Information
    {
      id: 'email',
      name: 'Email',
      label: 'Email',
      type: 'text',
      required: false,
      placeholder: 'email@example.com',
      helpText: 'Work email address'
    },
    {
      id: 'phone',
      name: 'Phone',
      label: 'Phone',
      type: 'text',
      required: false,
      placeholder: '+1 (555) 123-4567',
      helpText: 'Work phone number'
    },
    {
      id: 'location',
      name: 'Location',
      label: 'Location',
      type: 'text',
      required: false,
      placeholder: 'e.g., New York, NY',
      helpText: 'Office location or remote'
    },
    {
      id: 'timezone',
      name: 'Timezone',
      label: 'Timezone',
      type: 'text',
      required: false,
      placeholder: 'e.g., EST, PST, GMT',
      helpText: 'Working timezone'
    },
    
    // Professional Details
    {
      id: 'employee_id',
      name: 'Employee ID',
      label: 'Employee ID',
      type: 'text',
      required: false,
      placeholder: 'e.g., EMP001234',
      helpText: 'Internal employee ID'
    },
    {
      id: 'start_date',
      name: 'Start Date',
      label: 'Start Date',
      type: 'text',
      required: false,
      placeholder: 'e.g., 2023-01-15',
      helpText: 'When this person joined the organization'
    },
    {
      id: 'employment_type',
      name: 'Employment Type',
      label: 'Employment Type',
      type: 'select',
      required: false,
      options: [
        { value: 'full_time', label: 'Full Time' },
        { value: 'part_time', label: 'Part Time' },
        { value: 'contractor', label: 'Contractor' },
        { value: 'consultant', label: 'Consultant' },
        { value: 'intern', label: 'Intern' }
      ],
      helpText: 'Type of employment'
    },
    
    // Skills & Expertise
    {
      id: 'skills',
      name: 'Skills',
      label: 'Skills',
      type: 'tags',
      required: false,
      placeholder: 'Add skills',
      helpText: 'Key skills and competencies'
    },
    {
      id: 'expertise_areas',
      name: 'Expertise Areas',
      label: 'Expertise Areas',
      type: 'textarea',
      required: false,
      placeholder: 'List main areas of expertise',
      helpText: 'Domains or areas where this person is an expert'
    },
    {
      id: 'certifications',
      name: 'Certifications',
      label: 'Certifications',
      type: 'textarea',
      required: false,
      placeholder: 'List relevant certifications',
      helpText: 'Professional certifications or qualifications'
    },
    
    // Role & Responsibilities
    {
      id: 'key_responsibilities',
      name: 'Key Responsibilities',
      label: 'Key Responsibilities',
      type: 'textarea',
      required: false,
      placeholder: 'List main responsibilities',
      helpText: 'Primary responsibilities in current role'
    },
    {
      id: 'current_projects',
      name: 'Current Projects',
      label: 'Current Projects',
      type: 'textarea',
      required: false,
      placeholder: 'List current projects or initiatives',
      helpText: 'Projects this person is currently working on'
    },
    {
      id: 'direct_reports',
      name: 'Direct Reports',
      label: 'Direct Reports',
      type: 'text',
      required: false,
      placeholder: 'e.g., 5 engineers',
      helpText: 'Number and type of direct reports'
    },
    
    // Additional Information
    {
      id: 'bio',
      name: 'Bio',
      label: 'Bio',
      type: 'textarea',
      required: false,
      placeholder: 'Brief professional biography',
      helpText: 'Short professional bio or background'
    },
    {
      id: 'notes',
      name: 'Notes',
      label: 'Notes',
      type: 'textarea',
      required: false,
      placeholder: 'Additional notes or information',
      helpText: 'Any other relevant information'
    },
    {
      id: 'status',
      name: 'Status',
      label: 'Status',
      type: 'select',
      required: false,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'on_leave', label: 'On Leave' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'departed', label: 'Departed' }
      ],
      helpText: 'Current employment status'
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
    employment_type: 'full_time',
    status: 'active',
    tags: ['person']
  }
}