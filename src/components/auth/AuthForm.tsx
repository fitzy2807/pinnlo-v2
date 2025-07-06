'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'

export default function AuthForm() {
  return (
    <div className="w-full">
      <Auth
        supabaseClient={supabase}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: '#171717',
                brandAccent: '#374151',
                brandButtonText: 'white',
                defaultButtonBackground: '#f9fafb',
                defaultButtonBackgroundHover: '#f3f4f6',
                inputBackground: 'white',
                inputBorder: '#d1d5db',
                inputBorderHover: '#9ca3af',
                inputBorderFocus: '#171717',
              },
              space: {
                buttonPadding: '12px 16px',
                inputPadding: '12px 16px',
              },
              borderWidths: {
                buttonBorderWidth: '1px',
                inputBorderWidth: '1px',
              },
              radii: {
                borderRadiusButton: '8px',
                buttonBorderRadius: '8px',
                inputBorderRadius: '8px',
              },
            },
          },
          className: {
            container: 'auth-container',
            button: 'auth-button',
            input: 'auth-input',
            label: 'auth-label',
          },
        }}
        theme="light"
        providers={[]}
        redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}
        localization={{
          variables: {
            sign_in: {
              email_label: 'Email address',
              password_label: 'Password',
              button_label: 'Sign in to PINNLO',
              loading_button_label: 'Signing in...',
              link_text: 'Already have an account? Sign in',
            },
            sign_up: {
              email_label: 'Email address',
              password_label: 'Create password',
              button_label: 'Create PINNLO account',
              loading_button_label: 'Creating account...',
              link_text: "Don't have an account? Sign up",
            },
          },
        }}
      />
    </div>
  )
}