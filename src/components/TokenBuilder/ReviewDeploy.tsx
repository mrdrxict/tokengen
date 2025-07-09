'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TokenConfig } from '@/types/token'
import { SUPPORTED_NETWORKS } from '@/lib/web3'
import { formatNumber } from '@/lib/utils'
import { ExternalLink, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface ReviewDeployProps {
  config: TokenConfig
  onDeploy: () => Promise<void>
}

export default function ReviewDeploy({ config, onDeploy }: ReviewDeployProps) {
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentResult, setDeploymentResult] = useState<{
    success: boolean
    contractAddress?: string
    transactionHash?: string
    error?: string
  } | null>(null)

  const selectedNetwork = SUPPORTED_NETWORKS.find(n => n.id === config.network)
  const enabledFeatures = Object.entries(config.features).filter(([_, enabled]) => enabled)
  const enabledVesting = config.vestingConfig.filter(v => v.enabled)

  const handleDeploy = async () => {
    setIsDeploying(true)
    setDeploymentResult(null)
    
    try {
      await onDeploy()
      setDeploymentResult({
        success: true,
        contractAddress: '0x1234567890123456789012345678901234567890', // Mock address
        transactionHash: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef'
      })
    } catch (error) {
      setDeploymentResult({
        success: false,
        error: error instanceof Error ? error.message : 'Deployment failed'
      })
    } finally {
      setIsDeploying(false)
    }
  }

  const getExplorerUrl = (hash: string, type: 'tx' | 'address' = 'tx') => {
    if (!selectedNetwork) return '#'
    return `${selectedNetwork.explorerUrl}/${type}/${hash}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review & Deploy</CardTitle>
        <CardDescription>
          Review your token configuration and deploy to the blockchain
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Token Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Token Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{config.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Symbol:</span>
                <span className="font-medium">{config.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Decimals:</span>
                <span className="font-medium">{config.decimals}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Initial Supply:</span>
                <span className="font-medium">{formatNumber(parseInt(config.initialSupply || '0'))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Max Supply:</span>
                <span className="font-medium">
                  {config.maxSupply ? formatNumber(parseInt(config.maxSupply)) : 'Unlimited'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Network & Features</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Network:</span>
                <span className="font-medium">{selectedNetwork?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Features:</span>
                <span className="font-medium">{enabledFeatures.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vesting Categories:</span>
                <span className="font-medium">{enabledVesting.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Summary */}
        {enabledFeatures.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Enabled Features</h4>
            <div className="grid grid-cols-2 gap-2">
              {enabledFeatures.map(([feature, _]) => (
                <div key={feature} className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="capitalize">{feature.replace(/([A-Z])/g, ' $1').trim()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vesting Summary */}
        {enabledVesting.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Vesting Schedule</h4>
            <div className="space-y-2">
              {enabledVesting.map((vesting, index) => (
                <div key={index} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                  <span className="font-medium capitalize">{vesting.category}</span>
                  <span>{vesting.percentage}% over {vesting.duration} months</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gas Estimation */}
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h4 className="font-semibold text-yellow-900 mb-2">Estimated Deployment Cost</h4>
          <div className="text-sm text-yellow-800">
            <p>Gas Limit: ~2,000,000</p>
            <p>Estimated Cost: ~0.05 {selectedNetwork?.symbol}</p>
            <p className="text-xs mt-1">*Actual cost may vary based on network conditions</p>
          </div>
        </div>

        {/* Deploy Button */}
        <div className="pt-4">
          {!deploymentResult ? (
            <Button 
              onClick={handleDeploy}
              disabled={isDeploying || !config.name || !config.symbol}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {isDeploying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deploying Token...
                </>
              ) : (
                'Deploy Token'
              )}
            </Button>
          ) : deploymentResult.success ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Token deployed successfully!</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span>Contract Address:</span>
                  <a 
                    href={getExplorerUrl(deploymentResult.contractAddress!, 'address')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                  >
                    <span className="font-mono text-xs">{deploymentResult.contractAddress}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span>Transaction Hash:</span>
                  <a 
                    href={getExplorerUrl(deploymentResult.transactionHash!)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                  >
                    <span className="font-mono text-xs">{deploymentResult.transactionHash?.slice(0, 10)}...</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Deployment failed</span>
              </div>
              <p className="text-sm text-red-600">{deploymentResult.error}</p>
              <Button 
                onClick={handleDeploy}
                variant="outline"
                className="w-full"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}