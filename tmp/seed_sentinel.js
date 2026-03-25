const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: 'c:/Users/ferch/Documents/work/ForgeOS/forgeos3-backend/.env' })

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

async function seed() {
  console.log('--- Seeding Sentinel Agent ---')
  
  // 1. Check if it exists
  const { data: existing } = await supabase
    .from('created_agents')
    .select('id')
    .eq('name', 'Sentinel')
    .single()

  if (existing) {
    console.log('Sentinel agent already exists with ID:', existing.id)
    return
  }

  // 2. Insert Sentinel
  const { data, error } = await supabase
    .from('created_agents')
    .insert({
      name: 'Sentinel',
      description: 'Agente Agrotech especializado en el gusano barrenador',
      runtime: 'openclaw_v1',
      domain_profile: 'agrotech',
      status: 'active',
      risk_mode: 'normal'
    })
    .select()
    .single()

  if (error) {
    console.error('Error seeding Sentinel:', error)
  } else {
    console.log('Sentinel seeded successfully! ID:', data.id)
    console.log('IMPORTANT: Update the agent server .env or code with this ID if necessary.')
  }
}

seed()
