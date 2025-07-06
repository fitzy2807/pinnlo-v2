import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a browser client with proper cookie handling
export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey,
  {
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