export interface RetailCoupon {
  id: string
  title: string
  description: string
  amount: number
  validity: string
  status: 'available' | 'owned' | 'used' | 'expired'
  eligible: boolean
  reason?: string
  canClaim: boolean
  canSelect: boolean
  disabled?: boolean
  busy?: boolean
}
