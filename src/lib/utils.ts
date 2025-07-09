import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num)
}

export function calculateGasCost(gasLimit: number, gasPrice: number): string {
  const cost = (gasLimit * gasPrice) / 1e18
  return cost.toFixed(6)
}