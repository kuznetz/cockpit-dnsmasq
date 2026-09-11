<template>
  <div
    class="tabs"
    role="tablist"
    @keydown="onKeydown"
  >
    <button
      v-for="(tab, index) in tabs"
      :key="tab.name"
      :ref="(el) => setTabRef(el, index)"
      type="button"
      role="tab"
      class="tab"
      :class="{ active: tab.name === modelValue }"
      :aria-selected="tab.name === modelValue"
      :id="`tab-${tab.name}`"
      :tabindex="tab.name === modelValue ? 0 : -1"
      :disabled="tab.disabled"
      @click="select(tab)"
    >
      <span v-if="tab.icon" class="icon" aria-hidden="true">
        <component :is="tab.icon" />
      </span>
      <span class="tab-label">{{ tab.label }}</span>
    </button>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const props = defineProps({
  /**
   * Список вкладок:
   * [{ name: string, label: string, icon?: Component, disabled?: boolean }]
   */
  tabs: {
    type: Array,
    required: true,
  },
  /** Активная вкладка (v-model) */
  modelValue: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue', 'change'])

const tabRefs = ref([])

function setTabRef(el, index) {
  if (el) tabRefs.value[index] = el
}

function select(tab) {
  if (tab.disabled || tab.name === props.modelValue) return
  emit('update:modelValue', tab.name)
  emit('change', tab.name)
}

/** Клавиатурная навигация: ←/→/Home/End */
function onKeydown(event) {
  const currentIndex = props.tabs.findIndex((t) => t.name === props.modelValue)
  if (currentIndex === -1) return

  const enabled = props.tabs
    .map((t, i) => ({ ...t, i }))
    .filter((t) => !t.disabled)

  const currentEnabledIndex = enabled.findIndex((t) => t.i === currentIndex)

  let nextIndex = null
  switch (event.key) {
    case 'ArrowRight':
      nextIndex = (currentEnabledIndex + 1) % enabled.length
      break
    case 'ArrowLeft':
      nextIndex =
        (currentEnabledIndex - 1 + enabled.length) % enabled.length
      break
    case 'Home':
      nextIndex = 0
      break
    case 'End':
      nextIndex = enabled.length - 1
      break
    default:
      return
  }

  event.preventDefault()
  const nextTab = enabled[nextIndex]
  emit('update:modelValue', nextTab.name)
  emit('change', nextTab.name)

  nextTick(() => {
    tabRefs.value[nextTab.i]?.focus()
  })
}
</script>