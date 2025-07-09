export interface TokenConfig {
  // Basic Details
  name: string
  symbol: string
  decimals: number
  initialSupply: string
  maxSupply: string
  
  // Network
  network: number
  
  // Features
  features: {
    burnable: boolean
    mintable: boolean
    transferFees: boolean
    holderRedistribution: boolean
  }
  
  // Transfer Fees Configuration
  transferFeesConfig?: {
    buyFee: number
    sellFee: number
    recipientAddress: string
  }
  
  // Vesting Configuration
  vestingConfig: VestingAllocation[]
}

export interface VestingAllocation {
  category: VestingCategory
  percentage: number
  startDate: string
  duration: number // in months
  enabled: boolean
}

export type VestingCategory = 
  | 'team'
  | 'advertising' 
  | 'publicSale'
  | 'privateSale'
  | 'ecosystem'
  | 'marketing'
  | 'development'

export interface DeploymentResult {
  success: boolean
  contractAddress?: string
  transactionHash?: string
  error?: string
  gasUsed?: number
  deploymentCost?: string
}

export interface TokenBuilderStep {
  id: number
  title: string
  description: string
  completed: boolean
}

export const VESTING_CATEGORIES: { 
  key: VestingCategory
  label: string
  description: string
  defaultPercentage: number
}[] = [
  {
    key: 'team',
    label: 'Team',
    description: 'Tokens allocated to team members',
    defaultPercentage: 15
  },
  {
    key: 'advertising',
    label: 'Advertising',
    description: 'Marketing and promotional activities',
    defaultPercentage: 10
  },
  {
    key: 'publicSale',
    label: 'Public Sale',
    description: 'Tokens for public sale events',
    defaultPercentage: 30
  },
  {
    key: 'privateSale',
    label: 'Private Sale',
    description: 'Private investor allocations',
    defaultPercentage: 20
  },
  {
    key: 'ecosystem',
    label: 'Ecosystem',
    description: 'Ecosystem development and partnerships',
    defaultPercentage: 15
  },
  {
    key: 'marketing',
    label: 'Marketing',
    description: 'Marketing campaigns and community building',
    defaultPercentage: 5
  },
  {
    key: 'development',
    label: 'Development',
    description: 'Ongoing development and maintenance',
    defaultPercentage: 5
  }
]