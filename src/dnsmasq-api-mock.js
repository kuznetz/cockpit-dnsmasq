import DnsmasqLeasesParser from './leases-parser.js';

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
    let txt = `1758558083 52:54:00:66:45:70 192.168.100.15 wine-reports ff:00:66:45:70:00:01:00:01:30:1a:09:12:52:54:00:66:45:70
1758558253 52:54:00:a8:c2:6a 192.168.100.13 ollama ff:00:a8:c2:6a:00:01:00:01:30:10:76:3f:52:54:00:a8:c2:6a
1758558644 52:54:00:01:21:ba 192.168.100.10 csminidev-dockers ff:00:01:21:ba:00:01:00:01:2d:de:30:b7:52:54:00:01:21:ba
1758558811 52:54:00:55:4c:93 192.168.100.14 oracle12c *
1758558273 52:54:00:5e:c1:5a 192.168.100.80 DisksChecker ff:00:5e:c1:5a:00:01:00:01:2d:96:dd:a4:52:54:00:5e:c1:5a`
    let result = DnsmasqLeasesParser.parse(txt)
    console.log('result', result)
    return result    
  }

  static async readLogs() {
    return ``
  }
}

export default DnsmasqApi;
