<template>
  <div style="margin-bottom: 20px">
    <div class="flex-row" style="gap: 20px; flex-wrap: wrap">

      <!-- General Settings -->
      <pf-card class="pf-v6-u-mb-md" style="min-width: 420px">
        <pf-card-title>General Settings</pf-card-title>
        <pf-card-body>
          <pf-form>
            <div class="flex-row" style="gap: 16px; flex-wrap: wrap">
              <pf-form-control style="width: 130px">
                <label for="dns-cache-size">Cache Size</label>
                <input
                  type="number"
                  id="dns-cache-size"
                  v-model="config.dns.cacheSize"
                  @updatev-model="config.dns.cacheSize = parseInt($event) || 0"
                  min="0"
                  :class="{ 'pf-m-error': errors.cacheSize }"
                  style="width: 100%;"
                />
                <pf-form-control-helper-text v-if="errors.cacheSize" variant="error">
                  {{ errors.cacheSize }}
                </pf-form-control-helper-text>
              </pf-form-control>
            </div>

            <div style="margin-top: 16px; display: flex; flex-direction: column; gap: 8px">
              <pf-switch v-model:checked="config.dns.noResolv" label="no-resolv — don't read /etc/resolv.conf" />
              <pf-switch v-model:checked="config.dns.noHosts" label="no-hosts — don't read /etc/hosts" />
              <pf-switch v-model:checked="config.dns.domainNeeded" label="domain-needed — don't forward domain-less names" />
              <pf-switch v-model:checked="config.dns.bogusPriv" label="bogus-priv — don't forward reverse lookups for private ranges" />
              <pf-switch v-model:checked="config.dns.expandHosts" label="expand-hosts — add domain to simple names in /etc/hosts" />
            </div>
          </pf-form>
        </pf-card-body>
      </pf-card>

      <!-- Upstream Servers -->
      <pf-card style="width: 280px">
        <pf-card-title>Upstream Servers</pf-card-title>
        <pf-card-body>
          <EditList ref="editServers" @changed="config.dns.servers = $event" :items="config.dns.servers" placeholder="8.8.8.8" />
        </pf-card-body>
      </pf-card>

      <!-- Local Domains -->
      <pf-card style="width: 280px">
        <pf-card-title>Local Domains</pf-card-title>
        <pf-card-body>
          <EditList ref="editLocal" @changed="config.dns.local = $event" :items="config.dns.local" placeholder="/office.local/" />
        </pf-card-body>
      </pf-card>

      <!-- DNS Addresses -->
      <pf-card style="width: 280px">
        <pf-card-title>DNS Addresses</pf-card-title>
        <pf-card-body>
          <EditList ref="editAddresses" @changed="config.dns.addresses = $event" :items="config.dns.addresses" placeholder="/example.com/1.2.3.4" />
        </pf-card-body>
      </pf-card>

      <!-- Host Records -->
      <pf-card style="width: 280px">
        <pf-card-title>Host Records</pf-card-title>
        <pf-card-body>
          <EditList ref="editHostRecords" @changed="config.dns.hostRecords = $event" :items="config.dns.hostRecords" placeholder="host,1.2.3.4" />
        </pf-card-body>
      </pf-card>

      <!-- CNAMEs -->
      <pf-card style="width: 280px">
        <pf-card-title>CNAMEs</pf-card-title>
        <pf-card-body>
          <EditList ref="editCnames" @changed="config.dns.cnames = $event" :items="config.dns.cnames" placeholder="/alias/target/" />
        </pf-card-body>
      </pf-card>

      <!-- Listen Addresses -->
      <pf-card style="width: 280px">
        <pf-card-title>Listen Addresses</pf-card-title>
        <pf-card-body>
          <EditList ref="editListenAddresses" @changed="config.dns.listenAddresses = $event" :items="config.dns.listenAddresses" placeholder="192.168.1.1" />
        </pf-card-body>
      </pf-card>

      <!-- Interface Names -->
      <pf-card style="width: 280px">
        <pf-card-title>Interface Names</pf-card-title>
        <pf-card-body>
          <EditList ref="editInterfaceNames" @changed="config.dns.interfaceNames = $event" :items="config.dns.interfaceNames" placeholder="eth0" />
        </pf-card-body>
      </pf-card>

      <!-- Additional Hosts Files -->
      <pf-card style="width: 280px">
        <pf-card-title>Additional Hosts Files</pf-card-title>
        <pf-card-body>
          <EditList ref="editAddnHosts" @changed="config.dns.addnHosts = $event" :items="config.dns.addnHosts" placeholder="/etc/hosts-extra" />
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
    type: Object
  },
  onSave: {
    type: Function,
    default: (config) => console.log('Saving config:', config)
  }
})

const config = ref({ ...props.initialConfig })
const errors = ref({})

const editServers = ref(null)
const editLocal = ref(null)
const editAddresses = ref(null)
const editHostRecords = ref(null)
const editCnames = ref(null)
const editListenAddresses = ref(null)
const editInterfaceNames = ref(null)
const editAddnHosts = ref(null)

watch(() => props.initialConfig, (newConfig) => {
  config.value = { ...newConfig }
}, { deep: true })

function validateForm() {
  const newErrors = {}

  if (config.value.dns.cacheSize != null && config.value.dns.cacheSize !== '') {
    const cs = parseInt(config.value.dns.cacheSize)
    if (isNaN(cs) || cs < 0) {
      newErrors.cacheSize = 'Cache size must be a non-negative number'
    }
  }

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

async function getConfig() {
  editServers.value.save()
  editLocal.value.save()
  editAddresses.value.save()
  editHostRecords.value.save()
  editCnames.value.save()
  editListenAddresses.value.save()
  editInterfaceNames.value.save()
  editAddnHosts.value.save()
  await nextTick()
  return config.value
}

defineExpose({
  validateForm,
  getConfig
})
</script>