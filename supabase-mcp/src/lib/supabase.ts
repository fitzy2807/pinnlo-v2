import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from parent directory's .env.local
config({ path: path.resolve(__dirname, '../../../.env.local') })

// Get Supabase configuration from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

console.log('🔗 MCP Supabase Configuration:')
console.log('  - URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'NOT SET')
console.log('  - Service Key:', supabaseServiceKey ? `${supabaseServiceKey.substring(0, 20)}...` : 'NOT SET')

let supabaseClient: any = null

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️  Supabase credentials not found - database prompts will not be available')
  console.warn('    Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
} else {
  // Create Supabase client with service role key for server-side operations
  supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export const supabase = supabaseClient

// Helper function to get system prompts from database
export async function getSystemPrompt(promptType: string, sectionId: string) {
  console.log(`📚 Fetching system prompt: type=${promptType}, section=${sectionId}`)
  
  if (!supabase) {
    console.warn('⚠️  Supabase client not initialized - returning null')
    return null
  }
  
  try {
    // Use the card_creator_system_prompts table
    const { data, error } = await supabase
      .from('card_creator_system_prompts')
      .select('*')
      .eq('prompt_type', promptType)
      .eq('section_id', sectionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error('❌ Error fetching system prompt:', error)
      return null
    }

    if (data) {
      console.log(`✅ Found system prompt: ${data.display_name}`)
      console.log('📋 Prompt data:', {
        id: data.id,
        prompt_type: data.prompt_type,
        section_id: data.section_id,
        has_preview_prompt: !!data.preview_prompt,
        has_generation_prompt: !!data.generation_prompt,
        config: data.config
      })
    } else {
      console.log('⚠️  No system prompt found in database')
    }

    return data
  } catch (error) {
    console.error('❌ Error in getSystemPrompt:', error)
    return null
  }
}

// Helper function to get all prompts for a type
export async function getSystemPromptsByType(promptType: string) {
  if (!supabase) {
    console.warn('⚠️  Supabase client not initialized - returning empty array')
    return []
  }
  
  try {
    const { data, error } = await supabase
      .from('card_creator_system_prompts')
      .select('*')
      .eq('prompt_type', promptType)

    if (error) {
      console.error('Error fetching system prompts:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getSystemPromptsByType:', error)
    return []
  }
}