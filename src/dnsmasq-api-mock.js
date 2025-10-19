class DnsmasqApi {
  // System service operations
  static async checkStatus() {
    return cockpit.spawn(["systemctl", "is-active", "dnsmasq"]);
  }

  static async startService() {
    console.log('MOCK startService')
  }

  static async stopService() {
    console.log('MOCK stopService')
  }

  static async restartService() {
    console.log('MOCK restartService')
  }

  static async reloadService() {
    console.log('MOCK reloadService')
  }

  static async readConfig() {
    return ``
  }

  static async saveConfig(content) {
    console.log('MOCK saveConfig', content)
  }

  static async readLeases() {
    return ``
  }

  static async readLogs() {
    return ``
  }
}

export default DnsmasqApi;
