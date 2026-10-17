export interface MarketingHeroAction {
  id: string
  label: string
  allowed: boolean
  disabled?: boolean
  description?: string
}

export interface MarketingHeroContent {
  eyebrow: string
  title: string
  description: string
  image?: { src: string, alt: string }
  actions: MarketingHeroAction[]
}
