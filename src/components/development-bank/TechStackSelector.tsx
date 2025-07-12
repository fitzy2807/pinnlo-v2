'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Lightbulb, 
  Zap,
  RefreshCw,
  Star,
  TrendingUp,
  DollarSign,
  Users,
  Clock
} from 'lucide-react'
import { useAuth } from '@/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import { DevelopmentBankService, type TechStackSelection } from '@/services/developmentBankService'

interface TechStackSelectorProps {
  strategyId: string
  selectedTechStack: TechStackSelection | null
  onTechStackGenerated: (techStack: TechStackSelection) => void
}

interface DiagnosticAnswers {
  companySize: 'startup' | 'growth' | 'enterprise'
  budget: 'minimal' | 'moderate' | 'substantial' | 'enterprise'
  teamSize: string
  existingSkills: string[]
  projectTypes: string[]
  features: string[]
  hasRealtime: boolean
  hasAuth: boolean
  hasPayments: boolean
  scalability: boolean
  performance: 'standard' | 'high' | 'extreme'
  timeframe: 'weeks' | 'months' | 'quarters'
}

const initialAnswers: DiagnosticAnswers = {
  companySize: 'startup',
  budget: 'minimal',
  teamSize: '',
  existingSkills: [],
  projectTypes: [],
  features: [],
  hasRealtime: false,
  hasAuth: false,
  hasPayments: false,
  scalability: false,
  performance: 'standard',
  timeframe: 'months'
}

