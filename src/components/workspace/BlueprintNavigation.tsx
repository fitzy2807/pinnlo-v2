'use client'

interface Blueprint {
  id: string
  name: string
  icon: string
  count: number
}

interface BlueprintNavigationProps {
  blueprints: Blueprint[]
  activeBlueprint: string
  onSelectBlueprint: (id: string) => void
}

export default function BlueprintNavigation({ 
  blueprints, 
  activeBlueprint, 
  onSelectBlueprint 
}: BlueprintNavigationProps) {
  return (
    <div className="p-3 space-y-1">
      <div className="mb-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Strategy Blueprints
        </h3>
      </div>
      
      {blueprints.map((blueprint) => (
        <button
          key={blueprint.id}
          onClick={() => onSelectBlueprint(blueprint.id)}
          className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-all duration-200 group ${
            activeBlueprint === blueprint.id
              ? 'bg-gray-900 text-white'
              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <span className="text-base">{blueprint.icon}</span>
            <div>
              <span className="text-xs font-medium block">{blueprint.name}</span>
            </div>
          </div>
          
          {blueprint.count > 0 && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
              activeBlueprint === blueprint.id
                ? 'bg-gray-700 text-gray-200'
                : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
            }`}>
              {blueprint.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
