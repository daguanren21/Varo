<script setup lang="ts">
import type { A2uiActionMessage, A2uiInteraction, A2uiSurfaceView } from '../../components/agent-a2ui/session'
import { computed, onLoad, onUnload, shallowRef } from 'wevu'
import { A2UI_CATALOG_ID, createA2uiSession } from '../../components/agent-a2ui/session'
import VAgentSurface from '../../components/agent-a2ui/VAgentSurface.vue'

const surfaceId = 'consumer-form'
const surfaces = shallowRef<A2uiSurfaceView[]>([])
const receipt = shallowRef<{ count: number, message: A2uiActionMessage | null }>({ count: 0, message: null })
const receiptText = computed(() => JSON.stringify(receipt.value))
const session = createA2uiSession({
  onSurfaces(views) { surfaces.value = views },
  onAction(message) { receipt.value = { count: receipt.value.count + 1, message } },
})

onLoad(() => {
  session.receive({
    version: '1.0',
    createSurface: {
      surfaceId,
      catalogId: A2UI_CATALOG_ID,
      dataModel: { name: 'Initial name' },
      components: [
        { id: 'root', component: 'Card', child: 'form' },
        { id: 'form', component: 'Column', children: ['name', 'preview', 'save'] },
        { id: 'name', component: 'TextField', label: 'Name', value: { '@path': '/name' } },
        { id: 'preview', component: 'Text', text: { '@path': '/name' } },
        {
          id: 'save',
          component: 'Button',
          child: 'save_label',
          action: { event: { name: 'saveName', context: { name: { '@path': '/name' } } } },
        },
        { id: 'save_label', component: 'Text', text: 'Save name' },
      ],
    },
  })
})
onUnload(session.dispose)

function interact(event: A2uiInteraction) {
  return session.interact(surfaceId, event)
}
</script>

<template>
  <VAgentSurface
    v-for="surface in surfaces"
    :key="surface.id"
    :surface="surface"
    @interaction="interact"
  />
  <text id="action-receipt">
    {{ receiptText }}
  </text>
</template>
