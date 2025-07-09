'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Shield, Zap, Globe } from 'lucide-react'

export default function Hero() {
  const scrollToBuilder = () => {
    document.getElementById('token-builder')?.scrollIntoView({ 
      behavior: 'smooth' 
    })
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
      
      <div className="relative container mx-auto px-4 py-24 lg:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-8">
            <Zap className="w-4 h-4 mr-2" />
            Create your token in minutes, not hours
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Create Your Own
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {' '}ERC-20 Token
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Launch professional-grade tokens on Ethereum, BSC, Polygon, and more. 
            No coding required. Audited smart contracts. Deploy in minutes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg" 
              onClick={scrollToBuilder}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
            >
              Start Building
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="px-8 py-4 text-lg border-gray-300 hover:bg-gray-50"
            >
              View Examples
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <Shield className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Audited & Secure</h3>
              <p className="text-gray-600 text-center">
                Built with OpenZeppelin contracts and industry best practices
              </p>
            </div>
            
            <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <Globe className="h-12 w-12 text-purple-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-Chain</h3>
              <p className="text-gray-600 text-center">
                Deploy on Ethereum, BSC, Polygon, Arbitrum, and Fantom
              </p>
            </div>
            
            <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <Zap className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Features</h3>
              <p className="text-gray-600 text-center">
                Vesting, fees, burning, minting, and holder rewards
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}