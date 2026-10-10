export interface MarketingContactValues {
  name: string
  email: string
  message: string
}

export type MarketingContactErrors = Partial<Record<keyof MarketingContactValues, string>>

export interface MarketingContactLabels {
  name: string
  email: string
  message: string
  submit: string
  pending: string
}
