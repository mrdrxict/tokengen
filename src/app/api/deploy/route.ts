import { NextRequest, NextResponse } from 'next/server'
import { createDeploymentService } from '@/lib/deployment'
import { saveDeployment } from '@/lib/supabase'
import { TokenConfig } from '@/types/token'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { config, userAddress }: { config: TokenConfig; userAddress: string } = body

    // Validate required fields
    if (!config.name || !config.symbol || !config.initialSupply || !userAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate network
    if (!config.network || ![1, 56, 137, 42161, 250].includes(config.network)) {
      return NextResponse.json(
        { error: 'Unsupported network' },
        { status: 400 }
      )
    }

    // Create deployment service
    const deploymentService = createDeploymentService(config.network)

    // Deploy the token
    const result = await deploymentService.deployToken(config)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Deployment failed' },
        { status: 500 }
      )
    }

    // Save deployment to database
    try {
      const networkNames: Record<number, string> = {
        1: 'ethereum',
        56: 'bsc',
        137: 'polygon',
        42161: 'arbitrum',
        250: 'fantom'
      }

      await saveDeployment({
        user_address: userAddress,
        token_name: config.name,
        token_symbol: config.symbol,
        network: networkNames[config.network],
        contract_address: result.contractAddress!,
        transaction_hash: result.transactionHash!,
        gas_used: result.gasUsed || 0,
        deployment_cost: result.deploymentCost || '0',
        status: 'success'
      })
    } catch (dbError) {
      console.error('Failed to save deployment to database:', dbError)
      // Don't fail the request if database save fails
    }

    return NextResponse.json({
      success: true,
      contractAddress: result.contractAddress,
      transactionHash: result.transactionHash,
      gasUsed: result.gasUsed,
      deploymentCost: result.deploymentCost,
      explorerUrl: deploymentService.getExplorerUrl(result.contractAddress!, 'address')
    })

  } catch (error) {
    console.error('Deployment API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get('userAddress')
    const networkId = searchParams.get('networkId')

    if (!userAddress || !networkId) {
      return NextResponse.json(
        { error: 'Missing userAddress or networkId' },
        { status: 400 }
      )
    }

    const deploymentService = createDeploymentService(parseInt(networkId))
    const tokens = await deploymentService.getUserTokens(userAddress)

    // Get token info for each token
    const tokenInfos = await Promise.all(
      tokens.map(async (tokenAddress) => {
        try {
          const info = await deploymentService.getTokenInfo(tokenAddress)
          return {
            address: tokenAddress,
            ...info,
            explorerUrl: deploymentService.getExplorerUrl(tokenAddress, 'address')
          }
        } catch (error) {
          console.error(`Failed to get info for token ${tokenAddress}:`, error)
          return {
            address: tokenAddress,
            name: 'Unknown',
            symbol: 'UNKNOWN',
            decimals: 18,
            totalSupply: '0',
            owner: userAddress,
            explorerUrl: deploymentService.getExplorerUrl(tokenAddress, 'address')
          }
        }
      })
    )

    return NextResponse.json({ tokens: tokenInfos })

  } catch (error) {
    console.error('Get tokens API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}