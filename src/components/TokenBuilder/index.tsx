'use client'

import { useState } from 'react'
import { TokenConfig, VESTING_CATEGORIES } from '@/types/token'
import { Button } from '@/components/ui/button'
import NetworkSelector from './NetworkSelector'
import BasicDetails from './BasicDetails'
import FeatureToggles from './FeatureToggles'
import VestingConfig from './VestingConfig'
import ReviewDeploy from './ReviewDeploy'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const STEPS = [
  { id: 1, title: 'Network', description: 'Choose blockchain network' },
  { id: 2, title: 'Details', description: 'Configure token properties' },
  { id: 3, title: 'Features', description: 'Enable advanced features' },
  { id: 4, title: 'Vesting', description: 'Set up token allocation' },
  { id: 5, title: 'Deploy', description: 'Review and deploy' }
]

export default function TokenBuilder() {
  const [currentStep, setCurrentStep] = useState(1)
  const [config, setConfig] = useState<TokenConfig>({
    name: '',
    symbol: '',
    decimals: 18,
    initialSupply: '',
    maxSupply: '',
    network: 1,
    features: {
      burnable: false,
      mintable: false,
      transferFees: false,
      holderRedistribution: false
    },
    vestingConfig: VESTING_CATEGORIES.map(category => ({
      category: category.key,
      percentage: 0,
      startDate: '',
      duration: 12,
      enabled: false
    }))
  })

  const updateConfig = (updates: Partial<TokenConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return config.network > 0
      case 2:
        return config.name && config.symbol && config.initialSupply
      case 3:
        return true // Features are optional
      case 4:
        return true // Vesting is optional
      case 5:
        return true
      default:
        return false
    }
  }

  const handleDeploy = async () => {
    // Mock deployment - in real app, this would call the API
    console.log('Deploying token with config:', config)
    await new Promise(resolve => setTimeout(resolve, 3000)) // Simulate deployment time
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <NetworkSelector config={config} updateConfig={updateConfig} />
      case 2:
        return <BasicDetails config={config} updateConfig={updateConfig} />
      case 3:
        return <FeatureToggles config={config} updateConfig={updateConfig} />
      case 4:
        return <VestingConfig config={config} updateConfig={updateConfig} />
      case 5:
        return <ReviewDeploy config={config} onDeploy={handleDeploy} />
      default:
        return null
    }
  }

  return (
    <section id="token-builder" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Build Your Token
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Follow our step-by-step wizard to create your custom ERC-20 token with advanced features
          </p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.id 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'border-gray-300 text-gray-500'
                }`}>
                  {step.id}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`hidden sm:block w-16 h-0.5 ml-4 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="max-w-4xl mx-auto mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          {currentStep < STEPS.length && (
            <Button
              onClick={() => setCurrentStep(prev => prev + 1)}
              disabled={!canProceed()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}