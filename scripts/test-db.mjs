import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(url, key)

async function testInsert() {
  console.log('Testing insert into "products" table...')
  
  const testProduct = {
    type: 'panjabi',
    category: 'test',
    name: 'Test Product ' + Date.now(),
    base_price: 999,
    is_active: true
  }

  const { data, error } = await supabase.from('products').insert(testProduct).select()

  if (error) {
    console.error('Insert failed:', error)
  } else {
    console.log('Insert successful:', data)
    
    // Now delete it
    const { error: delError } = await supabase.from('products').delete().eq('id', data[0].id)
    if (delError) console.error('Delete failed:', delError)
    else console.log('Clean up successful.')
  }
}

testInsert()
