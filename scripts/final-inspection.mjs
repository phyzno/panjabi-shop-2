import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(url, key)

async function getColumns(table) {
  console.log(`Getting columns for ${table}...`)
  const { data, error } = await supabase.from(table).select().limit(1)
  if (data && data.length > 0) {
     console.log(`${table} columns:`, Object.keys(data[0]))
  } else {
     console.log(`${table} is empty.`)
  }
}

async function run() {
  await getColumns('products')
  await getColumns('fabrics')
  await getColumns('design_options')
  await getColumns('profiles')
}

run()
