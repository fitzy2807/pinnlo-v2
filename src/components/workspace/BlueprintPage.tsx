'use client'

interface BlueprintPageProps {
  blueprintType: string
  strategyId: string
}

export default function BlueprintPage({ blueprintType, strategyId }: BlueprintPageProps) {
  return (
    <div className="h-full">
      {/* Content Area */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-full p-8">
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-2xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {blueprintType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Cards
            </h3>
            <p className="text-gray-600 mb-8">
              This is where strategy cards for {blueprintType.replace('-', ' ')} will be displayed in a responsive grid layout.
              Click &quot;Add New Card&quot; or &quot;Generate Card&quot; to start building your strategy.
            </p>
            
            {/* Placeholder Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[1, 2, 3, 4, 5, 6].map((card) => (
                <div
                  key={card}
                  className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 h-40 flex items-center justify-center hover:border-gray-400 transition-colors"
                >
                  <div className="text-center">
                    <div className="w-8 h-8 bg-gray-300 rounded-full mx-auto mb-2"></div>
                    <span className="text-gray-500 text-sm">Card Slot {card}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8">
              <p className="text-sm text-gray-500">
                Strategy ID: {strategyId} • Blueprint: {blueprintType}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}