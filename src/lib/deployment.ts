import { ethers } from 'ethers'
import { TokenConfig } from '@/types/token'
import { SUPPORTED_NETWORKS } from './web3'

// Contract ABIs (simplified for demo - in production, import from compiled artifacts)
const TOKEN_FACTORY_ABI = [
  "function createToken((string,string,uint8,uint256,uint256,bool,bool,bool,bool,uint256,uint256,address),(uint256,uint256,uint256,bool)[]) external payable returns (address)",
  "function getUserTokens(address) external view returns (address[])",
  "function deploymentFee() external view returns (uint256)",
  "event TokenCreated(address indexed tokenAddress, address indexed creator, string name, string symbol, uint256 initialSupply)"
]

const TOKEN_ABI = [
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function decimals() external view returns (uint8)",
  "function totalSupply() external view returns (uint256)",
  "function balanceOf(address) external view returns (uint256)",
  "function owner() external view returns (address)"
]

// Factory contract addresses for each network
const FACTORY_ADDRESSES: Record<number, string> = {
  1: '0x1234567890123456789012345678901234567890', // Ethereum
  56: '0x1234567890123456789012345678901234567890', // BSC
  137: '0x1234567890123456789012345678901234567890', // Polygon
  42161: '0x1234567890123456789012345678901234567890', // Arbitrum
  250: '0x1234567890123456789012345678901234567890', // Fantom
}

export class DeploymentService {
  private provider: ethers.JsonRpcProvider
  private signer: ethers.Signer | null = null
  private network: typeof SUPPORTED_NETWORKS[0]

  constructor(networkId: number) {
    const network = SUPPORTED_NETWORKS.find(n => n.id === networkId)
    if (!network) {
      throw new Error(`Unsupported network: ${networkId}`)
    }
    
    this.network = network
    this.provider = new ethers.JsonRpcProvider(network.rpcUrl)
  }

