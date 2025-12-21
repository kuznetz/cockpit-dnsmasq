<template>
  <div class="panel panel-default">
    <div class="panel-heading">
      <h3 class="panel-title">Logs</h3>
    </div>
    <div class="panel-body">
      <div id="logs-container">
        <pre class="textblock">{{ logsContent }}</pre>
      </div>
      <button @click="loadLogs" class="btn btn-default">Refresh Logs</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import DnsmasqApi from 'dnsmasq-api';

export default {
  name: 'AppLogs',
  
  setup() {
    const logsContent = ref('Loading logs...');

    const loadLogs = async () => {
      try {
        const data = await DnsmasqApi.readLogs();
        logsContent.value = data;
      } catch (error) {
        logsContent.value = "Error reading logs: " + error;
      }
    };

    // Initialize - runs when component is mounted
    onMounted(() => {
      loadLogs();
    });

    return {
      logsContent,
      loadLogs
    };
  }
};
</script>