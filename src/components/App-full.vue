<template>
  <div class="panel">
    <div class="panel-header">
      <h1>Dnsmasq</h1>
    </div>
    <div class="panel-main">
      <div class="panel-main-body">
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
          <!-- DNS Leases -->
          <div class="panel panel-default" style="margin-bottom: 20px">
            <div class="panel-heading">
              <h3>DHCP Leases</h3>
            </div>
            <div class="panel-body">
              <DhcpTable v-if="leases" :data="leases" />
              <div style="text-align: center; padding: 10px">
                <button @click="loadLeases" class="btn btn-secondary">
                  Refresh Leases
                </button>
              </div>
            </div>
          </div>

          <!-- DHCP Hosts -->
          <div class="panel panel-default" style="margin-bottom: 20px">
            <div class="panel-heading">
              <h3>DHCP Hosts</h3>
            </div>
            <div class="panel-body">
              <HostsTable 
                v-if="parsedConf"
                :hosts="parsedConf.dhcpHosts" 
                :leases="leases" 
                @change="handleNewHosts"
              />
            </div>
          </div>

          <!-- Config Editor -->
          <ConfigEditor 
            v-if="parsedConf" 
            :initial-config="parsedConf" 
            @save="handleSaveConfig"
          />

          <!-- Service Status -->
          <ServiceStatus />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import DnsmasqApi from 'dnsmasq-api'
import ServiceStatus from './ServiceStatus.vue'
import DhcpTable from './DhcpTable.vue'
import ConfigEditor from './ConfigEditor.vue'
import HostsTable from './HostsTable.vue'
import DnsmasqConfigParser from '../config-parser-single.js'

// Reactive state
const loaded = ref(false)
const configText = ref(null)
const parsedConf = ref(null)
const leases = ref(null)
const notification = ref(null)

// Methods
const loadConfig = async () => {
  try {
    const content = await DnsmasqApi.readConfig()
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
    const content = await DnsmasqApi.readLeases()
    leases.value = content
    console.log('loadLeases', content)
  } catch (error) {
    leases.value = "Error reading leases: " + error
  }
}

const showNotification = (message) => {
  notification.value = message
  setTimeout(() => {
    notification.value = null
  }, 3000)
}

const handleReloadConfig = async () => {
  try {
    await DnsmasqApi.reloadService()
    showNotification("Configuration reloaded successfully")
  } catch (error) {
    console.error("Failed to reload configuration:", error)
  }
}

const handleNewHosts = async (newHosts) => {
  console.log('newHosts', newHosts)
}

const handleSaveConfig = async () => {
  try {
    await DnsmasqApi.saveConfig(configText.value)
    showNotification("Configuration saved successfully")
  } catch (error) {
    console.error("Failed to save configuration:", error)
  }
}

// Lifecycle
onMounted(async () => {
  loaded.value = false
  try {
    await Promise.all([loadConfig(), loadLeases()])
    loaded.value = true
  } catch (error) {
    console.error("Failed to initialize application: " + error.message)
  }
})
</script>

