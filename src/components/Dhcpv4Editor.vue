<template>
  <div style="margin-bottom: 20px">

    <div style="margin-bottom: 20px">
      <pf-switch v-model:checked="config.dhcpv4.enabled" label="Enable DHCPv4" />
          </div>

          <div v-if="config.dhcpv4.enabled" class="flex-row" style="gap: 20px; flex-wrap: wrap">

      <!-- DHCP Range -->
      <pf-card class="pf-v6-u-mb-md">
        <pf-card-title>DHCP Range</pf-card-title>
        <pf-card-body>
          <pf-form>
            <div class="flex-row" style="gap: 16px; flex-wrap: wrap">
              <pf-form-control style="width: 130px">
                <label for="dhcp-start-ip">Start IP</label>
                <input
                  id="dhcp-start-ip"
                  type="text"
                  v-model="config.dhcpv4.start"
                                    placeholder="0.0.0.0"
                  :class="{ 'pf-m-error': errors.dhcpRangeStart }"
                  style="width: 100%;"
                />
                <pf-form-control-helper-text v-if="errors.dhcpRangeStart" variant="error">
                  {{ errors.dhcpRangeStart }}
                </pf-form-control-helper-text>
              </pf-form-control>

              <pf-form-control style="width: 130px">
                <label for="dhcp-end-ip">End IP</label>
                <input
                  id="dhcp-end-ip"
                  type="text"
                  v-model="config.dhcpv4.end"
                                    placeholder="0.0.0.0"
                  :class="{ 'pf-m-error': errors.dhcpRangeEnd }"
                  style="width: 100%;"
                />
                <pf-form-control-helper-text v-if="errors.dhcpRangeEnd" variant="error">
                  {{ errors.dhcpRangeEnd }}
                </pf-form-control-helper-text>
              </pf-form-control>

              <pf-form-control style="width: 130px">
                <label for="dhcp-netmask">Netmask</label>
                <input
                  id="dhcp-netmask"
                  type="text"
                  v-model="config.dhcpv4.netmask"
                                    placeholder="255.255.255.0"
                  :class="{ 'pf-m-error': errors.dhcpRangeNetmask }"
                  style="width: 100%;"
                />
                <pf-form-control-helper-text v-if="errors.dhcpRangeNetmask" variant="error">
                  {{ errors.dhcpRangeNetmask }}
                </pf-form-control-helper-text>
              </pf-form-control>

              <pf-form-control style="width: 130px">
                <label for="dhcp-gateway">Gateway</label>
                <input
                  id="dhcp-gateway"
                  type="text"
                  v-model="config.dhcpv4.router"
                                    placeholder="0.0.0.0"
                  :class="{ 'pf-m-error': errors.router }"
                  style="width: 100%;"
                />
                <pf-form-control-helper-text v-if="errors.router" variant="error">
                  {{ errors.router }}
                </pf-form-control-helper-text>
              </pf-form-control>
            </div>

            <div class="flex-row" style="gap: 16px; flex-wrap: wrap; margin-top: 16px">
              <pf-form-control style="width: 280px">
                <label for="domain-name">Domain Name</label>
                <input
                  type="text"
                  id="domain-name"
                  v-model="config.domain"
                                    placeholder="office.local"
                  style="width: 100%;"
                />
              </pf-form-control>

              <pf-form-control style="width: 130px">
                <label for="dhcp-lease-time">Lease Time</label>
                <input
                  id="dhcp-lease-time"
                  type="text"
                  v-model="config.dhcpv4.leaseTime"
                                    placeholder="24h"
                  :class="{ 'pf-m-error': errors.dhcpLeaseTime }"
                  style="width: 100%;"
                />
                <pf-form-control-helper-text v-if="errors.dhcpLeaseTime" variant="error">
                  {{ errors.dhcpLeaseTime }}
                </pf-form-control-helper-text>
              </pf-form-control>

              <pf-form-control style="width: 130px">
                <label for="dhcp-lease-max">DHCP Lease Max</label>
                <input
                  type="number"
                  id="dhcp-lease-max"
                  v-model="config.dhcpLeaseMax"
                  @updatev-model="config.dhcpLeaseMax = parseInt($event) || 0"
                  min="1"
                  max="10000"
                  :class="{ 'pf-m-error': errors.dhcpLeaseMax }"
                  style="width: 100%;"
                />
                <pf-form-control-helper-text v-if="errors.dhcpLeaseMax" variant="error">
                  {{ errors.dhcpLeaseMax }}
                </pf-form-control-helper-text>
              </pf-form-control>
            </div>
          </pf-form>
        </pf-card-body>
      </pf-card>

      <!-- DNS Servers -->
      <pf-card style="width: 200px">
        <pf-card-title>DNS Servers</pf-card-title>
        <pf-card-body>
          <EditList ref="editDns" @changed="config.dhcpv4.dnsServers = $event" :items="config.dhcpv4.dnsServers" placeholder="8.8.8.8" />
        </pf-card-body>
      </pf-card>

      <!-- NTP Servers -->
      <pf-card style="width: 200px">
        <pf-card-title>NTP Servers</pf-card-title>
        <pf-card-body>
          <EditList ref="editNtp" @changed="config.dhcpv4.ntpServers = $event" :items="config.dhcpv4.ntpServers" placeholder="0.0.0.0" />
        </pf-card-body>
      </pf-card>

    </div>
  </div>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue'
