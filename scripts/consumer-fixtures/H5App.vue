<script setup lang="ts">
import type { FormRules } from '@varo-ui/headless'
import type { FormSubmitPayload } from './varo-ui'
import { reactive, shallowRef } from 'vue'
import { VButton, VDrawer, VForm, VFormItem, VInput } from './varo-ui'

const model = reactive({ name: '' })
const open = shallowRef(false)
const status = shallowRef('Enter a name, then submit locally.')
const rules: FormRules = { name: [{ required: true, message: 'Name is required' }] }

function submit(payload: FormSubmitPayload) {
  status.value = `Submitted locally: ${JSON.stringify(payload.values)}; errors: ${JSON.stringify(payload.errors)}`
  open.value = true
}
</script>

<template>
  <main>
    <h1>Varo packed consumer</h1>
    <VForm :model="model" :rules="rules" @submit="submit" @failed="status = 'Correct the field errors.'">
      <VFormItem name="name" label="Name" required>
        <VInput v-model:value="model.name" aria-label="Name" placeholder="Your name" clearable />
      </VFormItem>
      <VButton native-type="submit">
        Submit locally
      </VButton>
    </VForm>
    <p role="status">
      {{ status }}
    </p>
    <VButton variant="outline" @click="open = true">
      Inspect local state
    </VButton>
    <VDrawer v-model:open="open" placement="bottom" closeable>
      <p>{{ model.name }}</p>
      <VButton @click="open = false">
        Close
      </VButton>
    </VDrawer>
  </main>
</template>
