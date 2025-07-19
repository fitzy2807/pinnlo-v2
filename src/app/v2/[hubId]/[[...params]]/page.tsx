'use client'

import { useParams } from 'next/navigation'
import UnifiedLayout from '@/components/v2/unified/UnifiedLayout'

export default function UnifiedPage() { 
  const params = useParams()
  const hubId = params.hubId as string
  const sectionId = params.params?.[0] as string

  return (
    <UnifiedLayout 
      hubId={hubId || 'home'} 
      sectionId={sectionId || 'default'} 
    />
  )
}