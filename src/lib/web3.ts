import { ethers } from 'ethers'

export interface Network {
  id: number
  name: string
  symbol: string
  rpcUrl: string
  explorerUrl: string
  gasPrice: string
}

export const SUPPORTED_NETWORKS: Network[] = [
  {
    id: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
    explorerUrl: 'https://etherscan.io',
    gasPrice: '20'
  },
  {
    id: 56,
    name: 'BSC',
    symbol: 'BNB',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    explorerUrl: 'https://bscscan.com',
    gasPrice: '5'
  },
  {
    id: 137,
    name: 'Polygon',
    symbol: 'MATIC',
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    gasPrice: '30'
  },
  {
    id: 42161,
    name: 'Arbitrum',
    symbol: 'ETH',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    gasPrice: '0.1'
  },
  {
    id: 250,
    name: 'Fantom',
    symbol: 'FTM',
    rpcUrl: 'https://rpc.ftm.tools',
    explorerUrl: 'https://ftmscan.com',
    gasPrice: '20'
  }
]

export async function connectWallet(): Promise<string | null> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask not installed')
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    })
    return accounts[0]
  } catch (error) {
    console.error('Failed to connect wallet:', error)
    return null
  }
}

export async function switchNetwork(networkId: number): Promise<boolean> {
  if (typeof window === 'undefined' || !window.ethereum) {
    return false
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${networkId.toString(16)}` }]
    })
    return true
  } catch (error) {
    console.error('Failed to switch network:', error)
    return false
  }
}

export function getProvider(network: Network): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(network.rpcUrl)
}

export async function estimateGas(
  network: Network,
  contractData: string
): Promise<{ gasLimit: number; gasCost: string }> {
  const provider = getProvider(network)
  const gasPrice = await provider.getFeeData()
  
  // Estimate gas for contract deployment
  const gasLimit = 2000000 // Conservative estimate for token deployment
  const gasCost = ethers.formatEther(
    BigInt(gasLimit) * (gasPrice.gasPrice || BigInt(20000000000))
  )

  return { gasLimit, gasCost }
}

declare global {
  interface Window {
    ethereum?: any
  }
}