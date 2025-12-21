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
            <button
              class="pf-c-button pf-m-link pf-m-danger"
              type="button"
              @click="removeRow(index)"
              aria-label="Remove"
            >
              <i class="fas fa-trash" aria-hidden="true"></i>
              Remove
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
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
