import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface DeploymentRecord {
  id: string
  user_address: string
  token_name: string
  token_symbol: string
  network: string
  contract_address: string
  transaction_hash: string
  gas_used: number
  deployment_cost: string
  created_at: string
  status: 'pending' | 'success' | 'failed'
}

export async function saveDeployment(deployment: Omit<DeploymentRecord, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('deployments')
    .insert([deployment])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getDeployments(userAddress: string) {
  const { data, error } = await supabase
    .from('deployments')
    .select('*')
    .eq('user_address', userAddress)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}