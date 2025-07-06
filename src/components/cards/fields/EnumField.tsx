import React from 'react'
import { ChevronDown } from 'lucide-react'

interface EnumFieldProps {
  value: string
  options: string[]
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
}

export function EnumField({ value, options, onChange, placeholder, required }: EnumFieldProps) {
  // Ensure value is always a string
  const stringValue = Array.isArray(value) ? value[0] || '' : String(value || '')
  
  return (
    <div className="relative">
      <select
        value={stringValue}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="input appearance-none pr-8"
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  )
}