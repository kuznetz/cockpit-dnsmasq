<template>
  <div>
    <div class="flex-row" style="gap: 5px">

        <!-- DHCP Range -->
        <div class="card" style="margin-bottom: 10px">
          <div class="card-title">DHCP Range</div>
          <div class="card-body padding flex-column" style="gap: 16px">
            <div class="flex-row" style="gap: 16px">
              <div style="width: 150px">
                <div class="form-group">
                  <label for="dhcp-start-ip">Start IP</label>
                  <input
                    id="dhcp-start-ip"
                    type="text"
                    :value="config.dhcpRange.start"
                    @input="handleDhcpRangeChange('start', $event.target.value)"
                    placeholder="0.0.0.0"
                    :class="{ 'error-input': errors.dhcpRangeStart }"
                  />
                  <div v-if="errors.dhcpRangeStart" class="error-text">{{ errors.dhcpRangeStart }}</div>
                </div>
              </div>
              <div style="width: 150px">
                <div class="form-group">
                  <label for="dhcp-end-ip">End IP</label>
                  <input
                    id="dhcp-end-ip"
                    type="text"
                    :value="config.dhcpRange.end"
                    @input="handleDhcpRangeChange('end', $event.target.value)"
                    placeholder="0.0.0.0"
                    :class="{ 'error-input': errors.dhcpRangeEnd }"
                  />
                  <div v-if="errors.dhcpRangeEnd" class="error-text">{{ errors.dhcpRangeEnd }}</div>
                </div>
              </div>

              <div style="width: 150px">
                <div class="form-group">
                  <label for="dhcp-netmask">Netmask</label>
                  <input
                    id="dhcp-netmask"
                    type="text"
                    :value="config.dhcpRange.netmask"
                    @input="handleDhcpRangeChange('netmask', $event.target.value)"
                    placeholder="255.255.255.0"
                    :class="{ 'error-input': errors.dhcpRangeNetmask }"
                  />
                  <div v-if="errors.dhcpRangeNetmask" class="error-text">{{ errors.dhcpRangeNetmask }}</div>
                </div>
              </div>

              <div style="width: 150px">
                <div class="form-group">
                  <label for="dhcp-gateway">Gateway</label>
                  <input
                    id="dhcp-gateway"
                    type="text"
                    :value="config.router"
                    @input="config.router = $event.target.value"
                    placeholder="0.0.0.0"
                    :class="{ 'error-input': errors.dhcpRangeNetmask }"
                  />
                  <div v-if="errors.router" class="error-text">{{ errors.router }}</div>
                </div>
              </div>

              <div style="width: 150px">
                <label for="broadcast-address">Broadcast Address</label>
                <input
                  type="text"
                  id="broadcast-address"
                  :value="config.broadcast"
                  @input="config.broadcast = $event.target.value"
                  placeholder="192.168.10.255"
                  :class="{ 'error-input': errors.broadcast }"
                />
                <div v-if="errors.broadcast" class="error-text">{{ errors.broadcast }}</div>
              </div>              
            </div>

            <div class="flex-row" style="gap: 16px">

              <div  style="width: 316px">
                <label for="domain-name">Domain Name</label>
                <input
                  type="text"
                  id="domain-name"
                  :value="config.domainName"
                  @input="config.domainName = $event.target.value"
                  placeholder="office.local"
                />
              </div>

              <div style="width: 150px">
                <div class="form-group">
                  <label for="dhcp-lease-time">Lease Time</label>
                  <input
                    id="dhcp-lease-time"
                    type="text"
                    :value="config.dhcpRange.leaseTime"
                    @input="handleDhcpRangeChange('leaseTime', $event.target.value)"
                    placeholder="24h"
                    :class="{ 'error-input': errors.dhcpRangeLeaseTime }"
                  />
                  <div v-if="errors.dhcpRangeLeaseTime" class="error-text">{{ errors.dhcpRangeLeaseTime }}</div>
                </div>
              </div>

              <div style="width: 150px">
                <label for="dhcp-lease-max">DHCP Lease Max</label>
                <input
                  type="number"
                  id="dhcp-lease-max"
                  :value="config.dhcpLeaseMax"
                  @input="config.dhcpLeaseMax = parseInt($event.target.value) || 0"
                  min="1"
                  max="10000"
                  :class="{ 'error-input': errors.dhcpLeaseMax }"
                />
                <div v-if="errors.dhcpLeaseMax" class="error-text">{{ errors.dhcpLeaseMax }}</div>
              </div>
              
            </div>
          </div>
        </div>

    </div>
    <div class="flex-row" style="gap: 5px">

        <!-- Interfaces -->
        <div class="card" style="width: 200px">
          <div class="card-title">Interfaces</div>
          <div class="card-body padding">
            <EditList @changed="config.interfaces = $event" :items="config.interfaces" placeholder="eth0" />
          </div>
        </div>

        <!-- DNS Servers -->
        <div class="card" style="width: 200px">
          <div class="card-title">DNS Servers</div>
          <div class="card-body padding">
            <EditList @changed="config.dnsServers = $event" :items="config.dnsServers" placeholder="8.8.8.8" />
          </div>
        </div>

    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
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
      domainName: '',
      broadcast: '',
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
  if (config.value.dhcpRange.leaseTime && !validateLeaseTime(config.value.dhcpRange.leaseTime)) {
    newErrors.dhcpRangeLeaseTime = 'Valid lease time required (e.g., 24h, 7d)'
  }

  // Validate DNS servers
  if (config.value.dnsServers && config.value.dnsServers.length > 0) {
    config.value.dnsServers.forEach((dns, index) => {
      if (!validateIpAddress(dns)) {
        newErrors[`dns-${index}`] = 'Valid DNS server IP address is required'
      }
    })
  }
  // Validate broadcast
  if (config.value.broadcast && !validateIpAddress(config.value.broadcast)) {
    newErrors.broadcast = 'Valid broadcast address is required'
  }
  // Validate DHCP lease max
  if (config.value.dhcpLeaseMax < 1 || config.value.dhcpLeaseMax > 10000) {
    newErrors.dhcpLeaseMax = 'DHCP lease max must be between 1 and 10000'
  }
  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

function getConfig() {
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