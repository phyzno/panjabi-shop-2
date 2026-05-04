import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(url, key)

async function inspect() {
  const { data, error } = await supabase.from('fabrics').select('*').limit(1)
  if (error) {
     console.error('Fetch error:', error)
     return
  }
  if (data && data.length > 0) {
    console.log('Fabrics columns:', Object.keys(data[0]))
  } else {
    console.log('Fabrics is empty and we cannot insert due to missing columns.')
  }
}
inspect()
