<template>
  <div style="margin-bottom: 20px">

    <!-- Mode -->
    <pf-card class="pf-v6-u-mb-md">
      <pf-card-title>Mode</pf-card-title>
      <pf-card-body>
        <div class="flex-row" style="gap: 16px; flex-wrap: wrap">
          <pf-checkbox
            v-for="mode in modes"
            :key="mode.value"
            :id="'dhcpv6-mode-' + mode.value"
            :label="mode.label"
            :model-value="config.dhcpv6.mode.includes(mode.value)"
            @update:model-value="(checked) => toggleMode(mode.value, checked)"
          />
        </div>
        <pf-form-control-helper-text v-if="errors.mode" variant="error">
          {{ errors.mode }}
        </pf-form-control-helper-text>
      </pf-card-body>
    </pf-card>

    <div v-if="config.dhcpv6.mode.length" class="flex-row" style="gap: 20px; flex-wrap: wrap">

      <!-- DHCP Range -->
      <pf-card class="pf-v6-u-mb-md">
        <pf-card-title>DHCP Range</pf-card-title>
        <pf-card-body>
          <pf-form>
            <div class="flex-row" style="gap: 16px; flex-wrap: wrap">
              <pf-form-control style="width: 200px">
                <label for="dhcpv6-start">Start</label>
                <input
                  id="dhcpv6-start"
                  type="text"
                  v-model="config.dhcpv6.start"
                  placeholder="fd00::10"
                  :class="{ 'pf-m-error': errors.dhcpv6Start }"
                  style="width: 100%;"
                />
                <pf-form-control-helper-text v-if="errors.dhcpv6Start" variant="error">
                  {{ errors.dhcpv6Start }}
                </pf-form-control-helper-text>
              </pf-form-control>

              <pf-form-control style="width: 200px">
                <label for="dhcpv6-end">End</label>
                <input
                  id="dhcpv6-end"
                  type="text"
                  v-model="config.dhcpv6.end"
                  placeholder="fd00::20"
                  :class="{ 'pf-m-error': errors.dhcpv6End }"
                  style="width: 100%;"
                />
                <pf-form-control-helper-text v-if="errors.dhcpv6End" variant="error">
                  {{ errors.dhcpv6End }}
                </pf-form-control-helper-text>
              </pf-form-control>

              <pf-form-control style="width: 150px">
                <label for="dhcpv6-constructor">Constructor</label>
                <input
                  id="dhcpv6-constructor"
                  type="text"
                  v-model="config.dhcpv6.constr"
                  placeholder="eth0"
                  style="width: 100%;"
                />
              </pf-form-control>

              <pf-form-control style="width: 130px">
                <label for="dhcpv6-prefix-length">Prefix Length</label>
                <input
                  id="dhcpv6-prefix-length"
                  type="number"
                  :value="config.dhcpv6.prefixLength"
                  @input="onPrefixLengthInput"
                  min="1"
                  max="128"
                  :class="{ 'pf-m-error': errors.dhcpv6PrefixLength }"
                  style="width: 100%;"
                />
                <pf-form-control-helper-text v-if="errors.dhcpv6PrefixLength" variant="error">
                  {{ errors.dhcpv6PrefixLength }}
                </pf-form-control-helper-text>
              </pf-form-control>

              <pf-form-control style="width: 130px">
                <label for="dhcpv6-lease-time">Lease Time</label>
                <input
                  id="dhcpv6-lease-time"
                  type="text"
                  v-model="config.dhcpv6.leaseTime"
                  placeholder="24h"
                  :class="{ 'pf-m-error': errors.dhcpv6LeaseTime }"
                  style="width: 100%;"
                />
                <pf-form-control-helper-text v-if="errors.dhcpv6LeaseTime" variant="error">
                  {{ errors.dhcpv6LeaseTime }}
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
          <EditList ref="editDns" @changed="config.dhcpv6.dnsServers = $event" :items="config.dhcpv6.dnsServers" placeholder="fd00::53" />
        </pf-card-body>
      </pf-card>

      <!-- NTP Servers -->
      <pf-card style="width: 200px">
        <pf-card-title>NTP Servers</pf-card-title>
        <pf-card-body>
          <EditList ref="editNtp" @changed="config.dhcpv6.ntpServers = $event" :items="config.dhcpv6.ntpServers" placeholder="fd00::123" />
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

// DHCPv6 / RA modes (see DHCPV6_MODES in src\model\config-parser.js)
const modes = [
  { value: 'slaac', label: 'slaac — Stateless address autoconfiguration' },
  { value: 'ra-names', label: 'ra-names — RA with DNS names' },
  { value: 'ra-stateless', label: 'ra-stateless — RA + stateless DHCPv6' },
  { value: 'ra-only', label: 'ra-only — RA only' },
  { value: 'stateful', label: 'stateful — Stateful DHCPv6' }
]

// Watch for changes in initialConfig prop
watch(() => props.initialConfig, (newConfig) => {
  config.value = { ...newConfig }
}, { deep: true })

function toggleMode(mode, checked) {
  const set = new Set(config.value.dhcpv6.mode)
  if (checked) set.add(mode)
  else set.delete(mode)
  config.value.dhcpv6.mode = Array.from(set)
}

// Prefix Length: сохраняем число или null (пустое поле)
function onPrefixLengthInput(event) {
  const val = event.target.value
  config.value.dhcpv6.prefixLength = val === '' ? null : parseInt(val, 10)
}

const IPV6_REGEX = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/

const validateIpv6 = (ip) => IPV6_REGEX.test(ip)

const validateLeaseTime = (leaseTime) => {
  const leaseRegex = /^(\d+)([hmd])$/;
  return leaseRegex.test(leaseTime)
}

function validateForm() {
  const newErrors = {}
  const v6 = config.value.dhcpv6

  // Must select at least one mode
  if (!v6.mode || v6.mode.length === 0) {
    newErrors.mode = 'Select at least one mode'
  }

  // Validate range
  if (v6.start && !validateIpv6(v6.start)) {
    newErrors.dhcpv6Start = 'Valid start IPv6 address is required'
  }
  if (v6.end && !validateIpv6(v6.end)) {
    newErrors.dhcpv6End = 'Valid end IPv6 address is required'
  }
  if (v6.prefixLength != null && (v6.prefixLength < 1 || v6.prefixLength > 128)) {
    newErrors.dhcpv6PrefixLength = 'Prefix length must be between 1 and 128'
  }
  if (v6.leaseTime && !validateLeaseTime(v6.leaseTime)) {
    newErrors.dhcpv6LeaseTime = 'Valid lease time required (e.g., 24h, 7d)'
  }

  // Validate DNS servers
  if (v6.dnsServers && v6.dnsServers.length > 0) {
    v6.dnsServers.forEach((dns, index) => {
      if (!validateIpv6(dns)) {
        newErrors[`dnsv6-${index}`] = 'Valid DNS server IPv6 address is required'
      }
    })
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

defineExpose({
  validateForm,
  getConfig
})
</script>