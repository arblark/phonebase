import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing environment variables for Supabase connection')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)

export async function initializeSupabase() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error connecting to database:', error)
    return { success: false, error }
  }
}