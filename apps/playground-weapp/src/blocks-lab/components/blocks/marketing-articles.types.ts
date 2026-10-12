export interface MarketingArticle {
  id: string
  title: string
  summary: string
  category: string
  readingTime: string
  image?: { src: string, alt: string }
  canOpen: boolean
  disabled?: boolean
}
