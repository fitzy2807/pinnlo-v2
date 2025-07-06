import AuthForm from '@/components/auth/AuthForm'
import AuthTest from '@/components/AuthTest'
import { Shield, Zap, Users } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Logo and Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-black mb-2">PINNLO</h1>
              <p className="text-gray-600">
                Welcome back to your strategy platform
              </p>
            </div>

            {/* Auth Form */}
            <AuthForm />
            
            {/* Debug Auth Test */}
            <div className="mt-8">
              <AuthTest />
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-500">
                By continuing, you agree to PINNLO&apos;s Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Features Showcase */}
      <div className="hidden lg:flex lg:flex-1 bg-black text-white items-center justify-center p-12">
        <div className="max-w-md">
          <h2 className="text-3xl font-bold mb-8">
            Strategic excellence starts here
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-white bg-opacity-10 p-3 rounded-lg">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Secure & Private</h3>
                <p className="text-gray-300 text-sm">
                  Your strategic data is protected with enterprise-grade security
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-white bg-opacity-10 p-3 rounded-lg">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">AI-Powered Insights</h3>
                <p className="text-gray-300 text-sm">
                  Get intelligent recommendations to enhance your strategies
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-white bg-opacity-10 p-3 rounded-lg">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Collaborative Platform</h3>
                <p className="text-gray-300 text-sm">
                  Work together with your team to build winning strategies
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 p-6 bg-white bg-opacity-5 rounded-lg border border-white border-opacity-10">
            <p className="text-sm text-gray-300 italic">
              &quot;PINNLO transformed how we approach strategic planning. The insights are incredible.&quot;
            </p>
            <p className="text-xs text-gray-400 mt-2">
              — Sarah Johnson, Strategy Director
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}