import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(url, key)

async function inspectProfiles() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1)
  if (data) console.log('Profiles columns:', Object.keys(data[0] || {}))
  else console.error('Profiles error:', error)
}
inspectProfiles()
