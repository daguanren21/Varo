import type { RetailOrderSummary, RetailProduct } from '../../lib/retail'

export type RetailReceiptAction = 'refund' | 'contact' | 'download'
export interface RetailReceipt {
  id: string
  orderId: string
  orderStatus: RetailOrderSummary['status']
  paymentStatus: 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded'
  issuedAt: string
  details: { id: string, label: string, value: string }[]
  lines: { id: string, product: RetailProduct, quantity: number, total: number }[]
  totals: { id: string, label: string, amount: number }[]
  paidTotal: number
  grants: Record<RetailReceiptAction, boolean>
  actionReason?: string
}
