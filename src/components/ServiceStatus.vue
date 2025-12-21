<template>
  <div class="panel panel-default">
    <div class="panel-heading">
      <h3>Service Status</h3>
    </div>
    <div class="panel-body">
      <div class="pf-c-card" component="div">
        <div class="pf-c-card__body">
          <div class="pf-l-flex pf-m-column pf-m-align-items-center pf-m-gap-md">
            <div class="pf-l-flex__item">
              <div class="pf-l-flex pf-m-align-items-center pf-m-gap-sm">
                <div class="pf-l-flex__item">
                  <template v-if="isActive">
                    <!--CheckCircleIcon class="pf-v6-u-color-100" /-->CheckCircleIcon
                  </template>
                  <template v-else>
                    <!--ExclamationCircleIcon class="pf-v6-u-color-200" /-->ExclamationCircleIcon
                  </template>
                </div>
                <div class="pf-l-flex__item">
                  Status: <span :class="isActive ? 'pf-v6-u-color-100' : 'pf-v6-u-color-200'">
                    {{ serviceStatus }}
                  </span>
                </div>
              </div>
            </div>
            <div class="pf-l-flex__item">
              <div class="pf-l-flex pf-m-gap-sm">
                <template v-if="buttons.start">
                  <button class="pf-c-button pf-m-primary" @click="handleStart">
                    Start
                  </button>
                </template>
                <template v-if="buttons.stop">
                  <button class="pf-c-button pf-m-danger" @click="handleStop">
                    Stop
                  </button>
                </template>
                <template v-if="buttons.restart">
                  <button class="pf-c-button pf-m-warning" @click="handleRestart">
                    Restart
                  </button>
                </template>
                <template v-if="buttons.reload">
                  <button class="pf-c-button pf-m-secondary" @click="handleReload">
                    Reload
                  </button>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
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
