import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(url, key)

async function inspect() {
  const { data, error } = await supabase.from('fabrics').insert({
    name: 'test',
    fabric_type: 'test',
    price_per_yard: 0
  }).select()
  
  if (error) console.error(error)
  if (data) {
    console.log('Fabrics:', Object.keys(data[0]))
    await supabase.from('fabrics').delete().eq('id', data[0].id)
  }
}
inspect()
