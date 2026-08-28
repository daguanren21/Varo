import mitt from 'mitt'

export type AppEvents = Record<string | symbol, unknown> & {
  changeCenter: { lat: number, lng: number }
  inspectionCompleted: { inspectionDate?: string, inspectionRecordId?: number }
  load: boolean
  refresh: boolean | undefined
  refreshCollege: string
}

const broadcast = mitt<AppEvents>()

export default broadcast
