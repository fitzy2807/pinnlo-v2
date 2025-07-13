import { BlueprintConfig } from '../types'
import { Building2 } from 'lucide-react'

export const companyConfig: BlueprintConfig = {
  id: 'company',
  name: 'Company',
  icon: '🏢',
  lucideIcon: Building2,
  description: 'Capture information about companies and organizations',
  category: 'Organisation',
  prefix: 'COM',
  color: 'bg-blue-100',
  fields: [
    // Basic Company Information
    {
      id: 'company_name',
      name: 'Company Name',
      label: 'Company Name',
      type: 'text',
      required: true,
      placeholder: 'Enter company name',
      helpText: 'Legal name of the company'
    },
    {
      id: 'trading_name',
      name: 'Trading Name',
      label: 'Trading Name (DBA)',
      type: 'text',
      required: false,
      placeholder: 'Trading or brand name',
      helpText: 'Name the company trades under'
    },
    {
      id: 'company_type',
      name: 'Company Type',
      label: 'Company Type',
      type: 'select',
      required: true,
      options: [
        { value: 'public', label: 'Public Company' },
        { value: 'private', label: 'Private Company' },
        { value: 'subsidiary', label: 'Subsidiary' },
        { value: 'partnership', label: 'Partnership' },
        { value: 'nonprofit', label: 'Non-Profit' },
        { value: 'government', label: 'Government Entity' }
      ],
      helpText: 'Legal structure of the company'
    },
    {
      id: 'industry',
      name: 'Industry',
      label: 'Industry',
      type: 'text',
      required: false,
      placeholder: 'e.g., Technology, Healthcare, Finance',
      helpText: 'Primary industry or sector'
    },
    {
      id: 'founded_date',
      name: 'Founded Date',
      label: 'Founded Date',
      type: 'text',
      required: false,
      placeholder: 'e.g., 2010',
      helpText: 'Year the company was founded'
    },
    
    // Company Details
    {
      id: 'headquarters',
      name: 'Headquarters',
      label: 'Headquarters Location',
      type: 'text',
      required: false,
      placeholder: 'e.g., San Francisco, CA',
      helpText: 'Primary headquarters location'
    },
    {
      id: 'website',
      name: 'Website',
      label: 'Website',
      type: 'text',
      required: false,
      placeholder: 'https://example.com',
      helpText: 'Company website URL'
    },
    {
      id: 'description',
      name: 'Description',
      label: 'Company Description',
      type: 'textarea',
      required: false,
      placeholder: 'Describe what the company does',
      helpText: 'Brief description of the company\'s business'
    },
    {
      id: 'mission_statement',
      name: 'Mission Statement',
      label: 'Mission Statement',
      type: 'textarea',
      required: false,
      placeholder: 'Company mission statement',
      helpText: 'The company\'s mission or purpose'
    },
    
    // Size & Scale
    {
      id: 'employee_count',
      name: 'Employee Count',
      label: 'Number of Employees',
      type: 'text',
      required: false,
      placeholder: 'e.g., 1000-5000',
      helpText: 'Total number of employees'
    },
    {
      id: 'annual_revenue',
      name: 'Annual Revenue',
      label: 'Annual Revenue',
      type: 'text',
      required: false,
      placeholder: 'e.g., $100M-500M',
      helpText: 'Annual revenue range'
    },
    {
      id: 'market_cap',
      name: 'Market Cap',
      label: 'Market Capitalization',
      type: 'text',
      required: false,
      placeholder: 'e.g., $1B',
      helpText: 'Market cap (if public)'
    },
    {
      id: 'office_locations',
      name: 'Office Locations',
      label: 'Office Locations',
      type: 'textarea',
      required: false,
      placeholder: 'List major office locations',
      helpText: 'Key office locations worldwide'
    },
    
    // Leadership & Ownership
    {
      id: 'ceo_name',
      name: 'CEO Name',
      label: 'CEO / President',
      type: 'text',
      required: false,
      placeholder: 'Name of CEO or President',
      helpText: 'Current CEO or President'
    },
    {
      id: 'key_executives',
      name: 'Key Executives',
      label: 'Key Executives',
      type: 'textarea',
      required: false,
      placeholder: 'List key executives and roles',
      helpText: 'Other key leadership positions'
    },
    {
      id: 'ownership_structure',
      name: 'Ownership Structure',
      label: 'Ownership Structure',
      type: 'textarea',
      required: false,
      placeholder: 'Describe ownership structure',
      helpText: 'Major shareholders or ownership details'
    },
    {
      id: 'parent_company',
      name: 'Parent Company',
      label: 'Parent Company',
      type: 'text',
      required: false,
      placeholder: 'Parent company name (if applicable)',
      helpText: 'Parent company if this is a subsidiary'
    },
    
    // Business Information
    {
      id: 'products_services',
      name: 'Products/Services',
      label: 'Main Products/Services',
      type: 'textarea',
      required: false,
      placeholder: 'List main products or services',
      helpText: 'Key products or services offered'
    },
    {
      id: 'target_market',
      name: 'Target Market',
      label: 'Target Market',
      type: 'textarea',
      required: false,
      placeholder: 'Describe target customers',
      helpText: 'Primary customer segments'
    },
    {
      id: 'competitors',
      name: 'Competitors',
      label: 'Main Competitors',
      type: 'textarea',
      required: false,
      placeholder: 'List main competitors',
      helpText: 'Key competitive companies'
    },
    {
      id: 'unique_value_prop',
      name: 'Unique Value Proposition',
      label: 'Unique Value Proposition',
      type: 'textarea',
      required: false,
      placeholder: 'What makes this company unique',
      helpText: 'Key differentiators'
    },
    
    // Financial & Legal
    {
      id: 'fiscal_year_end',
      name: 'Fiscal Year End',
      label: 'Fiscal Year End',
      type: 'text',
      required: false,
      placeholder: 'e.g., December 31',
      helpText: 'End of fiscal year'
    },
    {
      id: 'stock_symbol',
      name: 'Stock Symbol',
      label: 'Stock Symbol',
      type: 'text',
      required: false,
      placeholder: 'e.g., AAPL',
      helpText: 'Stock ticker symbol (if public)'
    },
    {
      id: 'registration_number',
      name: 'Registration Number',
      label: 'Registration Number',
      type: 'text',
      required: false,
      placeholder: 'Company registration number',
      helpText: 'Legal registration or tax ID'
    },
    
    // Additional Information
    {
      id: 'key_partnerships',
      name: 'Key Partnerships',
      label: 'Key Partnerships',
      type: 'textarea',
      required: false,
      placeholder: 'List strategic partnerships',
      helpText: 'Important business partnerships'
    },
    {
      id: 'recent_news',
      name: 'Recent News',
      label: 'Recent News/Updates',
      type: 'textarea',
      required: false,
      placeholder: 'Recent developments or news',
      helpText: 'Latest company news or changes'
    },
    {
      id: 'status',
      name: 'Status',
      label: 'Status',
      type: 'select',
      required: false,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'acquired', label: 'Acquired' },
        { value: 'merged', label: 'Merged' },
        { value: 'bankrupt', label: 'Bankrupt' },
        { value: 'dissolved', label: 'Dissolved' }
      ],
      helpText: 'Current company status'
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
    company_type: 'private',
    status: 'active',
    tags: ['company']
  }
}