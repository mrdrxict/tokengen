'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SUPPORTED_NETWORKS } from '@/lib/web3'
import { TokenConfig } from '@/types/token'

interface NetworkSelectorProps {
  config: TokenConfig
  updateConfig: (updates: Partial<TokenConfig>) => void
}

export default function NetworkSelector({ config, updateConfig }: NetworkSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Network</CardTitle>
        <CardDescription>
          Choose the blockchain network where your token will be deployed
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SUPPORTED_NETWORKS.map((network) => (
            <div
              key={network.id}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                config.network === network.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => updateConfig({ network: network.id })}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{network.name}</h3>
                <span className="text-sm text-gray-500">{network.symbol}</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Gas: ~{network.gasPrice} Gwei
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {network.name} Network
                </span>
                {config.network === network.id && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {config.network && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                Selected Network:
              </span>
              <span className="text-sm text-blue-700">
                {SUPPORTED_NETWORKS.find(n => n.id === config.network)?.name}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}