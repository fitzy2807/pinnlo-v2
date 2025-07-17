import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/providers/AuthProvider'
import { AIProcessingProvider } from '@/contexts/AIProcessingContext'
import AgentRegistryInit from '@/components/shared/AgentRegistryInit'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PINNLO V2',
  description: 'Strategic Excellence Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AIProcessingProvider>
            <AgentRegistryInit />
            {children}
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </AIProcessingProvider>
        </AuthProvider>
      </body>
    </html>
  )
}