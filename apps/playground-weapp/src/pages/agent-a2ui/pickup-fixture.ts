import type { CreateSurfaceMessage } from '@a2ui/web_core/v1_0'
import catalog from './components/catalog.json' with { type: 'json' }

export type PickupLayout = 'flat' | 'nested'
export const pickupSurfaceId = 'pickup-time'

export function createPickupSurface(layout: PickupLayout): CreateSurfaceMessage {
  return {
    version: '1.0',
    createSurface: {
      surfaceId: pickupSurfaceId,
      catalogId: catalog.catalogId,
      dataModel: { pickupTime: '周五 10:00' },
      components: [
        { id: 'root', component: 'Card', child: 'body' },
        ...(layout === 'flat'
          ? [{ id: 'body', component: 'Column', children: ['title', 'description', 'time', 'save'] }]
          : [
              { id: 'body', component: 'Column', children: ['title', 'schedule', 'save'] },
              { id: 'schedule', component: 'Card', child: 'schedule_fields' },
              { id: 'schedule_fields', component: 'Column', children: ['time', 'description'] },
            ]),
        { id: 'title', component: 'Text', text: '修改取件时间' },
        { id: 'description', component: 'Text', variant: 'caption', text: '确认前可修改取件时间。' },
        { id: 'time', component: 'TextField', label: '取件时间', value: { '@path': '/pickupTime' } },
        {
          id: 'save',
          component: 'Button',
          child: 'save_label',
          variant: 'primary',
          action: { event: { name: 'savePickupTime', context: { pickupTime: { '@path': '/pickupTime' } } } },
        },
        { id: 'save_label', component: 'Text', text: '确认取件时间' },
      ],
    },
  }
}
