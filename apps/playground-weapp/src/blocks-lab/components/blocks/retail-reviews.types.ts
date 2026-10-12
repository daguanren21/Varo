export interface RetailReviewDraft {
  rating: number
  body: string
}
export interface RetailReview {
  id: string
  author: string
  rating: number
  body: string
  createdAt: string
  helpfulCount: number
  helpfulByViewer: boolean
  canHelpful: boolean
  disabled?: boolean
  busy?: boolean
}
