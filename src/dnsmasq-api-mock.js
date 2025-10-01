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
    let txt = `# Single Interface
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
dhcp-host=aa:bb:cc:dd:ee:ff,192.168.10.50,office-printer,infinite
dhcp-host=11:22:33:44:55:66,192.168.10.51,server,24h

# Limit leases for eth0
dhcp-lease-max=150`
    return txt
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

/*
Create js parser for /etc/dnsmasq.conf, group result by interface, parser must support this configs:
```
# Multiple Interfaces
interface=eth0
interface=eth1

# Prevent dnsmasq from binding to any interface except specified ones
bind-interfaces

# DHCP ranges for each interface
# Office LAN (eth0)
dhcp-range=eth0,192.168.10.100,192.168.10.200,255.255.255.0,24h
dhcp-option=tag:eth0,3,192.168.10.1        # Gateway
dhcp-option=tag:eth0,6,192.168.10.1        # DNS
dhcp-option=tag:eth0,15,office.local       # Domain
dhcp-option=tag:eth0,28,192.168.10.255     # Broadcast

# Guest LAN (eth1)
dhcp-range=eth1,192.168.20.100,192.168.20.200,255.255.255.0,6h
dhcp-option=tag:eth1,3,192.168.20.1
dhcp-option=tag:eth1,6,8.8.8.8,1.1.1.1
dhcp-option=tag:eth1,15,guest.local

# Static leases per interface
# Office devices
dhcp-host=aa:bb:cc:dd:ee:ff,192.168.10.50,office-printer,infinite,tag:eth0
dhcp-host=11:22:33:44:55:66,192.168.10.51,server,24h,tag:eth0

# Guest devices
dhcp-host=22:33:44:55:66:77,192.168.20.30,guest-pc,6h,tag:eth1

# Limit leases per interface
dhcp-lease-max=150,tag:eth0
dhcp-lease-max=50,tag:eth1
```
*/
