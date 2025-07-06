'use client'

import Header from '@/components/Header'
import WelcomeContainer from '@/components/WelcomeContainer'
import MainContentContainer from '@/components/MainContentContainer'
import SidebarContainer from '@/components/SidebarContainer'
import { useStrategies } from '@/hooks/useStrategies'

export default function HomePage() {
  const strategiesHook = useStrategies()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-16">
        <div className="container-main py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1 space-y-8">
              <WelcomeContainer strategiesHook={strategiesHook} />
              <MainContentContainer strategiesHook={strategiesHook} />
            </div>
            
            {/* Sidebar */}
            <aside className="w-full lg:w-80 order-first lg:order-last">
              <SidebarContainer />
            </aside>
          </div>
        </div>
      </main>
    </div>
  )
}