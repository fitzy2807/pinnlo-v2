'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import { useAuth } from '@/providers/AuthProvider'
import { ChevronDown, ChevronRight } from 'lucide-react'

export default function HomePage() {
  const { user } = useAuth()
  const [executiveSummaryOpen, setExecutiveSummaryOpen] = useState(false)
  const [intelligenceHubOpen, setIntelligenceHubOpen] = useState(false)
  const [strategyHubOpen, setStrategyHubOpen] = useState(false)
  const [organisationHubOpen, setOrganisationHubOpen] = useState(false)
  const [developmentHubOpen, setDevelopmentHubOpen] = useState(false)
  const [documentHubOpen, setDocumentHubOpen] = useState(false)
  const [agentHubOpen, setAgentHubOpen] = useState(false)

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getDisplayName = (email: string) => {
    const name = email.split('@')[0]
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-16 p-4">
        <div className="w-[90%] h-[90vh] mx-auto bg-white rounded-xl shadow-lg p-8 flex">
          {/* Main Content Area */}
          <div className="flex-1 pr-6">
            {/* Welcome Message */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-normal text-gray-900 tracking-tight" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                {getGreeting()}, {user?.email ? getDisplayName(user.email) : 'User'}! 👋
              </h1>
            </div>
            
            {/* Hub Overview Row */}
            <div className="grid grid-cols-6 gap-3 mb-8">
              {/* Intelligence Hub */}
              <div className="bg-blue-50 rounded-lg shadow-sm p-3 border border-blue-100">
                <h3 className="text-xs font-bold text-blue-800 mb-1" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                  Intelligence Hub
                </h3>
                <p className="text-[10px] text-blue-600 mb-2" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                  23 cards
                </p>
                <div className="text-[10px] text-blue-700" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                  Quality: 8/10
                </div>
              </div>

              {/* Strategy Hub */}
              <div className="bg-purple-50 rounded-lg shadow-sm p-3 border border-purple-100">
                <h3 className="text-xs font-bold text-purple-800 mb-1" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                  Strategy Hub
                </h3>
                <p className="text-[10px] text-purple-600 mb-2" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                  15 cards
                </p>
                <div className="text-[10px] text-purple-700" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                  Quality: 6/10
                </div>
              </div>

              {/* Organisation Hub */}
              <div className="bg-green-50 rounded-lg shadow-sm p-3 border border-green-100">
                <h3 className="text-xs font-bold text-green-800 mb-1" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                  Organisation Hub
                </h3>
                <p className="text-[10px] text-green-600 mb-2" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                  11 cards
                </p>
                <div className="text-[10px] text-green-700" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                  Quality: 7/10
                </div>
              </div>

              {/* Development Hub */}
              <div className="bg-orange-50 rounded-lg shadow-sm p-3 border border-orange-100">
                <h3 className="text-xs font-bold text-orange-800 mb-1" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                  Development Hub
                </h3>
                <p className="text-[10px] text-orange-600 mb-2" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                  34 cards
                </p>
                <div className="text-[10px] text-orange-700" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                  Quality: 4/10
                </div>
              </div>

              {/* Document Hub */}
              <div className="bg-gray-50 rounded-lg shadow-sm p-3 border border-gray-100">
                <h3 className="text-xs font-bold text-gray-800 mb-1" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                  Document Hub
                </h3>
                <p className="text-[10px] text-gray-600 mb-2" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                  18 cards
                </p>
                <div className="text-[10px] text-gray-700" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                  Quality: 9/10
                </div>
              </div>

              {/* Agent Hub */}
              <div className="bg-red-50 rounded-lg shadow-sm p-3 border border-red-100">
                <h3 className="text-xs font-bold text-red-800 mb-1" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                  Agent Hub
                </h3>
                <p className="text-[10px] text-red-600 mb-2" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                  7 cards
                </p>
                <div className="text-[10px] text-red-700" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                  Quality: 5/10
                </div>
              </div>
            </div>

            {/* Executive Summary Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
              <button
                onClick={() => setExecutiveSummaryOpen(!executiveSummaryOpen)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <h2 className="text-base font-medium text-gray-900" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                  Executive Summary
                </h2>
                {executiveSummaryOpen ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </button>

              <div className={`overflow-hidden transition-all duration-500 ease-in-out ${executiveSummaryOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-4 pb-4 space-y-3">
                  {/* Intelligence Hub Summary */}
                  <div className="border-l-4 border-blue-200 bg-blue-50 rounded-r-lg">
                    <button
                      onClick={() => setIntelligenceHubOpen(!intelligenceHubOpen)}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-blue-100 transition-colors"
                    >
                      <h3 className="text-xs font-bold text-blue-800" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                        Intelligence Hub Summary
                      </h3>
                      {intelligenceHubOpen ? (
                        <ChevronDown className="w-3 h-3 text-blue-400" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-blue-400" />
                      )}
                    </button>
                    <div className="px-3 pb-2">
                      <p className="text-[10px] text-blue-700" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                        Market intelligence shows strong competitive positioning with emerging AI fitness trends.
                      </p>
                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${intelligenceHubOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="mt-2 text-[10px] text-blue-600 leading-relaxed" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                          Comprehensive analysis reveals 340% growth in AI-powered fitness applications, with key competitor pricing gaps identified. User behavior data indicates strong demand for personalized workout experiences. Market penetration opportunities exist in the 25-35 demographic with disposable income above $75k annually.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Strategy Hub Summary */}
                  <div className="border-l-4 border-purple-200 bg-purple-50 rounded-r-lg">
                    <button
                      onClick={() => setStrategyHubOpen(!strategyHubOpen)}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-purple-100 transition-colors"
                    >
                      <h3 className="text-xs font-bold text-purple-800" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                        Strategy Hub Summary
                      </h3>
                      {strategyHubOpen ? (
                        <ChevronDown className="w-3 h-3 text-purple-400" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-purple-400" />
                      )}
                    </button>
                    <div className="px-3 pb-2">
                      <p className="text-[10px] text-purple-700" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                        Core strategy framework established but requires refinement in go-to-market approach.
                      </p>
                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${strategyHubOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="mt-2 text-[10px] text-purple-600 leading-relaxed" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                          Vision and mission statements are well-defined with clear value propositions. Business model canvas shows potential revenue streams through freemium subscriptions and premium coaching services. Key risk areas include user acquisition costs and competitive response strategies that need immediate attention.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Organisation Hub Summary */}
                  <div className="border-l-4 border-green-200 bg-green-50 rounded-r-lg">
                    <button
                      onClick={() => setOrganisationHubOpen(!organisationHubOpen)}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-green-100 transition-colors"
                    >
                      <h3 className="text-xs font-bold text-green-800" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                        Organisation Hub Summary
                      </h3>
                      {organisationHubOpen ? (
                        <ChevronDown className="w-3 h-3 text-green-400" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-green-400" />
                      )}
                    </button>
                    <div className="px-3 pb-2">
                      <p className="text-[10px] text-green-700" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                        Team structure is well-defined with clear roles and accountability frameworks in place.
                      </p>
                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${organisationHubOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="mt-2 text-[10px] text-green-600 leading-relaxed" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                          Stakeholder mapping shows strong executive buy-in and clear decision-making hierarchies. Team capacity analysis indicates sufficient resources for Q1 deliverables. Communication frameworks and meeting cadences are established, with quarterly OKRs aligned across all departments.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Development Hub Summary */}
                  <div className="border-l-4 border-orange-200 bg-orange-50 rounded-r-lg">
                    <button
                      onClick={() => setDevelopmentHubOpen(!developmentHubOpen)}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-orange-100 transition-colors"
                    >
                      <h3 className="text-xs font-bold text-orange-800" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                        Development Hub Summary
                      </h3>
                      {developmentHubOpen ? (
                        <ChevronDown className="w-3 h-3 text-orange-400" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-orange-400" />
                      )}
                    </button>
                    <div className="px-3 pb-2">
                      <p className="text-[10px] text-orange-700" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                        Technical foundation requires significant improvements before MVP launch readiness.
                      </p>
                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${developmentHubOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="mt-2 text-[10px] text-orange-600 leading-relaxed" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                          Architecture decisions are documented but implementation is behind schedule. Critical dependencies include user authentication system, data analytics pipeline, and mobile app optimization. Technical debt accumulating in legacy integrations requires immediate refactoring attention.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Document Hub Summary */}
                  <div className="border-l-4 border-gray-200 bg-gray-50 rounded-r-lg">
                    <button
                      onClick={() => setDocumentHubOpen(!documentHubOpen)}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-100 transition-colors"
                    >
                      <h3 className="text-xs font-bold text-gray-800" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                        Document Hub Summary
                      </h3>
                      {documentHubOpen ? (
                        <ChevronDown className="w-3 h-3 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-gray-400" />
                      )}
                    </button>
                    <div className="px-3 pb-2">
                      <p className="text-[10px] text-gray-700" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                        Documentation standards are exemplary with comprehensive coverage across all domains.
                      </p>
                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${documentHubOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="mt-2 text-[10px] text-gray-600 leading-relaxed" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                          All critical processes are documented with version control and regular updates. Knowledge management system includes technical specifications, user guides, and operational procedures. Documentation quality scores consistently above 9/10 with stakeholder feedback integration processes established.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Agent Hub Summary */}
                  <div className="border-l-4 border-red-200 bg-red-50 rounded-r-lg">
                    <button
                      onClick={() => setAgentHubOpen(!agentHubOpen)}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-red-100 transition-colors"
                    >
                      <h3 className="text-xs font-bold text-red-800" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                        Agent Hub Summary
                      </h3>
                      {agentHubOpen ? (
                        <ChevronDown className="w-3 h-3 text-red-400" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-red-400" />
                      )}
                    </button>
                    <div className="px-3 pb-2">
                      <p className="text-[10px] text-red-700" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                        AI agent capabilities are emerging but require enhanced training and integration workflows.
                      </p>
                      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${agentHubOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="mt-2 text-[10px] text-red-600 leading-relaxed" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                          Current agents handle basic task automation and data analysis. Advanced capabilities including natural language processing and predictive analytics are in development. Integration with existing systems shows promise but reliability needs improvement before production deployment.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Promotional Containers */}
            <div className="grid grid-cols-2 gap-4">
              {/* Templates Hub */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 p-4 hover:shadow-md transition-all duration-300 cursor-pointer group">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <button className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-200 px-3 py-1 rounded-full transition-all duration-200 group-hover:bg-blue-200" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                    Visit Hub
                  </button>
                </div>
                <h3 className="text-xs font-bold text-blue-800 mb-2" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                  Templates
                </h3>
                <p className="text-[10px] text-blue-700 leading-relaxed" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                  Access pre-built strategic frameworks and templates to accelerate your planning process. From business model canvases to competitive analysis templates, jumpstart your strategy with proven methodologies.
                </p>
              </div>

              {/* Learning Modules */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-sm border border-purple-200 p-4 hover:shadow-md transition-all duration-300 cursor-pointer group">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <button className="text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-200 px-3 py-1 rounded-full transition-all duration-200 group-hover:bg-purple-200" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                    Learn Now
                  </button>
                </div>
                <h3 className="text-xs font-bold text-purple-800 mb-2" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                  Learning Modules
                </h3>
                <p className="text-[10px] text-purple-700 leading-relaxed" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                  Master strategic planning through interactive learning modules and expert-led content. Enhance your skills with courses on market analysis, competitive intelligence, and strategic execution methodologies.
                </p>
              </div>

              {/* Agent Now/Next */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-sm border border-green-200 p-4 hover:shadow-md transition-all duration-300 cursor-pointer group">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <button className="text-xs text-green-600 hover:text-green-700 hover:bg-green-200 px-3 py-1 rounded-full transition-all duration-200 group-hover:bg-green-200" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                    Discover AI
                  </button>
                </div>
                <h3 className="text-xs font-bold text-green-800 mb-2" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                  Agent Now / Next
                </h3>
                <p className="text-[10px] text-green-700 leading-relaxed" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                  Discover how AI agents can transform your strategic planning workflow. From automated market research to intelligent task prioritization, learn how AI can amplify your decision-making capabilities.
                </p>
              </div>

              {/* Integrations */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow-sm border border-orange-200 p-4 hover:shadow-md transition-all duration-300 cursor-pointer group">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-orange-500 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <button className="text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-200 px-3 py-1 rounded-full transition-all duration-200 group-hover:bg-orange-200" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                    View All
                  </button>
                </div>
                <h3 className="text-xs font-bold text-orange-800 mb-2" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                  Integrations
                </h3>
                <p className="text-[10px] text-orange-700 leading-relaxed" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                  Connect with your favorite tools and platforms. Seamlessly integrate with Slack, Google Workspace, Microsoft Teams, Notion, and 50+ other platforms to centralize your strategic planning ecosystem.
                </p>
              </div>
            </div>
          </div>

          {/* PINNLO Actions Modal */}
          <div className="w-1/4 bg-gray-50 rounded-xl shadow-md p-4 overflow-y-auto">
            <h2 className="text-base font-medium text-gray-900 mb-4 text-center" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
              PINNLO Actions
            </h2>
            
            <div className="space-y-2">
              {[
                { title: "Market Analysis Review", description: "Review Q1 strategy updates and market positioning data for upcoming planning cycle" },
                { title: "Competitor Intelligence", description: "Complete pricing analysis card with latest competitive data and market insights" },
                { title: "User Persona Update", description: "Update research findings based on recent customer interviews and behavioral data" },
                { title: "Technical Requirements", description: "Finalize mobile app technical specifications and development constraints" },
                { title: "Development Roadmap", description: "Review and approve quarterly development milestones and resource allocation" },
                { title: "OKR Planning", description: "Create measurable objectives and key results for next quarter strategic goals" },
                { title: "Customer Feedback Analysis", description: "Analyze recent survey responses and identify actionable improvement opportunities" },
                { title: "SWOT Analysis Update", description: "Update strategic analysis with new market data and competitive intelligence" },
                { title: "Stakeholder Mapping", description: "Review documentation for key decision makers and influence relationships" },
                { title: "Risk Assessment", description: "Complete risk evaluation for new feature development and market expansion" },
                { title: "Business Model Review", description: "Update canvas components based on recent market validation and customer feedback" },
                { title: "Capacity Planning", description: "Review team resources and availability for upcoming project deliverables" },
                { title: "Go-to-Market Strategy", description: "Finalize presentation materials for product launch and marketing campaigns" },
                { title: "User Journey Mapping", description: "Complete customer experience flow documentation and optimization opportunities" },
                { title: "Competitive Positioning", description: "Review and update market positioning strategy based on competitor analysis" }
              ].map((action, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-3 border border-gray-100 flex items-center gap-3">
                  <div className="flex-1">
                    <h3 className="text-xs font-bold text-gray-800 mb-1" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                      {action.title}
                    </h3>
                    <p className="text-[10px] text-gray-600 leading-relaxed" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                      {action.description}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button className="text-[10px] text-green-600 hover:text-green-700 hover:bg-green-50 px-2 py-1 rounded transition-all duration-200" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                      Accept
                    </button>
                    <button className="text-[10px] text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-all duration-200" style={{ fontFamily: 'ui-rounded, SF Pro Rounded, system-ui, sans-serif' }}>
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}