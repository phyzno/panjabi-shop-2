import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(url, key)

async function inspectSchema() {
  console.log('Inspecting columns of "products" table...')
  
  // Use a query that returns one row (or none) to see the fields
  const { data, error } = await supabase.from('products').select('*').limit(1)

  if (error) {
    console.error('Fetch failed:', error)
  } else if (data && data.length > 0) {
    console.log('Columns found:', Object.keys(data[0]))
  } else {
    // If table is empty, try to get info from rpc or information_schema if allowed
    console.log('Table is empty. Trying to insert a dummy row to inspect...')
    const { data: insData, error: insError } = await supabase.from('products').insert({
      type: 'test',
      name: 'Inspection Dummy',
      base_price: 0
    }).select()
    
    if (insError) {
      console.error('Dummy insert failed:', insError)
    } else {
      console.log('Columns found:', Object.keys(insData[0]))
      await supabase.from('products').delete().eq('id', insData[0].id)
    }
  }
}

inspectSchema()