import EditList from '../ui/EditList.vue'

const props = defineProps({
  //Config struture in src\model\dnsmasq-config.js
  initialConfig: {
    type: Object
  },
  onSave: {
    type: Function,
    default: (config) => console.log('Saving config:', config)
  }
})

const config = ref({ ...props.initialConfig })
const errors = ref({})
const editDns = ref(null)
const editNtp = ref(null)
 
// Watch for changes in initialConfig prop
watch(() => props.initialConfig, (newConfig) => {
  config.value = { ...newConfig }
}, { deep: true })

const validateIpAddress = (ip) => {
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(ip)) return false;
  
  const parts = ip.split('.');
  return parts.every(part => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
}

function validateForm() {
  const newErrors = {}

  // Validate interfaces
  if (!config.value.interfaces || config.value.interfaces.length === 0) {
    newErrors.interfaces = 'At least one interface is required'
  }

  // Validate DHCP range
  if (!config.value.dhcpv4.start || !validateIpAddress(config.value.dhcpv4.start)) {
    newErrors.dhcpRangeStart = 'Valid start IP address is required'
  }
  if (!config.value.dhcpv4.end || !validateIpAddress(config.value.dhcpv4.end)) {
    newErrors.dhcpRangeEnd = 'Valid end IP address is required'
  }
  if (!config.value.dhcpv4.netmask || !validateIpAddress(config.value.dhcpv4.netmask)) {
    newErrors.dhcpRangeNetmask = 'Valid netmask is required'
  }
  if (config.value.dhcpv4.router && !validateIpAddress(config.value.dhcpv4.router)) {
    newErrors.router = 'Invalid gateway'
  }
  if (config.value.dhcpv4.leaseTime && !validateLeaseTime(config.value.dhcpv4.leaseTime)) {
    newErrors.dhcpLeaseTime = 'Valid lease time required (e.g., 24h, 7d)'
  }

  // Validate DNS servers
  if (config.value.dhcpv4.dnsServers && config.value.dhcpv4.dnsServers.length > 0) {
    config.value.dhcpv4.dnsServers.forEach((dns, index) => {
      if (!validateIpAddress(dns)) {
        newErrors[`dns-${index}`] = 'Valid DNS server IP address is required'
      }
    })
  }
    // Validate DHCP lease max
  if (config.value.dhcpLeaseMax < 1 || config.value.dhcpLeaseMax > 10000) {
    newErrors.dhcpLeaseMax = 'DHCP lease max must be between 1 and 10000'
  }
  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

async function getConfig() {
  editDns.value.save()
  editNtp.value.save()
  await nextTick()
  return config.value
}

const validateLeaseTime = (leaseTime) => {
  const leaseRegex = /^(\d+)([hmd])$/;
  return leaseRegex.test(leaseTime)
}

const handleDhcpRangeChange = (field, value) => {
  config.value.dhcpv4 = {
    ...config.value.dhcpv4,
    [field]: value
  }
}

defineExpose({
  validateForm,
  getConfig
})
</script>
