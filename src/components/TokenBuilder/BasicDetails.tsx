'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TokenConfig } from '@/types/token'

interface BasicDetailsProps {
  config: TokenConfig
  updateConfig: (updates: Partial<TokenConfig>) => void
}

export default function BasicDetails({ config, updateConfig }: BasicDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Details</CardTitle>
        <CardDescription>
          Configure the basic properties of your token
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Token Name</Label>
            <Input
              id="name"
              placeholder="e.g., My Awesome Token"
              value={config.name}
              onChange={(e) => updateConfig({ name: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              The full name of your token (e.g., Bitcoin, Ethereum)
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="symbol">Token Symbol</Label>
            <Input
              id="symbol"
              placeholder="e.g., MAT"
              value={config.symbol}
              onChange={(e) => updateConfig({ symbol: e.target.value.toUpperCase() })}
              maxLength={10}
            />
            <p className="text-xs text-gray-500">
              Short symbol for your token (e.g., BTC, ETH)
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="decimals">Decimals</Label>
            <Input
              id="decimals"
              type="number"
              min="0"
              max="18"
              value={config.decimals}
              onChange={(e) => updateConfig({ decimals: parseInt(e.target.value) || 18 })}
            />
            <p className="text-xs text-gray-500">
              Number of decimal places (usually 18)
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="initialSupply">Initial Supply</Label>
            <Input
              id="initialSupply"
              placeholder="1000000"
              value={config.initialSupply}
              onChange={(e) => updateConfig({ initialSupply: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              Tokens created at deployment
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="maxSupply">Max Supply</Label>
            <Input
              id="maxSupply"
              placeholder="10000000"
              value={config.maxSupply}
              onChange={(e) => updateConfig({ maxSupply: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              Maximum tokens that can exist
            </p>
          </div>
        </div>
        
        {config.name && config.symbol && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Token Preview</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Name:</span> {config.name}</p>
              <p><span className="font-medium">Symbol:</span> {config.symbol}</p>
              <p><span className="font-medium">Decimals:</span> {config.decimals}</p>
              <p><span className="font-medium">Initial Supply:</span> {config.initialSupply ? Number(config.initialSupply).toLocaleString() : '0'}</p>
              <p><span className="font-medium">Max Supply:</span> {config.maxSupply ? Number(config.maxSupply).toLocaleString() : 'Unlimited'}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}