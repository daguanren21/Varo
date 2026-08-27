<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { onBeforeUnmount, onMounted } from 'vue'

let searchObserver: MutationObserver | undefined

function ensureSearchInputName() {
  const input = document.querySelector<HTMLInputElement>('input.search-input')
  if (!input || input.hasAttribute('aria-label')) return

  input.setAttribute('aria-label', input.placeholder || 'Search documentation')
  input.removeAttribute('aria-labelledby')
}

function closeMobileNavigation(event: KeyboardEvent) {
  if (event.key !== 'Escape') return

  const trigger = document.querySelector<HTMLButtonElement>('button[aria-label="mobile navigation"]')
  if (trigger?.getAttribute('aria-expanded') !== 'true') return

  event.preventDefault()
  trigger.click()
  trigger.focus()
}

onMounted(() => {
  window.addEventListener('keydown', closeMobileNavigation)
  ensureSearchInputName()
  searchObserver = new MutationObserver(ensureSearchInputName)
  searchObserver.observe(document.body, { childList: true, subtree: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', closeMobileNavigation)
  searchObserver?.disconnect()
})
</script>

<template>
  <DefaultTheme.Layout />
</template>
