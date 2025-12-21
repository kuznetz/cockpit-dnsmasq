<template>
  <div class="flex-column">
    <div>
      <h3 style="margin-bottom: 3px">Service Status: 
        <span :style="{color: (isActive ? 'green' : 'red')}">
          {{ serviceStatus }}
        </span>
      </h3>
    </div>
    <div style="text-align: right;">
      <button v-if="buttons.start" class="primary" @click="handleStart">
        Start
      </button>
      <button v-if="buttons.stop" class="danger" @click="handleStop">
        Stop
      </button>
      <button v-if="buttons.restart" class="warning" @click="handleRestart">
        Restart
      </button>
      <button v-if="buttons.reload" class="secondary" @click="handleReload">
        Reload
      </button>
    </div>
  </div>
</template>

<script setup>
import DnsmasqApi from 'dnsmasq-api';
import { ref, computed, onMounted, onUnmounted } from 'vue';

const serviceStatus = ref('Checking...');

// Computed property for button visibility
const buttons = computed(() => {
  if (serviceStatus.value === "active") {
    return { start: false, stop: true, restart: true, reload: true };
  } else if (serviceStatus.value === "Inactive/Error") {
    return { start: true, stop: false, restart: false, reload: false };
  }
  return { start: false, stop: false, restart: false, reload: false };
});

// Computed property for active status
const isActive = computed(() => serviceStatus.value === "active");

const checkStatus = async () => {
  try {
    const data = await DnsmasqApi.checkStatus();
    serviceStatus.value = data.trim();
  } catch (error) {
    serviceStatus.value = "Inactive/Error";
  }
};

// Button event handlers
const handleStart = async () => {
  try {
    await DnsmasqApi.startService();
    await checkStatus();
  } catch (error) {
    console.error("Failed to start dnsmasq:", error);
  }
};

const handleStop = async () => {
  try {
    await DnsmasqApi.stopService();
    await checkStatus();
  } catch (error) {
    console.error("Failed to stop dnsmasq:", error);
  }
};

const handleRestart = async () => {
  try {
    await DnsmasqApi.restartService();
    await checkStatus();
  } catch (error) {
    console.error("Failed to restart dnsmasq:", error);
  }
};

const handleReload = async () => {
  try {
    await DnsmasqApi.reloadService();
    await checkStatus();
  } catch (error) {
    console.error("Failed to reload dnsmasq:", error);
  }
};

// Initialize
onMounted(() => {
  checkStatus();
  // Refresh status every 10 seconds
  const interval = setInterval(checkStatus, 10000);
  
  // Cleanup on unmount
  onUnmounted(() => clearInterval(interval));
});
</script>
