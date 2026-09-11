<template>
  <div style="margin-bottom: 20px">
    <pf-card>
      <pf-card-title>Network Interfaces</pf-card-title>
      <pf-card-body class="iface-options">

        <pf-checkbox
          v-for="iface in interfacesOptions"
          :key="iface.name"
          :id="'iface-' + iface.name"
          :label="`${iface.name} (${iface.state})`"
          :model-value="newInterfaces.includes(iface.name)"
          @update:model-value="(checked) => toggleIface(iface.name, checked)"
          class="iface-option"
        />

        <div v-if="!interfacesOptions.length" class="empty">
          No available interfaces
        </div>

      </pf-card-body>
    </pf-card>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  systemInterfaces: { type: Array, default: () => [] },
  interfaces:       { type: Array, default: () => [] }
})

const emit = defineEmits(['changed'])

const newInterfaces = ref(Array.isArray(props.interfaces) ? [...props.interfaces] : [])

const interfacesOptions = computed(() => {
  const map = new Map()
  for (const iface of props.systemInterfaces) {
    if (iface && iface.name) map.set(iface.name, { ...iface })
  }
  for (const name of props.interfaces) {
    if (name && !map.has(name)) map.set(name, { name, state: 'unknown' })
  }
  return Array.from(map.values())
})

function toggleIface(name, checked) {
  const set = new Set(newInterfaces.value)
  if (checked) set.add(name)
  else set.delete(name)
  newInterfaces.value = Array.from(set)
}

// Синхронизация с props.interfaces (без эмита обратно)
watch(
  () => props.interfaces,
  (val) => {
    const next = Array.isArray(val) ? [...val] : []
    if (
      next.length === newInterfaces.value.length &&
      next.every((v, i) => v === newInterfaces.value[i])
    ) return
    newInterfaces.value = next
  },
  { immediate: true }
)

watch(
  newInterfaces,
  (val) => {
    if (!Array.isArray(val)) return
    emit('changed', [...val])
  },
  { deep: true }
)
</script>

<style lang="scss">
.iface-options {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  max-height: 1050px;
  gap: 20px;
}

.iface-option {
}
</style>