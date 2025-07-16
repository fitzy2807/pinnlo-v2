'use client'

import Header from '@/components/Header'
import DashboardWelcome from '@/components/dashboard/DashboardWelcome'
import DashboardGrid from '@/components/dashboard/DashboardGrid'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-16">
        <div className="container-main py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Dashboard Content */}
            <div className="flex-1 space-y-6">
              <DashboardWelcome />
              <DashboardGrid />
            </div>
            
            {/* Dashboard Sidebar */}
            <aside className="w-full lg:w-80 order-first lg:order-last">
              <DashboardSidebar />
            </aside>
          </div>
        </div>
      </main>
    </div>
  )
}