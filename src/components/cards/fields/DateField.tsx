import React, { useState } from 'react'
import { Calendar } from 'lucide-react'

interface DateFieldProps {
  value: string
  onChange: (value: string) => void
  required?: boolean
  placeholder?: string
}

export function DateField({ value, onChange, required, placeholder }: DateFieldProps) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        <Calendar size={14} className="text-gray-400" />
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="input flex-1"
          onFocus={() => setIsEditing(true)}
          onBlur={() => setIsEditing(false)}
        />
      </div>
    </div>
  )
}