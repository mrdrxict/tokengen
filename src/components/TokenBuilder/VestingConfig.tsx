'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { TokenConfig, VESTING_CATEGORIES } from '@/types/token'
import { Calendar, Clock, Percent } from 'lucide-react'

interface VestingConfigProps {
  config: TokenConfig
  updateConfig: (updates: Partial<TokenConfig>) => void
}

export default function VestingConfig({ config, updateConfig }: VestingConfigProps) {
  const updateVestingAllocation = (index: number, updates: Partial<TokenConfig['vestingConfig'][0]>) => {
    const newVestingConfig = [...config.vestingConfig]
    newVestingConfig[index] = { ...newVestingConfig[index], ...updates }
    updateConfig({ vestingConfig: newVestingConfig })
  }

  const getTotalPercentage = () => {
    return config.vestingConfig
      .filter(allocation => allocation.enabled)
      .reduce((sum, allocation) => sum + allocation.percentage, 0)
  }

  const getAvailablePercentage = () => {
    return 100 - getTotalPercentage()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Vesting & Locking</CardTitle>
        <CardDescription>
          Configure token allocation and vesting schedules for different categories
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6">
          {VESTING_CATEGORIES.map((category, index) => {
            const allocation = config.vestingConfig[index]
            
            return (
              <div key={category.key} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{category.label}</h4>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                  <Switch
                    checked={allocation.enabled}
                    onCheckedChange={(checked) => 
                      updateVestingAllocation(index, { enabled: checked })
                    }
                  />
                </div>
                
                {allocation.enabled && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm flex items-center">
                          <Percent className="w-4 h-4 mr-1" />
                          Percentage
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          max={getAvailablePercentage() + allocation.percentage}
                          step="0.1"
                          value={allocation.percentage}
                          onChange={(e) => 
                            updateVestingAllocation(index, { 
                              percentage: parseFloat(e.target.value) || 0 
                            })
                          }
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Start Date
                        </Label>
                        <Input
                          type="date"
                          value={allocation.startDate}
                          onChange={(e) => 
                            updateVestingAllocation(index, { startDate: e.target.value })
                          }
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Duration (months)
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          max="120"
                          value={allocation.duration}
                          onChange={(e) => 
                            updateVestingAllocation(index, { 
                              duration: parseInt(e.target.value) || 1 
                            })
                          }
                        />
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      <p>
                        <strong>Allocation:</strong> {allocation.percentage}% of total supply
                        {config.initialSupply && (
                          <span> ({((parseFloat(config.initialSupply) * allocation.percentage) / 100).toLocaleString()} tokens)</span>
                        )}
                      </p>
                      <p>
                        <strong>Vesting:</strong> Linear release over {allocation.duration} months starting {allocation.startDate || 'TBD'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        
        {/* Allocation Summary */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-3">Allocation Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-700">Total Allocated:</span>
              <span className="font-medium text-blue-900">{getTotalPercentage()}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Available:</span>
              <span className="font-medium text-blue-900">{getAvailablePercentage()}%</span>
            </div>
            {getTotalPercentage() > 100 && (
              <p className="text-red-600 text-xs mt-2">
                ⚠️ Total allocation exceeds 100%. Please adjust the percentages.
              </p>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  getTotalPercentage() > 100 ? 'bg-red-500' : 'bg-blue-600'
                }`}
                style={{ width: `${Math.min(getTotalPercentage(), 100)}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}