'use client'

import React from 'react'
import { CardData } from '@/types/card'
import { getBlueprintConfig } from '@/components/blueprints/registry'
import { BlueprintField } from '@/components/blueprints/types'
import { 
  FileText, Hash, Calendar, ToggleLeft, List, Type, 
  Database, CheckCircle, XCircle, Info
} from 'lucide-react'

interface DetailsTabProps {
  card: CardData
}

export default function DetailsTab({ card }: DetailsTabProps) {
  // Get blueprint configuration for this card type
  const blueprintConfig = getBlueprintConfig(card.cardType)
  const fields = blueprintConfig?.fields || []
  
  // Group fields by type for better organization
  const groupedFields = fields.reduce((acc, field) => {
    const section = getSectionForFieldType(field.type)
    if (!acc[section]) acc[section] = []
    acc[section].push(field)
    return acc
  }, {} as Record<string, BlueprintField[]>)
  
  // Get icon for field type
  const getFieldIcon = (type: string) => {
    switch (type) {
      case 'text': return <Type className="w-3 h-3" />
      case 'textarea': return <FileText className="w-3 h-3" />
      case 'number': return <Hash className="w-3 h-3" />
      case 'date': return <Calendar className="w-3 h-3" />
      case 'boolean': return <ToggleLeft className="w-3 h-3" />
      case 'array': return <List className="w-3 h-3" />
      case 'enum': return <Database className="w-3 h-3" />
      default: return <Info className="w-3 h-3" />
    }
  }
  
  // Get section name for field type
  function getSectionForFieldType(type: string): string {
    switch (type) {
      case 'text':
      case 'textarea':
        return 'Content Fields'
      case 'number':
      case 'date':
        return 'Metrics & Dates'
      case 'boolean':
      case 'enum':
        return 'Status & Categories'
      case 'array':
      case 'object':
        return 'Collections'
      default:
        return 'Other Fields'
    }
  }
  
  // Format field value for display
  const formatFieldValue = (field: BlueprintField, value: any) => {
    if (value === undefined || value === null || value === '') {
      return <span className="text-gray-400 italic">Not specified</span>
    }
    
    switch (field.type) {
      case 'boolean':
        return value ? (
          <span className="flex items-center gap-1 text-green-600">
            <CheckCircle className="w-3 h-3" /> Yes
          </span>
        ) : (
          <span className="flex items-center gap-1 text-gray-500">
            <XCircle className="w-3 h-3" /> No
          </span>
        )
      
      case 'date':
        return new Date(value).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      
      case 'array':
        if (!Array.isArray(value) || value.length === 0) {
          return <span className="text-gray-400 italic">None</span>
        }
        return (
          <ul className="mt-1 space-y-1">
            {value.map((item, idx) => (
              <li key={idx} className="flex items-start gap-1">
                <span className="text-gray-400 mt-0.5">•</span>
                <span>{typeof item === 'object' ? JSON.stringify(item) : item}</span>
              </li>
            ))}
          </ul>
        )
      
      case 'enum':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-gray-100 text-gray-700">
            {value}
          </span>
        )
      
      case 'textarea':
        return (
          <div className="mt-1 whitespace-pre-wrap text-gray-700">
            {value}
          </div>
        )
      
      default:
        return <span className="text-gray-700">{value}</span>
    }
  }
  
  // Render all universal fields first
  const universalFields = [
    { name: 'Title', value: card.title, icon: <Type className="w-3 h-3" /> },
    { name: 'Description', value: card.description, icon: <FileText className="w-3 h-3" /> },
    { name: 'Priority', value: card.priority, icon: <Info className="w-3 h-3" /> },
    { name: 'Confidence Level', value: card.confidenceLevel, icon: <Info className="w-3 h-3" /> },
    { name: 'Strategic Alignment', value: card.strategicAlignment, icon: <Info className="w-3 h-3" /> },
  ]
  
  return (
    <div className="details-tab-content">
      {/* Universal Fields Section */}
      <section className="mb-8">
        <h3 className="text-[14px] font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Database className="w-4 h-4 text-gray-600" />
          Core Information
        </h3>
        <div className="space-y-4">
          {universalFields.map((field, idx) => (
            <div key={idx} className="border-b border-gray-100 pb-3 last:border-0">
              <div className="flex items-center gap-2 text-[11px] text-gray-500 mb-1">
                {field.icon}
                <span className="font-medium">{field.name}</span>
              </div>
              <div className="text-[12px] text-gray-700 pl-5">
                {field.value || <span className="text-gray-400 italic">Not specified</span>}
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Blueprint-Specific Fields */}
      {Object.entries(groupedFields).map(([section, sectionFields]) => (
        <section key={section} className="mb-8">
          <h3 className="text-[14px] font-semibold text-gray-900 mb-4">
            {section}
          </h3>
          <div className="space-y-4">
            {sectionFields.map((field) => (
              <div key={field.id} className="border-b border-gray-100 pb-3 last:border-0">
                <div className="flex items-center gap-2 text-[11px] text-gray-500 mb-1">
                  {getFieldIcon(field.type)}
                  <span className="font-medium">{field.name}</span>
                  {field.required && (
                    <span className="text-[9px] text-red-500 font-medium">REQUIRED</span>
                  )}
                </div>
                {field.description && (
                  <p className="text-[10px] text-gray-500 pl-5 mb-1">{field.description}</p>
                )}
                <div className="text-[12px] pl-5">
                  {formatFieldValue(field, card[field.id])}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
      
      {/* Relationships Section */}
      {card.relationships && card.relationships.length > 0 && (
        <section className="mb-8">
          <h3 className="text-[14px] font-semibold text-gray-900 mb-4">
            Relationships
          </h3>
          <div className="space-y-2">
            {card.relationships.map((rel) => (
              <div key={rel.id} className="flex items-center gap-2 text-[12px]">
                <span className="text-gray-500">{rel.type}:</span>
                <span className="text-gray-700">{rel.title}</span>
              </div>
            ))}
          </div>
        </section>
      )}
      
      {/* Raw Data Preview (Development Helper) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-8 border-t border-gray-200 pt-4">
          <summary className="text-[11px] text-gray-500 cursor-pointer">
            View Raw Data (Dev Only)
          </summary>
          <pre className="mt-2 text-[10px] text-gray-600 bg-gray-50 p-3 rounded overflow-x-auto">
            {JSON.stringify(card, null, 2)}
          </pre>
        </details>
      )}
    </div>
  )
}