import DnsmasqLeasesParser from './leases-parser.js';

class DnsmasqApi {

  static async init() {
    console.log('DnsmasqApi init')
  }

  static async checkStatus() {
    return "OK"
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

  static async getConfigPath() {
    return "/etc/dnsmasq-mock.conf"
  }  

  static async readConfig() {
    /*let txt = `# Single Interface
interface=eth0

# Prevent dnsmasq from binding to any interface except specified ones
bind-interfaces

# DHCP range for eth0 interface
# Office LAN (eth0)
dhcp-range=192.168.10.100,192.168.10.200,255.255.255.0,24h
dhcp-option=3,192.168.10.1        # Gateway
dhcp-option=6,192.168.10.1        # DNS
dhcp-option=15,office.local       # Domain
dhcp-option=28,192.168.10.255     # Broadcast

# Static leases for eth0
# Office devices
dhcp-host=aa:bb:cc:dd:ee:ff,192.168.10.50,office-printer,infinite #LAN printer
dhcp-host=11:22:33:44:55:66,192.168.10.51,server,24h
dhcp-host=11:22:33:44:55:64,192.168.10.52,server2

# Limit leases for eth0
dhcp-lease-max=150`*/
  let txt = `interface=mainbr

dhcp-range=192.168.100.50,192.168.100.100,255.255.255.0,1h
dhcp-range=192.168.100.50,192.168.100.100,255.255.255.0,1h

dhcp-option=option:router,192.168.100.2
dhcp-option=option:dns-server,192.168.1.1

dhcp-host=52:54:00:01:21:ba,192.168.100.10,csminidev-dockers # dockers
dhcp-host=52:54:00:55:4c:93,192.168.100.14,Oracle12c # oracle12c
dhcp-host=52:54:00:66:45:70,192.168.100.15 # wine-reports
dhcp-host=52:54:00:5e:c1:5a,192.168.100.16,DisksChecker

dhcp-lease-max=150`
    return txt
  }

  static async saveConfig(configPath, content) {
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

  static async removeLease(mac) {
    console.log('MOCK removeLease', mac)
  }

  static async readLogs() {
    return ``
  }

  static async readNetworks() {
      return [
          { name: "eth0",  state: "up" },
          { name: "eth1",  state: "down" },
          { name: "wlan0", state: "up" },
          { name: "wlan1", state: "dormant" },
          { name: "docker0", state: "unknown" },
      ];
  }  
}

export default DnsmasqApi;