export interface BookingDate { id: string, label: string, disabled?: boolean }
export interface BookingSlot { id: string, dateId: string, label: string, detail?: string, available: boolean, busy?: boolean }
export type BookingIntent = { action: 'date', dateId: string } | { action: 'slot' | 'submit', dateId: string, slotId: string } | { action: 'cancel' }
export function canSelectBookingSlot(dates: BookingDate[], slots: BookingSlot[], dateId: string, slotId: string, blocked = false): boolean {
  if (blocked || !dates.some(date => date.id === dateId && !date.disabled)) { return false }
  const slot = slots.find(item => item.id === slotId && item.dateId === dateId)
  return !!slot && slot.available && !slot.busy
}
