import type { RetailScenario } from './types'
import logo from './logo.svg'

export interface RetailConfig {
  brand: { name: string, logo: string, accent: string }
  scenario: RetailScenario
}

export const retailConfig: RetailConfig = {
  brand: { name: 'Varo Retail', logo, accent: '#0f766e' },
  scenario: 'default',
}
