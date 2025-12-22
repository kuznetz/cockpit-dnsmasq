<template>
  <div>
    <table class="pf-c-table pf-m-compact" aria-label="Hosts table">
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key">
            {{ column.title }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="newHosts.length === 0">
          <td :colspan="columns.length">
            <div class="pf-l-bullseye">
              <div class="pf-c-empty-state">
                PlusIcon<!-- <PlusIcon class="pf-c-empty-state__icon" /> -->
                <h4 class="pf-c-title pf-m-lg">
                  No hosts configured
                </h4>
                <div class="pf-c-empty-state__body">
                  Add a new host to get started.
                </div>
              </div>
            </div>
          </td>
        </tr>

        <template v-else>
          <tr v-for="(item, index) in newHosts" :key="index">
            <template v-if="isRowEditable(index)">
              <td>
                <input
                  type="text"
                  class="pf-c-form-control"
                  :value="item.mac"
                  @input="(e) => handleInputChange(index, 'mac', e.target.value)"
                  placeholder="aa:bb:cc:dd:ee:ff"
                  :aria-label="`MAC address for row ${index + 1}`"
                />
              </td>
              <td>
                <input
                  type="text"
                  class="pf-c-form-control"
                  :value="item.ip"
                  @input="(e) => handleInputChange(index, 'ip', e.target.value)"
                  placeholder="192.168.0.0"
                  :aria-label="`IP address for row ${index + 1}`"
                />
              </td>
              <td>
                <input
                  type="text"
                  class="pf-c-form-control"
                  :value="item.hostname"
                  @input="(e) => handleInputChange(index, 'hostname', e.target.value)"
                  placeholder="hostname"
                  :aria-label="`Hostname for row ${index + 1}`"
                />
              </td>
              <td>
                <input
                  type="text"
                  class="pf-c-form-control"
                  :value="item.leaseTime"
                  @input="(e) => handleInputChange(index, 'leaseTime', e.target.value)"
                  placeholder="default"
                  :aria-label="`Lease time for row ${index + 1}`"
                />
              </td>
              <td>
                <input
                  type="text"
                  class="pf-c-form-control"
                  :value="item.comment"
                  @input="(e) => handleInputChange(index, 'comment', e.target.value)"
                  placeholder="comment"
                  :aria-label="`Comment for row ${index + 1}`"
                />
              </td>
              <td style="text-align: right; width: 250px;">
                <button
                  class="pf-c-button pf-m-link"
                  @click="cancelEditing(index)"
                  :aria-label="'Cancel editing'"
                >
                  <VSvg :src="CancelSvg" fill="currentColor" class="icon" />
                  Cancel
                </button>
                <button
                  class="pf-c-button pf-m-primary"
                  @click="confirmEditing"
                  :aria-label="'Save changes'"
                >
                  <VSvg :src="ConfirmSvg" fill="currentColor" class="icon" />
                  Save
                </button>
              </td>
            </template>

            <template v-else>
              <td>{{ item.mac }}</td>
              <td>{{ item.ip }}</td>
              <td>{{ item.hostname }}</td>
              <td>{{ item.leaseTime }}</td>
              <td>{{ item.comment }}</td>
              <td style="text-align: right;">
                <button
                  class="pf-c-button pf-m-link pf-m-small"
                  @click="startEditing(index)"
                  :aria-label="'Edit row'"
                >
                  <VSvg :src="EditSvg" fill="currentColor" class="icon" />
                  Edit
                </button>
                <button
                  class="pf-c-button pf-m-link pf-m-danger pf-m-small"
                  @click="removeRow(index)"
                  :aria-label="'Remove row'"
                >
                  <VSvg :src="DeleteSvg" fill="currentColor" class="icon" />
                  Remove
                </button>
              </td>
            </template>
          </tr>
        </template>

        <tr v-if="editingIndex === null">
          <td :colspan="4">
            <PfSelect 
              placeholder="Pre-fill with lease"
              :options="leasesOptions"
              @change="(value) => addRow(value)"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup>
import { ref, computed, watch, defineProps, defineEmits, onMounted } from 'vue'
import PfSelect from '../ui/PfSelect.vue'
import EditSvg from '@/svg/pen-to-square-solid-full.svg'
import DeleteSvg from '@/svg/trash-solid-full.svg'
import CancelSvg from '@/svg/xmark-solid-full.svg'
import ConfirmSvg from '@/svg/check-solid-full.svg'
import VSvg from '../ui/VSvg.vue';

const props = defineProps({
  leases: {
    type: Array,
    default: () => []
  },
  hosts: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['change'])

const newHosts = ref([])
const newLeaseId = ref('')
const editingIndex = ref(null)
const editingData = ref(null)

// Sync hosts prop with internal state
watch(() => props.hosts, (newHostsProp) => {
  newHosts.value = [...newHostsProp]
}, { immediate: true })

const handleInputChange = (index, field, value) => {
  const newData = [...newHosts.value]
  newData[index][field] = value
  newHosts.value = newData
}

const addRow = (value) => {
  newLeaseId.value = value
  let newRow = {
    mac: '',
    ip: '',
    hostname: '',
    leaseTime: '1h'
  }
  
  if (value !== '') {
    const newLease = props.leases[value]
    newRow = {
      ...newRow,
      mac: newLease.mac,
      ip: newLease.ip,
      hostname: newLease.hostname        
    }
  }
  
  const updatedHosts = [...newHosts.value, newRow]
  newHosts.value = updatedHosts
  editingData.value = null
  editingIndex.value = updatedHosts.length - 1
  newLeaseId.value = ''
}

const removeRow = (index) => {
  const newData = newHosts.value.filter((_, i) => i !== index)
  newHosts.value = newData
  editingIndex.value = null
  emit('change', newData)
}

const cancelEditing = (index) => {
  let resetData = [...newHosts.value]
  if (editingData.value) {
    resetData[index] = { ...editingData.value }
  } else {
    resetData.splice(index, 1)
  }
  newHosts.value = resetData
  editingIndex.value = null
}

const startEditing = (index) => {
  editingIndex.value = index
  editingData.value = { ...newHosts.value[index] }
}

const confirmEditing = () => {
  editingIndex.value = null
  emit('change', newHosts.value)
}

const isRowEditable = (index) => {
  return editingIndex.value === index
}

const leasesOptions = computed(() => {
  const options = props.leases.map((item, i) => {
    let label = `${item.mac} (${item.ip})`
    if (item.hostname) {
      label += ` (${item.hostname})`
    }
    return { value: i, mac: item.mac, label }
  })
  
  const filtered = options.filter((item) => 
    newHosts.value.findIndex((h) => h.mac === item.mac) === -1
  )
  
  return [{ label: 'Create empty' }, ...filtered]
})

const columns = [
  { key: 'mac', title: 'MAC Address' },
  { key: 'ip', title: 'IP Address' },
  { key: 'hostname', title: 'Hostname' },
  { key: 'leaseTime', title: 'Lease Time' },
  { key: 'comment', title: 'Comment' },
  { key: 'actions', title: '' }
]

onMounted(async () => {
  console.log('EditSvg',EditSvg)
})
</script>
