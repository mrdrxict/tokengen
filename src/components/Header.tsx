'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { connectWallet, formatAddress } from '@/lib/web3'
import { Wallet, Coins } from 'lucide-react'

export default function Header() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    // Check if wallet is already connected
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      (window as any).ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setWalletAddress(accounts[0])
          }
        })
        .catch((error: any) => {
          console.error('Failed to get accounts:', error)
        })
    }
  }, [])

  const handleConnectWallet = async () => {
    setIsConnecting(true)
    try {
      const address = await connectWallet()
      setWalletAddress(address)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Coins className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">TokenForge</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
            Features
          </a>
          <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
            Pricing
          </a>
          <a href="#docs" className="text-gray-600 hover:text-gray-900 transition-colors">
            Docs
          </a>
        </nav>

        <div className="flex items-center space-x-4">
          {walletAddress ? (
            <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-700">
                {formatAddress(walletAddress)}
              </span>
            </div>
          ) : (
            <Button 
              onClick={handleConnectWallet}
              disabled={isConnecting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Wallet className="w-4 h-4 mr-2" />
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}