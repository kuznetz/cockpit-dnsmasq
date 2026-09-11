<template>
  <div>
      <div class="card" style="margin-bottom: 20px; max-width: 1050px">
        <div class="card-title">Network Interfaces</div>
        <div class="card-body iface-options padding">
          <div
            v-for="iface in interfacesOptions"
            :key="iface.name"
            class="iface-option"
          >
            <label>
              <input
                type="checkbox"
                :value="iface.name"
                v-model="newInterfaces"
              />
              <span class="iface-name">{{ iface.name }}</span>
              <span v-if="iface.state" class="iface-state">
                ({{ iface.state }})
              </span>
            </label>
          </div>
          <div v-if="!interfacesOptions.length" class="empty">
            No available interfaces
          </div>
        </div>
      </div>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'

const props = defineProps({
  // Format: [{"name":"eth0","state":"up"}, ...]
  systemInterfaces: {
    type: Array,
    default: () => []
  },
  // Format: ["eth0", ...]
  interfaces: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['changed'])

// Format: ["eth0", ...]
const newInterfaces = ref([])

let syncing = false

const interfacesOptions = computed(() => {
  const map = new Map()
  for (const iface of props.systemInterfaces) {
    if (iface && iface.name) {
      map.set(iface.name, { ...iface })
    }
  }
  for (const name of props.interfaces) {
    if (name && !map.has(name)) {
      map.set(name, { name, state: 'unknown' })
    }
  }
  return Array.from(map.values())
})

// Синхронизация с props.interfaces
watch(
  () => props.interfaces,
  (val) => {
    const next = Array.isArray(val) ? [...val] : []
    if (JSON.stringify(next) === JSON.stringify(newInterfaces.value)) return

    syncing = true
    newInterfaces.value = next
    nextTick(() => {
      syncing = false
    })
  },
  { immediate: true }
)

watch(
  newInterfaces,
  (val) => {
    if (syncing) return
    emit('changed', [...val])
  },
  { deep: true }
)
</script>