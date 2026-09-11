<template>
  <div style="margin-bottom: 20px">
    <div class="flex-row" style="gap: 20px; flex-wrap: wrap">

      <!-- DHCP Range -->
      <pf-card class="pf-v6-u-mb-md">
        <pf-card-title>DHCP Range</pf-card-title>
        <pf-card-body>
          <pf-form>
            <div class="flex-row" style="gap: 16px; flex-wrap: wrap">
              <pf-form-control style="width: 150px">
                <label for="dhcp-start-ip">Start IP</label>
                <input
                  id="dhcp-start-ip"
                  type="text"
                  :model-value="config.dhcpRange.start"
                  @update:model-value="handleDhcpRangeChange('start', $event)"
                  placeholder="0.0.0.0"
                  :class="{ 'pf-m-error': errors.dhcpRangeStart }"
                />
                <pf-form-control-helper-text v-if="errors.dhcpRangeStart" variant="error">
                  {{ errors.dhcpRangeStart }}
                </pf-form-control-helper-text>
              </pf-form-control>

              <pf-form-control style="width: 150px">
                <label for="dhcp-end-ip">End IP</label>
                <input
                  id="dhcp-end-ip"
                  type="text"
                  :model-value="config.dhcpRange.end"
                  @update:model-value="handleDhcpRangeChange('end', $event)"
                  placeholder="0.0.0.0"
                  :class="{ 'pf-m-error': errors.dhcpRangeEnd }"
                />
                <pf-form-control-helper-text v-if="errors.dhcpRangeEnd" variant="error">
                  {{ errors.dhcpRangeEnd }}
                </pf-form-control-helper-text>
              </pf-form-control>

              <pf-form-control style="width: 150px">
                <label for="dhcp-netmask">Netmask</label>
                <input
                  id="dhcp-netmask"
                  type="text"
                  :model-value="config.dhcpRange.netmask"
                  @update:model-value="handleDhcpRangeChange('netmask', $event)"
                  placeholder="255.255.255.0"
                  :class="{ 'pf-m-error': errors.dhcpRangeNetmask }"
                />
                <pf-form-control-helper-text v-if="errors.dhcpRangeNetmask" variant="error">
                  {{ errors.dhcpRangeNetmask }}
                </pf-form-control-helper-text>
              </pf-form-control>

              <pf-form-control style="width: 150px">
                <label for="dhcp-gateway">Gateway</label>
                <input
                  id="dhcp-gateway"
                  type="text"
                  :model-value="config.router"
                  @update:model-value="config.router = $event"
                  placeholder="0.0.0.0"
                  :class="{ 'pf-m-error': errors.router }"
                />
                <pf-form-control-helper-text v-if="errors.router" variant="error">
                  {{ errors.router }}
                </pf-form-control-helper-text>
              </pf-form-control>
            </div>

            <div class="flex-row" style="gap: 16px; flex-wrap: wrap; margin-top: 16px">
              <pf-form-control style="width: 316px">
                <label for="domain-name">Domain Name</label>
                <input
                  type="text"
                  id="domain-name"
                  :model-value="config.domainName"
                  @update:model-value="config.domainName = $event"
                  placeholder="office.local"
                />
              </pf-form-control>

              <pf-form-control style="width: 150px">
                <label for="dhcp-lease-time">Lease Time</label>
                <input
                  id="dhcp-lease-time"
                  type="text"
                  :model-value="config.leaseTime"
                  @update:model-value="config.leaseTime = $event"
                  placeholder="24h"
                  :class="{ 'pf-m-error': errors.dhcpLeaseTime }"
                />
                <pf-form-control-helper-text v-if="errors.dhcpLeaseTime" variant="error">
                  {{ errors.dhcpLeaseTime }}
                </pf-form-control-helper-text>
              </pf-form-control>

              <pf-form-control style="width: 150px">
                <label for="dhcp-lease-max">DHCP Lease Max</label>
                <input
                  type="number"
                  id="dhcp-lease-max"
                  :model-value="config.dhcpLeaseMax"
                  @update:model-value="config.dhcpLeaseMax = parseInt($event) || 0"
                  min="1"
                  max="10000"
                  :class="{ 'pf-m-error': errors.dhcpLeaseMax }"
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
          <EditList ref="editDns" @changed="config.dnsServers = $event" :items="config.dnsServers" placeholder="8.8.8.8" />
        </pf-card-body>
      </pf-card>

      <!-- NTP Servers -->
      <pf-card style="width: 200px">
        <pf-card-title>NTP Servers</pf-card-title>
        <pf-card-body>
          <EditList ref="editNtp" @changed="config.ntpServers = $event" :items="config.ntpServers" placeholder="0.0.0.0" />
        </pf-card-body>
      </pf-card>

    </div>
  </div>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue'
import EditList from '../ui/EditList.vue'

const props = defineProps({
  initialConfig: {
    type: Object,
    default: () => ({
      interfaces: [],
      dhcpRange: {
        start: '',
        end: '',
        netmask: '',
        leaseTime: ''
      },
      router: '',
      dnsServers: [],
      ntpServers: [],
      domainName: '',
      dhcpLeaseMax: 0
    })
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
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
  if (!ipRegex.test(ip)) return false
  
  const parts = ip.split('.')
  return parts.every(part => {
    const num = parseInt(part, 10)
    return num >= 0 && num <= 255
  })
}

function validateForm() {
  const newErrors = {}

  // Validate interfaces
  if (!config.value.interfaces || config.value.interfaces.length === 0) {
    newErrors.interfaces = 'At least one interface is required'
  }

  // Validate DHCP range
  if (!config.value.dhcpRange.start || !validateIpAddress(config.value.dhcpRange.start)) {
    newErrors.dhcpRangeStart = 'Valid start IP address is required'
  }
  if (!config.value.dhcpRange.end || !validateIpAddress(config.value.dhcpRange.end)) {
    newErrors.dhcpRangeEnd = 'Valid end IP address is required'
  }
  if (!config.value.dhcpRange.netmask || !validateIpAddress(config.value.dhcpRange.netmask)) {
    newErrors.dhcpRangeNetmask = 'Valid netmask is required'
  }
  if (config.value.router && !validateIpAddress(config.value.router)) {
    newErrors.router = 'Invalid gateway'
  }
  if (config.value.leaseTime && !validateLeaseTime(config.value.leaseTime)) {
    newErrors.dhcpLeaseTime = 'Valid lease time required (e.g., 24h, 7d)'
  }

  // Validate DNS servers
  if (config.value.dnsServers && config.value.dnsServers.length > 0) {
    config.value.dnsServers.forEach((dns, index) => {
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
  const leaseRegex = /^(\d+)([hmd])$/
  return leaseRegex.test(leaseTime)
}

const handleDhcpRangeChange = (field, value) => {
  config.value.dhcpRange = {
    ...config.value.dhcpRange,
    [field]: value
  }
}

defineExpose({
  validateForm,
  getConfig
})
</script>