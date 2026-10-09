export interface MarketingPricingPeriod {
  id: string
  label: string
  disabled?: boolean
}

export interface MarketingPricingFeature {
  id: string
  label: string
}

export interface MarketingPricingPlan {
  id: string
  name: string
  description: string
  prices: Record<string, string>
  features: Record<string, string>
  canChoose: boolean
  disabled?: boolean
}

export interface MarketingPricingChoice {
  planId: string
  periodId: string
}
