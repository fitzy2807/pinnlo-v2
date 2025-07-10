import React, { useState, useEffect } from 'react';
import { ChevronRight, Check, Save, Building2, Target, Users, TrendingUp, Code, AlertTriangle, Lightbulb, BarChart3, MessageSquare, X, Loader2 } from 'lucide-react';
import { saveIntelligenceProfile, loadIntelligenceProfile } from '@/lib/intelligence-api';

interface IntelligenceProfileProps {
  // No props needed - Intelligence Bank is now global
}

const IntelligenceProfile = () => {
  const [activeSection, setActiveSection] = useState('business-context');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  const [formData, setFormData] = useState({
    businessModel: [],
    industrySector: [],
    stageOfGrowth: '',
    strategicHorizon: '',
    primaryStrategicGoals: [],
    targetGeographies: [],
    marketType: '',
    marketInsightsPriority: [],
    preferredSources: [],
    directCompetitors: [],
    watchCategories: [],
    businessModelMatch: '',
    competitiveIntensity: '',
    designTrends: [],
    behaviouralTrends: [],
    contentMediaTrends: [],
    relevantTimeframe: '',
    techCategories: [],
    specificTechnologies: [],
    adoptionStrategy: '',
    techStackBias: [],
    internalStakeholders: [],
    strategicThemes: [],
    governancePriority: '',
    feedbackChannels: [],
    topUserFrictions: [],
    personasOfInterest: [],
    behaviourTriggers: [],
    riskTypes: [],
    complianceFrameworks: [],
    jurisdictionalFocus: [],
    riskAppetite: '',
    opportunityCategories: [],
    innovationAppetite: '',
    linkedProblems: []
  });

  // Load profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await loadIntelligenceProfile();
        
        if (response.success && response.data) {
          setProfileExists(response.exists);
          
          // Only update form data with non-null values from the loaded profile
          const loadedData = response.data;
          setFormData(prev => ({
            businessModel: loadedData.businessModel || [],
            industrySector: loadedData.industrySector || [],
            stageOfGrowth: loadedData.stageOfGrowth || '',
            strategicHorizon: loadedData.strategicHorizon || '',
            primaryStrategicGoals: loadedData.primaryStrategicGoals || [],
            targetGeographies: loadedData.targetGeographies || [],
            marketType: loadedData.marketType || '',
            marketInsightsPriority: loadedData.marketInsightsPriority || [],
            preferredSources: loadedData.preferredSources || [],
            directCompetitors: loadedData.directCompetitors || [],
            watchCategories: loadedData.watchCategories || [],
            businessModelMatch: loadedData.businessModelMatch || '',
            competitiveIntensity: loadedData.competitiveIntensity || '',
            designTrends: loadedData.designTrends || [],
            behaviouralTrends: loadedData.behaviouralTrends || [],
            contentMediaTrends: loadedData.contentMediaTrends || [],
            relevantTimeframe: loadedData.relevantTimeframe || '',
            techCategories: loadedData.techCategories || [],
            specificTechnologies: loadedData.specificTechnologies || [],
            adoptionStrategy: loadedData.adoptionStrategy || '',
            techStackBias: loadedData.techStackBias || [],
            internalStakeholders: loadedData.internalStakeholders || [],
            strategicThemes: loadedData.strategicThemes || [],
            governancePriority: loadedData.governancePriority || '',
            feedbackChannels: loadedData.feedbackChannels || [],
            topUserFrictions: loadedData.topUserFrictions || [],
            personasOfInterest: loadedData.personasOfInterest || [],
            behaviourTriggers: loadedData.behaviourTriggers || [],
            riskTypes: loadedData.riskTypes || [],
            complianceFrameworks: loadedData.complianceFrameworks || [],
            jurisdictionalFocus: loadedData.jurisdictionalFocus || [],
            riskAppetite: loadedData.riskAppetite || '',
            opportunityCategories: loadedData.opportunityCategories || [],
            innovationAppetite: loadedData.innovationAppetite || '',
            linkedProblems: loadedData.linkedProblems || []
          }));
          
          if (response.exists) {
            setLastSaved(new Date());
          }
        }
      } catch (error) {
        console.error('Error loading intelligence profile:', error);
        // Don't show error alert on load, just log it
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []); // No dependencies needed for global profile

  const sections = [
    { id: 'business-context', title: 'Business Context', icon: Building2, emoji: '🏢' },
    { id: 'market-focus', title: 'Market Focus', icon: BarChart3, emoji: '📊' },
    { id: 'competitor-focus', title: 'Competitor Focus', icon: Target, emoji: '🆚' },
    { id: 'trends', title: 'Trends', icon: TrendingUp, emoji: '📈' },
    { id: 'technology-signals', title: 'Technology Signals', icon: Code, emoji: '🧪' },
    { id: 'stakeholder-alignment', title: 'Stakeholder Alignment', icon: Users, emoji: '🧑‍💼' },
    { id: 'consumer-insights', title: 'Consumer Insights', icon: MessageSquare, emoji: '🧑‍💬' },
    { id: 'risk', title: 'Risk', icon: AlertTriangle, emoji: '⚠️' },
    { id: 'opportunities', title: 'Opportunities', icon: Lightbulb, emoji: '💡' }
  ];

  const handleMultiSelect = (field, value) => {
    const current = formData[field] || [];
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];
    setFormData(prev => ({ ...prev, [field]: updated }));
    setHasUnsavedChanges(true);
  };

  const handleSingleSelect = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleTagInput = (field, value) => {
    if (value.trim()) {
      const current = formData[field] || [];
      if (!current.includes(value.trim())) {
        setFormData(prev => ({ ...prev, [field]: [...current, value.trim()] }));
        setHasUnsavedChanges(true);
      }
    }
  };

  const removeTag = (field, value) => {
    const current = formData[field] || [];
    setFormData(prev => ({ ...prev, [field]: current.filter(item => item !== value) }));
    setHasUnsavedChanges(true);
  };

  // Blueprint card style component for multi-select options
  const OptionCard = ({ value, isSelected, onClick, description, badge }) => (
    <div
      onClick={() => onClick(value)}
      className={`relative p-2 rounded-md border cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'bg-blue-50 border-blue-300 shadow-sm'
          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      {badge && (
        <div className="absolute top-1 right-1">
          <span className="inline-flex items-center px-1 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
            {badge}
          </span>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className={`text-xs font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
            {value}
          </h4>
          {description && (
            <p className={`text-xs mt-0.5 ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
              {description}
            </p>
          )}
        </div>
        {isSelected && (
          <Check className="w-3 h-3 text-blue-600 ml-1 flex-shrink-0" />
        )}
      </div>
    </div>
  );

  // Single select card component
  const SingleSelectCard = ({ value, isSelected, onClick, description }) => (
    <div
      onClick={() => onClick(value)}
      className={`relative p-2 rounded-md border cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'bg-green-50 border-green-300 shadow-sm'
          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className={`text-xs font-medium ${isSelected ? 'text-green-900' : 'text-gray-900'}`}>
            {value}
          </h4>
          {description && (
            <p className={`text-xs mt-0.5 ${isSelected ? 'text-green-700' : 'text-gray-600'}`}>
              {description}
            </p>
          )}
        </div>
        {isSelected && (
          <Check className="w-3 h-3 text-green-600 ml-1 flex-shrink-0" />
        )}
      </div>
    </div>
  );

  // Tag input component
  const TagInput = ({ field, placeholder }) => {
    const [inputValue, setInputValue] = useState('');
    
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && inputValue.trim()) {
        e.preventDefault();
        handleTagInput(field, inputValue);
        setInputValue('');
      }
    };

    return (
      <div className="space-y-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {formData[field]?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {formData[field].map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-800"
              >
                {tag}
                <X
                  className="w-3 h-3 ml-1 cursor-pointer hover:text-red-600"
                  onClick={() => removeTag(field, tag)}
                />
              </span>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderBusinessContext = () => (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-1">Business Model</h3>
        <p className="text-xs text-gray-600 mb-2">Select all that apply to your business</p>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {['B2B', 'B2C', 'B2B2C', 'SaaS', 'Marketplace', 'Platform', 'Agency', 'Subscription', 'Freemium'].map(option => (
            <OptionCard
              key={option}
              value={option}
              isSelected={formData.businessModel?.includes(option)}
              onClick={(value) => handleMultiSelect('businessModel', value)}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-1">Industry Sector</h3>
        <p className="text-xs text-gray-600 mb-2">Select all relevant industry sectors</p>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {['Retail', 'Ecommerce', 'Fintech', 'Healthtech', 'Edtech', 'Consumer Tech', 'SaaS', 'AI/ML', 'Web3'].map(option => (
            <OptionCard
              key={option}
              value={option}
              isSelected={formData.industrySector?.includes(option)}
              onClick={(value) => handleMultiSelect('industrySector', value)}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-1">Stage of Growth</h3>
        <p className="text-xs text-gray-600 mb-2">Select your current stage</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {[
            { value: 'Startup (0–1 yrs)', description: 'Early stage, product-market fit' },
            { value: 'Growth (1–3 yrs)', description: 'Scaling customer base' },
            { value: 'Scaling (3–7 yrs)', description: 'Expanding operations' },
            { value: 'Mature (7+ yrs)', description: 'Established market position' },
            { value: 'Enterprise', description: 'Large organization' }
          ].map(option => (
            <SingleSelectCard
              key={option.value}
              value={option.value}
              description={option.description}
              isSelected={formData.stageOfGrowth === option.value}
              onClick={(value) => handleSingleSelect('stageOfGrowth', value)}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-1">Strategic Horizon</h3>
        <p className="text-xs text-gray-600 mb-2">Primary planning timeframe</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {['0–6 months', '6–12 months', '1–3 years', '3–5 years'].map(option => (
            <SingleSelectCard
              key={option}
              value={option}
              isSelected={formData.strategicHorizon === option}
              onClick={(value) => handleSingleSelect('strategicHorizon', value)}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-1">Primary Strategic Goals</h3>
        <p className="text-xs text-gray-600 mb-2">Select all current strategic priorities</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {[
            'Launch new product',
            'Expand to new market',
            'Increase retention',
            'Reduce cost base',
            'Raise funding',
            'Improve differentiation',
            'Achieve compliance'
          ].map(option => (
            <OptionCard
              key={option}
              value={option}
              isSelected={formData.primaryStrategicGoals?.includes(option)}
              onClick={(value) => handleMultiSelect('primaryStrategicGoals', value)}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const renderMarketFocus = () => (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-1">Target Geographies</h3>
        <p className="text-xs text-gray-600 mb-2">Select all relevant markets</p>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {['North America', 'UK', 'EU', 'MENA', 'APAC', 'LATAM', 'Africa'].map(option => (
            <OptionCard
              key={option}
              value={option}
              isSelected={formData.targetGeographies?.includes(option)}
              onClick={(value) => handleMultiSelect('targetGeographies', value)}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-1">Market Type</h3>
        <p className="text-xs text-gray-600 mb-2">Describe your market dynamics</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {[
            { value: 'Established', description: 'Mature market with clear leaders' },
            { value: 'Emerging', description: 'Growing market with opportunities' },
            { value: 'Disrupted', description: 'Market undergoing transformation' }
          ].map(option => (
            <SingleSelectCard
              key={option.value}
              value={option.value}
              description={option.description}
              isSelected={formData.marketType === option.value}
              onClick={(value) => handleSingleSelect('marketType', value)}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-1">Market Insights Priority</h3>
        <p className="text-xs text-gray-600 mb-2">Types of market intelligence to prioritize</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {[
            'Growth projections',
            'M&A activity',
            'Venture funding',
            'Consumer demand shifts',
            'Regulatory shifts'
          ].map(option => (
            <OptionCard
              key={option}
              value={option}
              isSelected={formData.marketInsightsPriority?.includes(option)}
              onClick={(value) => handleMultiSelect('marketInsightsPriority', value)}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-1">Preferred Sources</h3>
        <p className="text-xs text-gray-600 mb-2">Select trusted information sources</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {[
            'McKinsey',
            'BCG',
            'CB Insights',
            'Statista',
            'Government data',
            'News APIs',
            'LinkedIn Pulse'
          ].map(option => (
            <OptionCard
              key={option}
              value={option}
              isSelected={formData.preferredSources?.includes(option)}
              onClick={(value) => handleMultiSelect('preferredSources', value)}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const renderCompetitorFocus = () => (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-1">Direct Competitors</h3>
        <p className="text-xs text-gray-600 mb-2">Enter competitor names (press Enter to add)</p>
        <TagInput field="directCompetitors" placeholder="e.g. Monday.com, ClickUp, Notion" />
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-1">Watch Categories</h3>
        <p className="text-xs text-gray-600 mb-2">Competitive activities to monitor</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {[
            'Product Launches',
            'Pricing Changes',
            'Messaging & Positioning',
            'Partnerships',
            'Funding',
            'Executive Hiring'
          ].map(option => (
            <OptionCard
              key={option}
              value={option}
              isSelected={formData.watchCategories?.includes(option)}
              onClick={(value) => handleMultiSelect('watchCategories', value)}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-1">Business Model Match</h3>
        <p className="text-xs text-gray-600 mb-2">Similar business model to track</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            { value: 'Sales-led', description: 'Direct sales driven growth' },
            { value: 'Product-led', description: 'Product drives acquisition' },
            { value: 'PLG', description: 'Product-led growth model' },
            { value: 'Freemium', description: 'Free tier with paid upgrades' },
            { value: 'Enterprise SaaS', description: 'B2B enterprise focused' }
          ].map(option => (
            <SingleSelectCard
              key={option.value}
              value={option.value}
              description={option.description}
              isSelected={formData.businessModelMatch === option.value}
              onClick={(value) => handleSingleSelect('businessModelMatch', value)}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-1">Competitive Intensity</h3>
        <p className="text-xs text-gray-600 mb-2">Level of competitive pressure</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {[
            { value: 'Low', description: 'Few direct competitors' },
            { value: 'Medium', description: 'Some competitive pressure' },
            { value: 'High', description: 'Intense competitive landscape' }
          ].map(option => (
            <SingleSelectCard
              key={option.value}
              value={option.value}
              description={option.description}
              isSelected={formData.competitiveIntensity === option.value}
              onClick={(value) => handleSingleSelect('competitiveIntensity', value)}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'business-context':
        return renderBusinessContext();
      case 'market-focus':
        return renderMarketFocus();
      case 'competitor-focus':
        return renderCompetitorFocus();
      case 'trends':
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Design Trends</h3>
              <p className="text-xs text-gray-600 mb-2">UI/UX trends to monitor</p>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {[
                  'Dark mode',
                  'Minimalism',
                  '3D/Neumorphism',
                  'Glassmorphism',
                  'Personalisation',
                  'Adaptive Layouts'
                ].map(option => (
                  <OptionCard
                    key={option}
                    value={option}
                    isSelected={formData.designTrends?.includes(option)}
                    onClick={(value) => handleMultiSelect('designTrends', value)}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Behavioural Trends</h3>
              <p className="text-xs text-gray-600 mb-2">User behavior patterns to track</p>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {[
                  'Voice input',
                  'Chat-based UX',
                  'Micro-interactions',
                  'Gamification'
                ].map(option => (
                  <OptionCard
                    key={option}
                    value={option}
                    isSelected={formData.behaviouralTrends?.includes(option)}
                    onClick={(value) => handleMultiSelect('behaviouralTrends', value)}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Content/Media Trends</h3>
              <p className="text-xs text-gray-600 mb-2">Content format trends</p>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {[
                  'Short-form video',
                  'Live audio',
                  'UGC',
                  'Interactive learning'
                ].map(option => (
                  <OptionCard
                    key={option}
                    value={option}
                    isSelected={formData.contentMediaTrends?.includes(option)}
                    onClick={(value) => handleMultiSelect('contentMediaTrends', value)}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Relevant Timeframe</h3>
              <p className="text-xs text-gray-600 mb-2">Trend monitoring horizon</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {[
                  { value: 'Current', description: 'Happening now' },
                  { value: 'Near-future', description: 'Next 1-2 years' },
                  { value: '3–5 year outlook', description: 'Long-term trends' }
                ].map(option => (
                  <SingleSelectCard
                    key={option.value}
                    value={option.value}
                    description={option.description}
                    isSelected={formData.relevantTimeframe === option.value}
                    onClick={(value) => handleSingleSelect('relevantTimeframe', value)}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      case 'technology-signals':
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Tech Categories to Track</h3>
              <p className="text-xs text-gray-600 mb-2">Technology areas to monitor</p>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {[
                  'Frontend',
                  'Backend',
                  'Database',
                  'DevOps',
                  'AI/ML',
                  'Security',
                  'Analytics',
                  'CDP',
                  'CMS',
                  'CRM'
                ].map(option => (
                  <OptionCard
                    key={option}
                    value={option}
                    isSelected={formData.techCategories?.includes(option)}
                    onClick={(value) => handleMultiSelect('techCategories', value)}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Specific Technologies</h3>
              <p className="text-xs text-gray-600 mb-2">Enter technology names (press Enter to add)</p>
              <TagInput field="specificTechnologies" placeholder="e.g. React, Supabase, PostgreSQL, Stripe" />
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Adoption Strategy</h3>
              <p className="text-xs text-gray-600 mb-2">Technology adoption approach</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {[
                  { value: 'First mover', description: 'Early adoption of new tech' },
                  { value: 'Fast follower', description: 'Quick to adopt proven tech' },
                  { value: 'Cautious adopter', description: 'Wait for maturity' }
                ].map(option => (
                  <SingleSelectCard
                    key={option.value}
                    value={option.value}
                    description={option.description}
                    isSelected={formData.adoptionStrategy === option.value}
                    onClick={(value) => handleSingleSelect('adoptionStrategy', value)}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Tech Stack Bias</h3>
              <p className="text-xs text-gray-600 mb-2">Technology preferences</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                {[
                  'Open-source',
                  'Low-code/No-code',
                  'Cloud-native',
                  'Self-hosted'
                ].map(option => (
                  <OptionCard
                    key={option}
                    value={option}
                    isSelected={formData.techStackBias?.includes(option)}
                    onClick={(value) => handleMultiSelect('techStackBias', value)}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      case 'stakeholder-alignment':
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Internal Stakeholders</h3>
              <p className="text-xs text-gray-600 mb-2">Departments to align intelligence with</p>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {[
                  'Product',
                  'Engineering',
                  'Design',
                  'Marketing',
                  'Sales',
                  'Finance',
                  'Legal',
                  'Data',
                  'Executive'
                ].map(option => (
                  <OptionCard
                    key={option}
                    value={option}
                    isSelected={formData.internalStakeholders?.includes(option)}
                    onClick={(value) => handleMultiSelect('internalStakeholders', value)}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Strategic Themes</h3>
              <p className="text-xs text-gray-600 mb-2">Key organizational themes</p>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {[
                  'Innovation',
                  'Efficiency',
                  'Speed to Market',
                  'Risk Mitigation',
                  'Talent Retention'
                ].map(option => (
                  <OptionCard
                    key={option}
                    value={option}
                    isSelected={formData.strategicThemes?.includes(option)}
                    onClick={(value) => handleMultiSelect('strategicThemes', value)}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Governance Priority</h3>
              <p className="text-xs text-gray-600 mb-2">Decision-making approach</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {[
                  { value: 'High (regulated)', description: 'Strict compliance required' },
                  { value: 'Medium', description: 'Balanced governance' },
                  { value: 'Low (autonomous)', description: 'Autonomous decision-making' }
                ].map(option => (
                  <SingleSelectCard
                    key={option.value}
                    value={option.value}
                    description={option.description}
                    isSelected={formData.governancePriority === option.value}
                    onClick={(value) => handleSingleSelect('governancePriority', value)}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      case 'consumer-insights':
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Feedback Channels</h3>
              <p className="text-xs text-gray-600 mb-2">Customer feedback sources to monitor</p>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {[
                  'Surveys',
                  'Interviews',
                  'Support Tickets',
                  'App Store Reviews',
                  'Social Listening',
                  'NPS'
                ].map(option => (
                  <OptionCard
                    key={option}
                    value={option}
                    isSelected={formData.feedbackChannels?.includes(option)}
                    onClick={(value) => handleMultiSelect('feedbackChannels', value)}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Top User Frictions</h3>
              <p className="text-xs text-gray-600 mb-2">Enter user pain points (press Enter to add)</p>
              <TagInput field="topUserFrictions" placeholder="e.g. Onboarding pain, Confusing pricing, Feature bloat" />
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Behaviour Triggers</h3>
              <p className="text-xs text-gray-600 mb-2">User behavior patterns to track</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                {[
                  'Drop-off points',
                  'Rage clicks',
                  'Trial abandonment',
                  'Time-on-task issues'
                ].map(option => (
                  <OptionCard
                    key={option}
                    value={option}
                    isSelected={formData.behaviourTriggers?.includes(option)}
                    onClick={(value) => handleMultiSelect('behaviourTriggers', value)}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      case 'risk':
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Risk Types</h3>
              <p className="text-xs text-gray-600 mb-2">Categories of risk to monitor</p>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {[
                  'Legal',
                  'Financial',
                  'Technical Debt',
                  'Security',
                  'Regulatory',
                  'Reputational',
                  'Operational'
                ].map(option => (
                  <OptionCard
                    key={option}
                    value={option}
                    isSelected={formData.riskTypes?.includes(option)}
                    onClick={(value) => handleMultiSelect('riskTypes', value)}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Compliance Frameworks</h3>
              <p className="text-xs text-gray-600 mb-2">Regulatory requirements to track</p>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {[
                  'GDPR',
                  'HIPAA',
                  'SOC2',
                  'ISO27001',
                  'PCI-DSS',
                  'CCPA'
                ].map(option => (
                  <OptionCard
                    key={option}
                    value={option}
                    isSelected={formData.complianceFrameworks?.includes(option)}
                    onClick={(value) => handleMultiSelect('complianceFrameworks', value)}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Jurisdictional Focus</h3>
              <p className="text-xs text-gray-600 mb-2">Legal jurisdictions to monitor</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                {[
                  'UK',
                  'US',
                  'EU',
                  'Global'
                ].map(option => (
                  <OptionCard
                    key={option}
                    value={option}
                    isSelected={formData.jurisdictionalFocus?.includes(option)}
                    onClick={(value) => handleMultiSelect('jurisdictionalFocus', value)}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Risk Appetite</h3>
              <p className="text-xs text-gray-600 mb-2">Organizational risk tolerance</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {[
                  { value: 'High', description: 'Comfortable with significant risk' },
                  { value: 'Moderate', description: 'Balanced risk approach' },
                  { value: 'Low', description: 'Risk-averse approach' }
                ].map(option => (
                  <SingleSelectCard
                    key={option.value}
                    value={option.value}
                    description={option.description}
                    isSelected={formData.riskAppetite === option.value}
                    onClick={(value) => handleSingleSelect('riskAppetite', value)}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      case 'opportunities':
        return (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Opportunity Categories</h3>
              <p className="text-xs text-gray-600 mb-2">Types of opportunities to identify</p>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {[
                  'New segments',
                  'New geographies',
                  'Product extensions',
                  'Workflow integration',
                  'Monetisation'
                ].map(option => (
                  <OptionCard
                    key={option}
                    value={option}
                    isSelected={formData.opportunityCategories?.includes(option)}
                    onClick={(value) => handleMultiSelect('opportunityCategories', value)}
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Innovation Appetite</h3>
              <p className="text-xs text-gray-600 mb-2">Approach to innovation</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {[
                  { value: 'Blue-sky', description: 'Experimental, breakthrough innovation' },
                  { value: 'Measured bets', description: 'Calculated innovation risks' },
                  { value: 'Incremental innovation', description: 'Safe, iterative improvements' }
                ].map(option => (
                  <SingleSelectCard
                    key={option.value}
                    value={option.value}
                    description={option.description}
                    isSelected={formData.innovationAppetite === option.value}
                    onClick={(value) => handleSingleSelect('innovationAppetite', value)}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">Section content coming soon...</p>
          </div>
        );
    }
  };

  const getSelectedCount = () => {
    const counts = {
      'business-context': (formData.businessModel?.length || 0) + (formData.industrySector?.length || 0) + 
                         (formData.stageOfGrowth ? 1 : 0) + (formData.strategicHorizon ? 1 : 0) + 
                         (formData.primaryStrategicGoals?.length || 0),
      'market-focus': (formData.targetGeographies?.length || 0) + (formData.marketType ? 1 : 0) + 
                     (formData.marketInsightsPriority?.length || 0) + (formData.preferredSources?.length || 0),
      'competitor-focus': (formData.directCompetitors?.length || 0) + (formData.watchCategories?.length || 0) + 
                         (formData.businessModelMatch ? 1 : 0) + (formData.competitiveIntensity ? 1 : 0),
      'trends': (formData.designTrends?.length || 0) + (formData.behaviouralTrends?.length || 0) + 
               (formData.contentMediaTrends?.length || 0) + (formData.relevantTimeframe ? 1 : 0),
      'technology-signals': (formData.techCategories?.length || 0) + (formData.specificTechnologies?.length || 0) + 
                           (formData.adoptionStrategy ? 1 : 0) + (formData.techStackBias?.length || 0),
      'stakeholder-alignment': (formData.internalStakeholders?.length || 0) + (formData.strategicThemes?.length || 0) + 
                              (formData.governancePriority ? 1 : 0),
      'consumer-insights': (formData.feedbackChannels?.length || 0) + (formData.topUserFrictions?.length || 0) + 
                          (formData.behaviourTriggers?.length || 0),
      'risk': (formData.riskTypes?.length || 0) + (formData.complianceFrameworks?.length || 0) + 
             (formData.jurisdictionalFocus?.length || 0) + (formData.riskAppetite ? 1 : 0),
      'opportunities': (formData.opportunityCategories?.length || 0) + (formData.innovationAppetite ? 1 : 0)
    };
    return counts[activeSection] || 0;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Loading intelligence profile...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const response = await saveIntelligenceProfile(formData);
      
      if (response.success) {
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        alert('Intelligence Profile saved successfully!');
      } else {
        alert(`Failed to save profile: ${response.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('An unexpected error occurred while saving the profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 mb-1">Intelligence Profile Configuration</h1>
          <p className="text-xs text-gray-600">Configure your intelligence preferences to receive relevant market insights</p>
        </div>
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <span className="text-xs text-orange-600">Unsaved changes</span>
          )}
          {lastSaved && !hasUnsavedChanges && (
            <span className="text-xs text-green-600">
              {profileExists ? `Saved ${lastSaved.toLocaleTimeString()}` : 'Profile saved'}
            </span>
          )}
          {!profileExists && !hasUnsavedChanges && !lastSaved && (
            <span className="text-xs text-gray-500">No profile yet</span>
          )}
          <button 
            className="btn btn-primary btn-sm"
            onClick={handleSaveProfile}
            disabled={isSaving}
          >
            <Save className="w-3 h-3 mr-1" />
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Navigation Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <h3 className="text-xs font-medium text-gray-900 mb-3">Profile Sections</h3>
            <nav className="space-y-1">
              {sections.map((section) => {
                const isActive = activeSection === section.id;
                const selectedCount = getSelectedCount();
                
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-left transition-colors text-xs ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="mr-1.5">+</span>
                      <span>{section.title}</span>
                    </div>
                    {selectedCount > 0 && (
                      <span className={`text-xs px-1 py-0.5 rounded ${
                        isActive
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {selectedCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="mb-3">
              <div className="flex items-center mb-1">
                <span className="text-sm mr-1.5">+</span>
                <h2 className="text-sm font-medium text-gray-900">
                  {sections.find(s => s.id === activeSection)?.title}
                </h2>
              </div>
              <p className="text-xs text-gray-600">
                {activeSection === 'business-context' && 'Defines strategic posture, business model, and stage'}
                {activeSection === 'market-focus' && 'Surfaces macroeconomic, market trend, or opportunity intelligence'}
                {activeSection === 'competitor-focus' && 'Triggers alerts on relevant competitive activity'}
                {activeSection === 'trends' && 'Identifies shifts in UI, CX, tech adoption, or product behaviour'}
                {activeSection === 'technology-signals' && 'Guides tech stack monitoring and disruption alerts'}
                {activeSection === 'stakeholder-alignment' && 'Ensures insight aligns with internal leadership/department needs'}
                {activeSection === 'consumer-insights' && 'Personalises signals from voice-of-customer and feedback loops'}
                {activeSection === 'risk' && 'Surfaces critical risks, legal concerns, and governance issues'}
                {activeSection === 'opportunities' && 'Identifies whitespace or unmet customer needs'}
              </p>
            </div>
            
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntelligenceProfile;