'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import TemplateBank from '@/components/template-bank/TemplateBank'

export default function TemplateBankPage() {
  const params = useParams()
  const strategyId = params?.id as string

  return (
    <div className="h-screen bg-gray-50">
      <TemplateBank strategyId={strategyId} />
    </div>
  )
}