export default function TechStackSelector({ 
  strategyId, 
  selectedTechStack, 
  onTechStackGenerated 
}: TechStackSelectorProps) {
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState<DiagnosticAnswers>(initialAnswers)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<TechStackSelection[]>([])

  const maxStep = 4

  const updateAnswer = useCallback((key: keyof DiagnosticAnswers, value: any) => {
    setAnswers(prev => ({ ...prev, [key]: value }))
  }, [])

  const toggleArrayValue = useCallback((key: keyof DiagnosticAnswers, value: string) => {
    setAnswers(prev => {
      const currentArray = prev[key] as string[]
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value]
      return { ...prev, [key]: newArray }
    })
  }, [])

  const generateRecommendations = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      // Get session for auth
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      if (!session) throw new Error('No session')
      // Map budget to numeric values
      const budgetMapping = {
        minimal: { min: 0, max: 100 },
        moderate: { min: 100, max: 1000 },
        substantial: { min: 1000, max: 5000 },
        enterprise: { min: 5000, max: 20000 }
      }

      const requestBody = {
        strategyId: Number(strategyId),
        companyProfile: {
          size: answers.companySize,
          budget: {
            ...budgetMapping[answers.budget],
            currency: 'USD'
          },
          teamSize: parseInt(answers.teamSize) || 1,
          existingSkills: answers.existingSkills
        },
        projectRequirements: {
          projectType: answers.projectTypes,
          features: answers.features,
          constraints: {
            hasRealtime: answers.hasRealtime,
            hasAuth: answers.hasAuth,
            hasPayments: answers.hasPayments,
            scalability: answers.scalability,
            performance: answers.performance,
            compliance: []
          }
        },
        options: {
          count: 3,
          format: 'detailed'
        }
      }

      console.log('🚀 Requesting tech stack recommendations with:', requestBody)

      const response = await fetch('/api/development-bank/generate-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to generate recommendations: ${response.status}`)
      }

      const result = await response.json()
      console.log('✅ Received recommendations:', result)

      if (result.success && result.recommendations) {
        setRecommendations(result.recommendations)
        setStep(maxStep + 1) // Go to recommendations view
      } else {
        throw new Error(result.error || 'No recommendations received')
      }
    } catch (err) {
      console.error('❌ Error generating recommendations:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate recommendations')
    } finally {
      setLoading(false)
    }
  }, [user, strategyId, answers])

  const selectTechStack = useCallback(async (techStack: TechStackSelection) => {
    try {
      setLoading(true)
      onTechStackGenerated(techStack)
      setStep(1) // Reset to start
      setAnswers(initialAnswers)
      setRecommendations([])
    } catch (err) {
      setError('Failed to select tech stack')
    } finally {
      setLoading(false)
    }
  }, [onTechStackGenerated])

  const restart = useCallback(() => {
    setStep(1)
    setAnswers(initialAnswers)
    setRecommendations([])
    setError(null)
  }, [])

  if (selectedTechStack && step <= maxStep) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-green-900">
                  Tech Stack Selected: {selectedTechStack.stack_name}
                </h3>
                <p className="text-green-700">
                  Ready to generate specifications and code assets
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-4">Current Tech Stack Overview</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(selectedTechStack.layers || {}).map(([layer, choices]) => (
                <div key={layer} className="border border-gray-200 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 capitalize mb-2">{layer}</h5>
                  <div className="space-y-2">
                    {(choices as any[]).map((choice: any, index: number) => (
                      <div key={index} className="text-sm">
                        <div className="font-medium text-gray-700">{choice.product}</div>
                        <div className="text-gray-500">{choice.vendor}</div>
                        {choice.pricing && (
                          <div className="text-xs text-green-600">
                            ${choice.pricing.monthlyCost}/mo
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={restart}
                className="px-6 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Generate New Recommendations</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {Math.min(step, maxStep)} of {maxStep}
            </span>
            <span className="text-sm text-gray-500">
              {step > maxStep ? 'Recommendations' : 'Diagnostic Questions'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((step / maxStep) * 100, 100)}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Step Content */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Company Profile</h2>
              <p className="text-gray-600">Tell us about your organization to get personalized recommendations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Company Size</label>
                <div className="space-y-2">
                  {[
                    { value: 'startup', label: 'Startup', desc: '1-10 employees' },
                    { value: 'growth', label: 'Growth', desc: '11-100 employees' },
                    { value: 'enterprise', label: 'Enterprise', desc: '100+ employees' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => updateAnswer('companySize', option.value)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        answers.companySize === option.value
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Monthly Budget</label>
                <div className="space-y-2">
                  {[
                    { value: 'minimal', label: 'Minimal', desc: '$0-100/month' },
                    { value: 'moderate', label: 'Moderate', desc: '$100-1,000/month' },
                    { value: 'substantial', label: 'Substantial', desc: '$1,000-5,000/month' },
                    { value: 'enterprise', label: 'Enterprise', desc: '$5,000+/month' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => updateAnswer('budget', option.value)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        answers.budget === option.value
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Team Size</label>
              <input
                type="number"
                min="1"
                max="1000"
                value={answers.teamSize}
                onChange={(e) => updateAnswer('teamSize', e.target.value)}
                placeholder="Number of developers"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Technical Expertise</h2>
              <p className="text-gray-600">What technologies does your team already know?</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Existing Skills</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {[
                  'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'PHP', 'Go', 'Rust',
                  'React', 'Vue.js', 'Angular', 'Svelte', 'Node.js', 'Express', 'Django', 'Rails',
                  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'AWS', 'Azure', 'GCP', 'Docker'
                ].map(skill => (
                  <button
                    key={skill}
                    onClick={() => toggleArrayValue('existingSkills', skill)}
                    className={`p-2 text-sm rounded-md border transition-colors ${
                      answers.existingSkills.includes(skill)
                        ? 'border-blue-300 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Requirements</h2>
              <p className="text-gray-600">What type of application are you building?</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Project Types</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'Web Application', 'Mobile App', 'API/Backend', 'E-commerce',
                  'SaaS Platform', 'Dashboard/Analytics', 'CMS', 'Social Platform'
                ].map(type => (
                  <button
                    key={type}
                    onClick={() => toggleArrayValue('projectTypes', type)}
                    className={`p-3 text-left rounded-lg border transition-colors ${
                      answers.projectTypes.includes(type)
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Key Features</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'User Authentication', 'Real-time Updates', 'Payment Processing', 'File Uploads',
                  'Search Functionality', 'Notifications', 'Analytics', 'Third-party Integrations'
                ].map(feature => (
                  <button
                    key={feature}
                    onClick={() => toggleArrayValue('features', feature)}
                    className={`p-3 text-left rounded-lg border transition-colors ${
                      answers.features.includes(feature)
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {feature}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Technical Requirements</h2>
              <p className="text-gray-600">Define your performance and scalability needs.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Performance Requirements</label>
                <div className="space-y-2">
                  {[
                    { value: 'standard', label: 'Standard', desc: 'Good enough for most use cases' },
                    { value: 'high', label: 'High Performance', desc: 'Fast response times critical' },
                    { value: 'extreme', label: 'Extreme Performance', desc: 'Sub-100ms response times' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => updateAnswer('performance', option.value)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        answers.performance === option.value
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Timeline</label>
                <div className="space-y-2">
                  {[
                    { value: 'weeks', label: 'Weeks', desc: 'MVP in 2-8 weeks' },
                    { value: 'months', label: 'Months', desc: 'Full product in 3-6 months' },
                    { value: 'quarters', label: 'Quarters', desc: 'Long-term development' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => updateAnswer('timeframe', option.value)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        answers.timeframe === option.value
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Special Requirements</label>
              <div className="space-y-3">
                {[
                  { key: 'hasRealtime', label: 'Real-time Features', desc: 'Live updates, chat, collaboration' },
                  { key: 'hasAuth', label: 'User Authentication', desc: 'Login, registration, user management' },
                  { key: 'hasPayments', label: 'Payment Processing', desc: 'Stripe, PayPal, subscriptions' },
                  { key: 'scalability', label: 'High Scalability', desc: 'Support for rapid growth' }
                ].map(req => (
                  <button
                    key={req.key}
                    onClick={() => updateAnswer(req.key as keyof DiagnosticAnswers, !answers[req.key as keyof DiagnosticAnswers])}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      answers[req.key as keyof DiagnosticAnswers]
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{req.label}</div>
                        <div className="text-sm text-gray-500">{req.desc}</div>
                      </div>
                      {answers[req.key as keyof DiagnosticAnswers] && (
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recommendations Display */}
        {step > maxStep && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">AI-Generated Recommendations</h2>
              <p className="text-gray-600">Based on your requirements, here are our top tech stack recommendations.</p>
            </div>

            {loading && (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Generating personalized recommendations...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
              </div>
            )}

            {!loading && recommendations.length > 0 && (
              <div className="grid gap-6">
                {recommendations.map((rec, index) => (
                  <div key={rec.id || index} className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${
                                i < Math.floor((rec.metadata?.confidenceScore || 0) * 5) 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-300'
                              }`} 
                            />
                          ))}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">{rec.stack_name}</h3>
                        {index === 0 && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded">
                            Recommended
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4" />
                          <span>${rec.metadata?.totalMonthlyCost || 0}/mo</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="w-4 h-4" />
                          <span>{Math.round((rec.metadata?.confidenceScore || 0) * 100)}% match</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      {Object.entries(rec.layers || {}).map(([layer, choices]) => (
                        <div key={layer} className="bg-gray-50 rounded-lg p-3">
                          <h4 className="font-medium text-gray-900 capitalize mb-2">{layer}</h4>
                          <div className="space-y-1">
                            {(choices as any[]).map((choice: any, choiceIndex: number) => (
                              <div key={choiceIndex} className="text-sm">
                                <div className="font-medium text-gray-700">{choice.product}</div>
                                <div className="text-gray-500 text-xs">{choice.vendor}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {rec.metadata && (
                      <div className="space-y-2 mb-4">
                        {rec.metadata.strengths && (
                          <div>
                            <h5 className="font-medium text-green-800 mb-1">Strengths</h5>
                            <ul className="text-sm text-green-700 space-y-1">
                              {rec.metadata.strengths.map((strength: string, i: number) => (
                                <li key={i} className="flex items-start space-x-1">
                                  <span className="text-green-500 mt-1">•</span>
                                  <span>{strength}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {rec.metadata.considerations && (
                          <div>
                            <h5 className="font-medium text-yellow-800 mb-1">Considerations</h5>
                            <ul className="text-sm text-yellow-700 space-y-1">
                              {rec.metadata.considerations.map((consideration: string, i: number) => (
                                <li key={i} className="flex items-start space-x-1">
                                  <span className="text-yellow-500 mt-1">•</span>
                                  <span>{consideration}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex justify-end">
                      <button
                        onClick={() => selectTechStack(rec)}
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                      >
                        <span>Select This Stack</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && recommendations.length === 0 && (
              <div className="text-center py-12">
                <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Recommendations Yet</h3>
                <p className="text-gray-600 mb-4">Click generate to get AI-powered tech stack recommendations.</p>
                <button
                  onClick={generateRecommendations}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  <Zap className="w-5 h-5" />
                  <span>Generate Recommendations</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-8 border-t border-gray-200">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {step < maxStep ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : step === maxStep ? (
            <button
              onClick={generateRecommendations}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              <Zap className="w-5 h-5" />
              <span>{loading ? 'Generating...' : 'Generate Recommendations'}</span>
            </button>
          ) : (
            <button
              onClick={restart}
              className="px-6 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Start Over</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}