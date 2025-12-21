class DnsmasqConfigParser {
  constructor() {
    this.config = {
        interfaces: [],
        dhcpRange: null,
        //dhcpOptions: [],
        routers: [],           // Option 3
        dnsServers: [],        // Option 6
        domainName: null,      // Option 15
        broadcast: null,       // Option 28
        dhcpHosts: [],
        dhcpLeaseMax: null      
    };
  }

  static parse(configText) {
      return new DnsmasqConfigParser().parse(configText);
  }

  parse(configText) {
    const lines = configText.split('\n');

    for (const i in lines) {
      let [trimmedLine, comment] = lines[i].split('#').map(part => part.trim())
      comment = comment || ''
      if (!trimmedLine) continue;

      let lineParts = trimmedLine.split('=')
      if (lineParts.length < 1) continue;
      let param = lineParts[0].trim()
      let value = lineParts.slice(1).join('=').trim()

      // Parse interface declaration
      if (param === 'interface') {
        this.config.interfaces.push(value)
        continue;
      }

      // Parse dhcp-range
      if (param === 'dhcp-range') {
        this._parseDhcpRange(value);
        continue;
      }

      // Parse dhcp-option
      if (param === 'dhcp-option') {
        this._parseDhcpOption(value);
        continue;
      }

      // Parse dhcp-host
      if (param === 'dhcp-host') {
        this._parseDhcpHost(value);
        continue;
      }

      // Parse dhcp-lease-max
      if (param === 'dhcp-lease-max') {
        this._parseDhcpLeaseMax(value);
        continue;
      }

    }

    return this.config;
  }

  _parseDhcpRange(value) {
    const parts = value.split(',');
    const range = {
      start: parts[0],
      end: parts[1],
      netmask: parts[2],
      leaseTime: parts[3]
    };    
    this.config.dhcpRange = range;
  }

  _parseDhcpOption(value) {
    const parts = value.split(',')
    if (parts.length < 2) throw new Error(`Invalid dhcp-option: ${value}`);
    const val2 = parts.slice(1).join(',').trim()
    switch (parts[0].trim()) {
      case '3': this.config.routers.push(val2); break;
      case '6': this.config.dnsServers.push(val2); break;
      case '15': this.config.domainName = val2; break;
      case '28': this.config.broadcast = val2; break;
    };
    // const option = {
    //   code: parseInt(parts[0]),
    //   values: parts.slice(1)
    // };    
    // this.config.dhcpOptions.push(option);
  }

  _parseDhcpHost(value) {
    const parts = value.split(',');
    const host = {
      mac: parts[0],
      ip: parts[1],
      hostname: parts[2],
      leaseTime: parts[3]
    };
    
    this.config.dhcpHosts.push(host);
  }

  _parseDhcpLeaseMax(value) {
    this.config.dhcpLeaseMax = parseInt(value);
  }

}

export default DnsmasqConfigParser;