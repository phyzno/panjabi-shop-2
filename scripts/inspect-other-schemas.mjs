import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(url, key)

async function inspectFabrics() {
  console.log('Inspecting columns of "fabrics" table...')
  const { data, error } = await supabase.from('fabrics').select('*').limit(1)
  if (data && data.length > 0) {
    console.log('Fabrics columns:', Object.keys(data[0]))
  } else {
    const { data: insData, error: insError } = await supabase.from('fabrics').insert({
      name: 'Inspection Dummy',
      fabric_type: 'test',
      price_per_yard: 0
    }).select()
    if (insData) {
      console.log('Fabrics columns:', Object.keys(insData[0]))
      await supabase.from('fabrics').delete().eq('id', insData[0].id)
    }
  }
}

async function inspectCollars() {
  console.log('Inspecting columns of "design_options" table...')
  const { data, error } = await supabase.from('design_options').select('*').limit(1)
  if (data && data.length > 0) {
    console.log('Collars columns:', Object.keys(data[0]))
  } else {
    const { data: insData, error: insError } = await supabase.from('design_options').insert({
      type: 'collar',
      name: 'Inspection Dummy'
    }).select()
    if (insData) {
      console.log('Collars columns:', Object.keys(insData[0]))
      await supabase.from('design_options').delete().eq('id', insData[0].id)
    }
  }
}

async function run() {
  await inspectFabrics()
  await inspectCollars()
}

run()
