import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Debug environment variables
console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Missing')
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Set' : 'Missing')

// Create a singleton browser client
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
        cookies: {
          get(name: string) {
            if (typeof document !== 'undefined') {
              const cookies = document.cookie.split('; ')
              const cookie = cookies.find((c) => c.startsWith(`${name}=`))
              return cookie ? decodeURIComponent(cookie.split('=')[1]) : undefined
            }
            return undefined
          },
          set(name: string, value: string, options?: any) {
            if (typeof document !== 'undefined') {
              document.cookie = `${name}=${encodeURIComponent(value)}; path=/; ${
                options?.maxAge ? `max-age=${options.maxAge}; ` : ''
              }${options?.httpOnly ? 'httpOnly; ' : ''}${
                options?.sameSite ? `sameSite=${options.sameSite}; ` : ''
              }${options?.secure ? 'secure; ' : ''}`
            }
          },
          remove(name: string) {
            if (typeof document !== 'undefined') {
              document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
            }
          },
        },
      }
    )
  }
  return supabaseInstance
})()