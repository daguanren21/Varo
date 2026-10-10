export interface MarketingProcessStep {
  id: string
  title: string
  description: string
  state: 'upcoming' | 'active' | 'completed'
  action?: { label: string, allowed: boolean, disabled?: boolean }
}
