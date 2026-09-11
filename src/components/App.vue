<template>
  <div class="main-container">

    <div class="flex-row" style="margin-bottom: 10px;">
      <div class="flex-grow">
        <h1>Dnsmasq</h1>
      </div>
      <div>
        <!-- Service Status -->
        <ServiceStatus />        
      </div>
    </div>

      <!-- Notification -->
      <div 
        v-if="notification" 
        class="alert alert-success alert-dismissible notification"
        :style="{ position: 'fixed', top: '20px', right: '20px', zIndex: '1000' }"
      >
        <button 
          type="button" 
          class="close" 
          @click="notification = null"
        >
          &times;
        </button>
        {{ notification }}
      </div>
      
      <!-- Main Content -->
      <div v-if="loaded">

        <ParserWarnings v-if="parsedConf.parserWarnings?.length" :warnings="parsedConf.parserWarnings" />

        <NetworkEditor @changed="parsedConf.interfaces = $event" :systemInterfaces="networks" :interfaces="parsedConf.interfaces" />

        <h3>DHCP</h3>

        <!-- DNS Leases -->
        <div class="card" style="margin-bottom: 20px">
          <div class="card-title">
            DHCP Leases
          </div>
          <div class="card-body">
            <DhcpTable v-if="leases" :data="leases" />
          </div>
          <div class="card-footer" style="text-align: center">
            <button @click="loadLeases" class="btn btn-secondary">
              Refresh Leases
            </button>
          </div>
        </div>

        <!-- DHCP Hosts -->
        <div class="card card-default" style="margin-bottom: 20px">
          <div class="card-title">
            DHCP Hosts
          </div>
          <div class="card-body">
            <HostsTable
              :hosts="parsedConf.dhcpHosts" 
              :leases="leases" 
              @change="handleNewHosts"
              ref="hostsTableUi"
            />
          </div>
        </div>

        <ConfigEditor ref="configEditorUi" :initial-config="parsedConf" />

        <!-- Action Buttons -->
        <div style="text-align: center; padding: 10px">
          <button @click="handleSave" class="primary-invert">
            Save Configuration
          </button>
        </div>

      </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

import DhcpTable from './DhcpTable.vue'
import HostsTable from './HostsTable.vue'
import NetworkEditor from './NetworkEditor.vue'
import ConfigEditor from './ConfigEditor.vue'
import ServiceStatus from './ServiceStatus.vue'
import ParserWarnings from './ParserWarnings.vue'

import DnsmasqApi from 'dnsmasq-api'
import DnsmasqConfigParser from '../model/config-parser.js'
import DnsmasqConfigFormatter from '../model/config-formatter.js'

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
}

const handleSave = async () => {
  if (!configEditorUi.value.validateForm()) {
    return
  }
  let config = await configEditorUi.value.getConfig()
  config.dhcpHosts = await hostsTableUi.value.getHosts()
  //TODO: Remove from leases new hosts
  let newText = DnsmasqConfigFormatter.format(config)
  try {
    await DnsmasqApi.saveConfig(configPath.value, newText)
    await DnsmasqApi.reloadService();
    showNotification("Configuration saved successfully")
  } catch (error) {
    console.error("Failed to save configuration:", error)
  }
}

// Lifecycle
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
