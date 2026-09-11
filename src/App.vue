<template>
  <div class="main-container">
    <!-- Notification (PatternFly Toast Alert Group / Alert) -->
    <div 
      v-if="notification" 
      class="pf-v6-c-alert-group pf-m-toast"
      :style="{ position: 'fixed', top: '20px', right: '20px', zIndex: '1000' }"
    >
      <pf-alert 
        variant="success" 
        title="Success" 
        :is-inline="true"
        @action-close="notification = null"
      >
        {{ notification }}
      </pf-alert>
    </div>
      
    <!-- Main Content -->
    <div v-if="loaded">
      <ParserWarnings v-if="parsedConf.parserWarnings?.length" :warnings="parsedConf.parserWarnings" />

      <!-- PatternFly 6 Tabs -->
      <pf-tabs v-model:active-key="activeTab" class="pf-v6-u-mb-md">
        <pf-tab v-for="tab in tabs" :key="tab.name" :event-key="tab.name" :title="tab.label">
          
          <!-- Content Padding via PatternFly Utilities -->
          <div class="pf-v6-u-p-md">
            
            <div v-if="activeTab === 'network'">
              <NetworkEditor @changed="parsedConf.interfaces = $event" :systemInterfaces="networks" :interfaces="parsedConf.interfaces" />
              <!-- PF Action Buttons -->
              <div class="pf-v6-u-text-align-center pf-v6-u-p-md">
                <pf-button variant="primary" @click="handleSave">
                  Save Configuration
                </pf-button>
              </div>
            </div>

            <div v-else-if="activeTab === 'dhcp'">
              <ConfigEditor ref="configEditorUi" :initial-config="parsedConf" />
              <div class="pf-v6-u-text-align-center pf-v6-u-p-md">
                <pf-button variant="primary" @click="handleSave">
                  Save Configuration
                </pf-button>
              </div>
            </div>

            <div v-else-if="activeTab === 'hosts'">
              <!-- PF Card: DHCP Leases -->
              <pf-card class="pf-v6-u-mb-lg">
                <pf-card-title>DHCP Leases</pf-card-title>
                <pf-card-body>
                  <DhcpTable v-if="leases" :data="leases" />
                </pf-card-body>
                <pf-card-footer class="pf-v6-u-text-align-center">
                  <pf-button variant="secondary" @click="loadLeases">
                    Refresh Leases
                  </pf-button>
                </pf-card-footer>
              </pf-card>

              <!-- PF Card: DHCP Hosts -->
              <pf-card class="pf-v6-u-mb-lg">
                <pf-card-title>DHCP Hosts</pf-card-title>
                <pf-card-body>
                  <HostsTable
                    :hosts="parsedConf.dhcpHosts" 
                    :leases="leases" 
                    @change="handleNewHosts"
                    ref="hostsTableUi"
                  />
                </pf-card-body>
              </pf-card>
              
              <div class="pf-v6-u-text-align-center pf-v6-u-p-md">
                <pf-button variant="primary" @click="handleSave">
                  Save Configuration
                </pf-button>
              </div>
            </div>
            
            <div v-else-if="activeTab === 'dns'">
              <div class="pf-v6-u-text-align-center pf-v6-u-p-md">
                <pf-button variant="primary" @click="handleSave">
                  Save Configuration
                </pf-button>
              </div>
            </div>

            <div v-else-if="activeTab === 'service'">
              <ServiceStatus />
            </div>

          </div>
        </pf-tab>
      </pf-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

/*import { 
  PfTabs, 
  PfTab, 
  PfButton, 
  PfCard, 
  PfCardTitle, 
  PfCardBody, 
  PfCardFooter, 
  PfAlert 
} from '@patternfly/vue-patternfly'*/

import DhcpTable from './components/DhcpTable.vue'
import HostsTable from './components/HostsTable.vue'
import NetworkEditor from './components/NetworkEditor.vue'
import ConfigEditor from './components/ConfigEditor.vue'
import ServiceStatus from './components/ServiceStatus.vue'
import ParserWarnings from './components/ParserWarnings.vue'

import DnsmasqApi from 'dnsmasq-api'
import DnsmasqConfigParser from './model/config-parser.js'
import DnsmasqConfigFormatter from './model/config-formatter.js'

// Reactive state
const loaded = ref(false)
const configText = ref(null)
const parsedConf = ref(null)
const leases = ref(null)
const networks = ref(null)
const notification = ref(null)
const configEditorUi = ref(null)
const hostsTableUi = ref(null)
const configPath = ref('/etc/dnsmasq.conf')

const activeTab = ref('network')

const tabs = [
  { name: 'network', label: 'Network' },
  { name: 'dhcp', label: 'DHCP' },
  { name: 'hosts', label: 'DHCP hosts' },
  { name: 'dns',  label: 'DNS' },
  { name: 'service',  label: 'Service' },
]

// Methods
const loadConfig = async () => {
  try {
    const content = await DnsmasqApi.readConfig(configPath.value)
    const hosts = DnsmasqConfigParser.parse(content)
    parsedConf.value = hosts
    configText.value = content
    console.log('loadConfig', hosts, content)
  } catch (error) {
    configText.value = "Error reading configuration: " + error
  }
}

const loadLeases = async () => {
  try {
    leases.value = await DnsmasqApi.readLeases()
  } catch (error) {
    leases.value = "Error reading leases: " + error
  }
}

const loadNetworks = async () => {
  try {
    networks.value = await DnsmasqApi.readNetworks()
  } catch (error) {
    showNotification("Error reading Network Interfaces: " + error)
  }
}

const showNotification = (message) => {
  notification.value = message
  setTimeout(() => {
    notification.value = null
  }, 3000)
}

const handleNewHosts = async (newHosts) => {
  // Логика обработки изменений
}

const handleSave = async () => {
  if (configEditorUi.value && !configEditorUi.value.validateForm()) {
    return
  }
  
  let config = configEditorUi.value ? await configEditorUi.value.getConfig() : { ...parsedConf.value }
  
  if (hostsTableUi.value) {
    config.dhcpHosts = await hostsTableUi.value.getHosts()
  }
  
  let newText = DnsmasqConfigFormatter.format(config)
  try {
    await DnsmasqApi.saveConfig(configPath.value, newText)
    await DnsmasqApi.reloadService()
    showNotification("Configuration saved successfully")
  } catch (error) {
    console.error("Failed to save configuration:", error)
  }
}

onMounted(async () => {
  loaded.value = false
  try {
    await DnsmasqApi.init()
    configPath.value = await DnsmasqApi.getConfigPath()
    await Promise.all([loadConfig(), loadLeases(), loadNetworks()])
    loaded.value = true
  } catch (error) {
    console.error("Failed to initialize application: " + error.message)
  }
})
</script>