  async connectWallet(): Promise<string> {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask not installed')
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    this.signer = await provider.getSigner()
    
    // Switch to correct network
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${this.network.id.toString(16)}` }]
      })
    } catch (error: any) {
      if (error.code === 4902) {
        // Network not added to MetaMask
        await this.addNetworkToMetaMask()
      } else {
        throw error
      }
    }

    return await this.signer.getAddress()
  }

  private async addNetworkToMetaMask() {
    if (!window.ethereum) return

    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: `0x${this.network.id.toString(16)}`,
        chainName: this.network.name,
        nativeCurrency: {
          name: this.network.symbol,
          symbol: this.network.symbol,
          decimals: 18
        },
        rpcUrls: [this.network.rpcUrl],
        blockExplorerUrls: [this.network.explorerUrl]
      }]
    })
  }

  async estimateDeploymentCost(config: TokenConfig): Promise<{
    gasLimit: number
    gasPrice: bigint
    totalCost: string
    deploymentFee: string
  }> {
    const factoryAddress = FACTORY_ADDRESSES[this.network.id]
    if (!factoryAddress) {
      throw new Error(`Factory not deployed on ${this.network.name}`)
    }

    const factory = new ethers.Contract(factoryAddress, TOKEN_FACTORY_ABI, this.provider)
    
    // Get deployment fee
    const deploymentFee = await factory.deploymentFee()
    
    // Estimate gas
    const gasPrice = (await this.provider.getFeeData()).gasPrice || BigInt(20000000000)
    const gasLimit = 2500000 // Conservative estimate
    
    const gasCost = BigInt(gasLimit) * gasPrice
    const totalCost = gasCost + deploymentFee

    return {
      gasLimit,
      gasPrice,
      totalCost: ethers.formatEther(totalCost),
      deploymentFee: ethers.formatEther(deploymentFee)
    }
  }

  async deployToken(config: TokenConfig): Promise<{
    success: boolean
    contractAddress?: string
    transactionHash?: string
    error?: string
    gasUsed?: number
    deploymentCost?: string
  }> {
    try {
      if (!this.signer) {
        throw new Error('Wallet not connected')
      }

      const factoryAddress = FACTORY_ADDRESSES[this.network.id]
      if (!factoryAddress) {
        throw new Error(`Factory not deployed on ${this.network.name}`)
      }

      const factory = new ethers.Contract(factoryAddress, TOKEN_FACTORY_ABI, this.signer)
      
      // Get deployment fee
      const deploymentFee = await factory.deploymentFee()

      // Prepare token configuration
      const tokenConfig = {
        name: config.name,
        symbol: config.symbol,
        decimals: config.decimals,
        initialSupply: ethers.parseUnits(config.initialSupply, config.decimals),
        maxSupply: config.maxSupply ? ethers.parseUnits(config.maxSupply, config.decimals) : ethers.parseUnits(config.initialSupply, config.decimals),
        burnable: config.features.burnable,
        mintable: config.features.mintable,
        transferFees: config.features.transferFees,
        holderRedistribution: config.features.holderRedistribution,
        buyFee: config.transferFeesConfig?.buyFee ? Math.floor(config.transferFeesConfig.buyFee * 100) : 0,
        sellFee: config.transferFeesConfig?.sellFee ? Math.floor(config.transferFeesConfig.sellFee * 100) : 0,
        feeRecipient: config.transferFeesConfig?.recipientAddress || ethers.ZeroAddress
      }

      // Prepare vesting configurations
      const vestingConfigs = config.vestingConfig
        .filter(v => v.enabled)
        .map(v => ({
          percentage: Math.floor(v.percentage * 100), // Convert to basis points
          startTime: Math.floor(new Date(v.startDate).getTime() / 1000),
          duration: v.duration * 30 * 24 * 60 * 60, // Convert months to seconds
          enabled: v.enabled
        }))

      // Deploy token
      const tx = await factory.createToken(tokenConfig, vestingConfigs, {
        value: deploymentFee,
        gasLimit: 2500000
      })

      const receipt = await tx.wait()
      
      // Find the TokenCreated event to get the contract address
      const tokenCreatedEvent = receipt.logs.find((log: any) => {
        try {
          const parsed = factory.interface.parseLog(log)
          return parsed?.name === 'TokenCreated'
        } catch {
          return false
        }
      })

      let contractAddress = ''
      if (tokenCreatedEvent) {
        const parsed = factory.interface.parseLog(tokenCreatedEvent)
        contractAddress = parsed?.args[0]
      }

      return {
        success: true,
        contractAddress,
        transactionHash: receipt.hash,
        gasUsed: Number(receipt.gasUsed),
        deploymentCost: ethers.formatEther(deploymentFee)
      }

    } catch (error: any) {
      console.error('Deployment error:', error)
      return {
        success: false,
        error: error.message || 'Deployment failed'
      }
    }
  }

  async getTokenInfo(contractAddress: string): Promise<{
    name: string
    symbol: string
    decimals: number
    totalSupply: string
    owner: string
  }> {
    const token = new ethers.Contract(contractAddress, TOKEN_ABI, this.provider)
    
    const [name, symbol, decimals, totalSupply, owner] = await Promise.all([
      token.name(),
      token.symbol(),
      token.decimals(),
      token.totalSupply(),
      token.owner()
    ])

    return {
      name,
      symbol,
      decimals: Number(decimals),
      totalSupply: ethers.formatUnits(totalSupply, decimals),
      owner
    }
  }

  async getUserTokens(userAddress: string): Promise<string[]> {
    const factoryAddress = FACTORY_ADDRESSES[this.network.id]
    if (!factoryAddress) {
      throw new Error(`Factory not deployed on ${this.network.name}`)
    }

    const factory = new ethers.Contract(factoryAddress, TOKEN_FACTORY_ABI, this.provider)
    return await factory.getUserTokens(userAddress)
  }

  getExplorerUrl(hash: string, type: 'tx' | 'address' = 'tx'): string {
    return `${this.network.explorerUrl}/${type}/${hash}`
  }
}

// Utility function to create deployment service
export function createDeploymentService(networkId: number): DeploymentService {
  return new DeploymentService(networkId)
}

// Mock deployment for development
export async function mockDeploy(config: TokenConfig): Promise<{
  success: boolean
  contractAddress?: string
  transactionHash?: string
  error?: string
  gasUsed?: number
  deploymentCost?: string
}> {
  // Simulate deployment time
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  // Mock successful deployment
  return {
    success: true,
    contractAddress: '0x' + Math.random().toString(16).substr(2, 40),
    transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
    gasUsed: 2156789,
    deploymentCost: '0.05'
  }
}