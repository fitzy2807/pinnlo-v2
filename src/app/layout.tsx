import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/providers/AuthProvider'
import AgentRegistryInit from '@/components/shared/AgentRegistryInit'
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
          <AgentRegistryInit />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}