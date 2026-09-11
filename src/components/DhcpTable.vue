<template>
  <div>
    <table class="pf-c-table pf-m-compact" aria-label="Dhcp leases table">
      <thead>
        <tr>
          <th>MAC Address</th>
          <th>IP Address</th>
          <th>Hostname</th>
          <th>Status</th>
          <th>Expiry Date</th>
          <!--<th>Client ID</th>-->
          <th :style="{ width: '200px' }"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in data" :key="index">
          <td>{{ item.mac }}</td>
          <td>{{ item.ip }}</td>
          <td>{{ item.hostname }}</td>
          <td>{{ formatTimestamp(item.timestamp) }}</td>
          <td>
            <span
              :style="{
                color: item.isActive ? 'green' : 'red',
                fontWeight: 'bold'
              }"
            >
              {{ item.isActive ? 'Active' : 'Inactive' }}
            </span>
          </td>
          <!--<td :style="{ fontFamily: 'monospace', fontSize: '12px' }">
            {{ item.clientId }}
          </td>-->
          <td :style="{ textAlign: 'right' }">
            <pf-tooltip>
              <template #content>Remove lease</template>
              <pf-button variant="link" @click="removeRow(index)">
                <VSvg :src="DeleteSvg" fill="currentColor" class="icon"  style="height: 16px" />
              </pf-button>
            </pf-tooltip>            
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import DeleteSvg from '@/svg/trash-solid-full.svg'
import VSvg from '../ui/VSvg.vue';
import { defineProps } from 'vue';

const props = defineProps({
  data: {
    type: Array,
    required: true,
    default: () => []
  }
});

// Function to format timestamp to readable date
const formatTimestamp = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleString();
};

// Function to remove row
const removeRow = (index) => {
  alert('removeRow ' + index);
};
</script>
