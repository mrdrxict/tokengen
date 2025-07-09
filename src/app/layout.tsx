import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TokenForge - Create Your Own ERC-20 Token',
  description: 'Launch professional-grade tokens on Ethereum, BSC, Polygon, and more. No coding required. Audited smart contracts. Deploy in minutes.',
  keywords: 'token creator, ERC-20, BSC, Polygon, cryptocurrency, blockchain, smart contracts',
  authors: [{ name: 'TokenForge Team' }],
  openGraph: {
    title: 'TokenForge - Create Your Own ERC-20 Token',
    description: 'Launch professional-grade tokens on multiple blockchains with advanced features',
    type: 'website',
    url: 'https://tokenforge.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TokenForge - Create Your Own ERC-20 Token',
    description: 'Launch professional-grade tokens on multiple blockchains with advanced features',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen bg-white">
          {children}
        </div>
      </body>
    </html>
  )
}