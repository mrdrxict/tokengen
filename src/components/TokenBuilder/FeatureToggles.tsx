'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { TokenConfig } from '@/types/token'
import { Flame, Plus, Percent, Users } from 'lucide-react'

interface FeatureTogglesProps {
  config: TokenConfig
  updateConfig: (updates: Partial<TokenConfig>) => void
}

export default function FeatureToggles({ config, updateConfig }: FeatureTogglesProps) {
  const updateFeature = (feature: keyof TokenConfig['features'], value: boolean) => {
    updateConfig({
      features: {
        ...config.features,
        [feature]: value
      }
    })
  }

  const updateTransferFeesConfig = (updates: Partial<NonNullable<TokenConfig['transferFeesConfig']>>) => {
    updateConfig({
      transferFeesConfig: {
        ...config.transferFeesConfig,
        ...updates
      } as TokenConfig['transferFeesConfig']
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Features</CardTitle>
        <CardDescription>
          Enable advanced features for your token
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Burnable Feature */}
        <div className="flex items-start space-x-4 p-4 border rounded-lg">
          <Flame className="h-6 w-6 text-red-500 mt-1" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="burnable" className="text-base font-medium">
                Burnable Tokens
              </Label>
              <Switch
                id="burnable"
                checked={config.features.burnable}
                onCheckedChange={(checked) => updateFeature('burnable', checked)}
              />
            </div>
            <p className="text-sm text-gray-600">
              Allow token holders to permanently destroy their tokens, reducing total supply
            </p>
          </div>
        </div>

        {/* Mintable Feature */}
        <div className="flex items-start space-x-4 p-4 border rounded-lg">
          <Plus className="h-6 w-6 text-green-500 mt-1" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="mintable" className="text-base font-medium">
                Mintable Tokens
              </Label>
              <Switch
                id="mintable"
                checked={config.features.mintable}
                onCheckedChange={(checked) => updateFeature('mintable', checked)}
              />
            </div>
            <p className="text-sm text-gray-600">
              Allow the owner to create new tokens up to the maximum supply limit
            </p>
          </div>
        </div>

        {/* Transfer Fees Feature */}
        <div className="flex items-start space-x-4 p-4 border rounded-lg">
          <Percent className="h-6 w-6 text-blue-500 mt-1" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="transferFees" className="text-base font-medium">
                Transfer Fees
              </Label>
              <Switch
                id="transferFees"
                checked={config.features.transferFees}
                onCheckedChange={(checked) => updateFeature('transferFees', checked)}
              />
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Charge fees on token transfers and send them to a specified wallet
            </p>
            
            {config.features.transferFees && (
              <div className="space-y-4 mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="buyFee" className="text-sm">Buy Fee (%)</Label>
                    <Input
                      id="buyFee"
                      type="number"
                      min="0"
                      max="25"
                      step="0.1"
                      value={config.transferFeesConfig?.buyFee || 0}
                      onChange={(e) => updateTransferFeesConfig({ buyFee: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="sellFee" className="text-sm">Sell Fee (%)</Label>
                    <Input
                      id="sellFee"
                      type="number"
                      min="0"
                      max="25"
                      step="0.1"
                      value={config.transferFeesConfig?.sellFee || 0}
                      onChange={(e) => updateTransferFeesConfig({ sellFee: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="recipientAddress" className="text-sm">Fee Recipient Address</Label>
                  <Input
                    id="recipientAddress"
                    placeholder="0x..."
                    value={config.transferFeesConfig?.recipientAddress || ''}
                    onChange={(e) => updateTransferFeesConfig({ recipientAddress: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Holder Redistribution Feature */}
        <div className="flex items-start space-x-4 p-4 border rounded-lg">
          <Users className="h-6 w-6 text-purple-500 mt-1" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="holderRedistribution" className="text-base font-medium">
                Holder Redistribution
              </Label>
              <Switch
                id="holderRedistribution"
                checked={config.features.holderRedistribution}
                onCheckedChange={(checked) => updateFeature('holderRedistribution', checked)}
              />
            </div>
            <p className="text-sm text-gray-600">
              Automatically distribute a portion of transaction fees to all token holders (reflective tokens)
            </p>
            {config.features.holderRedistribution && (
              <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-700">
                  ⚠️ This feature significantly increases gas costs and contract complexity
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Feature Summary */}
        {Object.values(config.features).some(Boolean) && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Enabled Features</h4>
            <div className="space-y-1 text-sm text-gray-600">
              {config.features.burnable && <p>• Burnable tokens</p>}
              {config.features.mintable && <p>• Mintable tokens</p>}
              {config.features.transferFees && <p>• Transfer fees ({config.transferFeesConfig?.buyFee || 0}% buy, {config.transferFeesConfig?.sellFee || 0}% sell)</p>}
              {config.features.holderRedistribution && <p>• Holder redistribution</p>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}