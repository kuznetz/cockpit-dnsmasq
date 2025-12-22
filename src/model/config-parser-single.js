import DhcpRangeParser from "./dhcp-range-parser.js";

function parseIntOrNull(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const num = Number(value);
  if (Number.isInteger(num) && isFinite(num)) {
    return num;
  }
  return null;
}

class DnsmasqConfigParser {
  constructor() {
    this.config = {
        interfaces: [],
        dhcpRange: null,
        router: null,           // Option 3
        dnsServers: [],        // Option 6
        domainName: null,      // Option 15
        broadcast: null,       // Option 28
        ntpServers: [],        // Option 42
        dhcpHosts: [],
        leaseTime: null,
        dhcpLeaseMax: null
    };
  }

  static parse(configText) {
      console.log('parse config...')
      const parser = new DnsmasqConfigParser()
      const lines = parser.parseText(configText);
      console.log('lines',lines)
      const config = parser.parseLines(lines);
      console.log('config',config)
      return config
  }

  parseText(configText) {
    const lines = configText.split('\n');
    let result = []
    for (const i in lines) {
      let trimmedLine = ''
      let comment = null
      let lineParts = lines[i].split('#')
      if (lineParts.length > 0) {
        trimmedLine = lineParts[0].trim()
        if (lineParts.length > 1) {
          comment = lineParts.slice(1).join('#').trim()      
        }
      }

      let param = null
      let value = null
      lineParts = trimmedLine.split('=')
      if (lineParts.length > 0) {
        param = lineParts[0].trim()
        if (lineParts.length > 1) {
          value = lineParts.slice(1).join('=').trim()      
        }
      }
      result.push([param, value, comment])
    }
    return result
  }

  parseLines(lines) {
    for (const i in lines) {
      let [param, value, comment] = lines[i];    
      if (!param) continue;
      switch (param) {
        case 'interface':
          // Parse interface declaration
          this.config.interfaces.push(value);
          break;        
        case 'dhcp-range':
          // Parse dhcp-range
          this._parseDhcpRange(value);
          break;        
        case 'dhcp-option':
          // Parse dhcp-option
          this._parseDhcpOption(value);
          break;        
        case 'dhcp-host':
          // Parse dhcp-host - assign static IP addresses to specific devices
          this._parseDhcpHost(value, comment);
          break;
        case 'dhcp-lease-max':
          // Parse dhcp-lease-max - maximum number of concurrent DHCP leases
          this.config.dhcpLeaseMax = value;
          break;
      }
    }
    return this.config;
  }

  _parseDhcpRange(value) {
    const rangeParser = new DhcpRangeParser()
    let range = rangeParser.parse(value)
    if (range.leaseTime) {
      this.config.leaseTime = range.leaseTime
      range.leaseTime = null
    }
    if (range.router) {
      this.config.router = range.router
      range.router = null
    }
    this.config.dhcpRange = range
  }

  _parseDhcpOption(value) {
    const parts = value.split(',')
    if (parts.length < 2) return; // Skip invalid dhcp-option
    
    let code = parts[0].trim().toLowerCase()
    const vals = parts.slice(1).map(v => v.trim()).filter(v => v !== '')
    
    // Convert option names to codes if needed
    const optionMap = {
      'router': '3',
      'dns-server': '6', 
      'domain-name': '15',
      'ntp-server': '42',
      'broadcast': '28'
    }    
    if (code.startsWith('option:')) {
      const optionName = code.substring(7);
      code = optionMap[optionName] || code;
    }

    switch (parts[0].trim()) {      
      case '2': this.leaseTime = vals[0]; break;
      case '3': this.config.router = vals[0]; break;
      case '6': this.config.dnsServers.push(...vals); break;
      case '15': this.config.domainName = vals[0]; break;
      case '28': this.config.broadcast = vals[0]; break;
      case '42': this.config.ntpServers.push(...vals); break;
    };
    // Gateway/Router: dhcp-option=option:router,192.168.1.1 or dhcp-option=3,192.168.1.1.
    // DNS Servers: dhcp-option=option:dns-server,8.8.8.8,1.1.1.1 or dhcp-option=6,8.8.8.8,1.1.1.1 (Primary, Secondary).
    // Domain Name: dhcp-option=option:domain-name,mylocalnet.lan or dhcp-option=15,mylocalnet.lan.
    // NTP Server: dhcp-option=option:ntp-server,192.168.1.100 or dhcp-option=42,192.168.1.100.
    // Lease Time: dhcp-option=2,86400 (86400 seconds = 24 hours).
  }

  _parseDhcpHost(value, comment) {
    const parts = value.split(',').map(p => p.trim());
    if (parts.length < 2) return;    
    const host = {
      mac: parts[0],
      ip: parts[1] || null,
      hostname: parts[2] || null,
      leaseTime: parts[3] || null,
      comment
    };    
    this.config.dhcpHosts.push(host);
  }

}

export default DnsmasqConfigParser;