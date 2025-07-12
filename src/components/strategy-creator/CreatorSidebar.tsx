'use client'

import React from 'react'
import { 
  Target, 
  Layers, 
  Brain, 
  FileText, 
  Sparkles,
  CheckCircle2,
  Circle
} from 'lucide-react'

interface CreatorSidebarProps {
  currentStep: number
  completedSteps: number[]
  onStepClick: (step: number) => void
}

const steps = [
  { number: 1, label: 'Context Selection', icon: Target },
  { number: 2, label: 'Context Summary', icon: FileText },
  { number: 3, label: 'Target Blueprint', icon: Sparkles },
  { number: 4, label: 'Review & Create', icon: CheckCircle2 }
]

export default function CreatorSidebar({ 
  currentStep, 
  completedSteps, 
  onStepClick 
}: CreatorSidebarProps) {
  const isStepAccessible = (stepNumber: number) => {
    if (stepNumber === 1) return true
    if (stepNumber <= currentStep) return true
    if (completedSteps.includes(stepNumber - 1)) return true
    return false
  }

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 p-6">
      <div className="space-y-1">
        {steps.map((step) => {
          const isActive = currentStep === step.number
          const isCompleted = completedSteps.includes(step.number)
          const isAccessible = isStepAccessible(step.number)
          const Icon = step.icon

          return (
            <button
              key={step.number}
              onClick={() => isAccessible && onStepClick(step.number)}
              disabled={!isAccessible}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                ${isActive 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : isAccessible
                    ? 'hover:bg-gray-100 text-gray-700'
                    : 'text-gray-400 cursor-not-allowed'
                }
              `}
            >
              <div className="relative">
                {isCompleted ? (
                  <CheckCircle2 size={20} className="text-green-600" />
                ) : (
                  <Icon size={20} />
                )}
              </div>
              
              <div className="flex-1 text-left">
                <div className="text-xs font-medium">Step {step.number}</div>
                <div className={`text-sm ${isActive ? 'font-medium' : ''}`}>
                  {step.label}
                </div>
              </div>

              {isActive && (
                <Circle size={8} className="fill-current" />
              )}
            </button>
          )
        })}
      </div>

      {/* Progress Indicator */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <div className="text-xs text-gray-500 mb-2">Progress</div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedSteps.length / 4) * 100}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {completedSteps.length} of 4 steps completed
        </div>
      </div>
    </div>
  )
}