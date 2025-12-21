//Not used, for now
class DnsmasqConfigParser {
  constructor() {
    this.interfaces = new Map();
    this.globalSettings = {};
  }

  static parse(configText) {
      return new DnsmasqConfigParser().parse(configText);
  }

  parse(configText) {
    // Reset state
    this.interfaces.clear();
    this.globalSettings = {};
    
    const lines = configText.split('\n');
    let currentInterface = null;

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
        this._ensureInterface(value);
        currentInterface = value;
        continue;
      }

      // Parse bind-interfaces (global setting)
      if (param === 'bind-interfaces') {
        this.globalSettings.bindInterfaces = true;
        continue;
      }

      // Parse dhcp-range
      if (param === 'dhcp-range') {
        this._parseDhcpRange(value, currentInterface);
        continue;
      }

      // Parse dhcp-option
      if (param === 'dhcp-option') {
        this._parseDhcpOption(value, currentInterface);
        continue;
      }

      // Parse dhcp-host
      if (param === 'dhcp-host') {
        this._parseDhcpHost(value, currentInterface);
        continue;
      }

      // Parse dhcp-lease-max
      if (param === 'dhcp-lease-max') {
        this._parseDhcpLeaseMax(value, currentInterface);
        continue;
      }
    }

    return this._getResult();
  }

  _ensureInterface(interfaceName) {
    if (!this.interfaces.has(interfaceName)) {
      this.interfaces.set(interfaceName, {
        name: interfaceName,
        dhcpRanges: [],
        dhcpOptions: [],
        dhcpHosts: [],
        dhcpLeaseMax: null
      });
    }
  }

  _parseDhcpRange(value, currentInterface) {
    const parts = value.split(',');
    // Check if first part is an interface tag
    let interfaceName = currentInterface;
    let rangeParts = parts;
    
    if (parts[0].startsWith('tag:')) {
      // Handle tag format: tag:eth0,192.168.10.100,192.168.10.200,255.255.255.0,24h
      interfaceName = parts[0].substring(4);
      rangeParts = parts.slice(1);
    } else if (parts.length >= 2 && this._isIPAddress(parts[0]) && this._isIPAddress(parts[1])) {
      // Standard format without interface: 192.168.10.100,192.168.10.200,255.255.255.0,24h
      interfaceName = currentInterface;
      rangeParts = parts;
    }
    
    if (!interfaceName) {
      throw new Error('dhcp-range without interface context:', value);
    }
    
    this._ensureInterface(interfaceName);
    const iface = this.interfaces.get(interfaceName);
    
    const range = {
      start: rangeParts[0],
      end: rangeParts[1],
      netmask: rangeParts[2], // || '255.255.255.0',
      leaseTime: rangeParts[3] // || '24h'
    };
    
    iface.dhcpRanges.push(range);
  }

  _parseDhcpOption(value, currentInterface) {
    const parts = value.split(',');
    
    let interfaceName = currentInterface;
    let optionParts = parts;    
    // Check for tag format
    if (parts.length > 1 && parts[0].startsWith('tag:')) {
      interfaceName = parts[0].substring(4);
      optionParts = parts.slice(1);
    }
    
    if (!interfaceName) {
      throw new Error('dhcp-option without interface context:', value);
    }
    
    this._ensureInterface(interfaceName);
    const iface = this.interfaces.get(interfaceName);
    
    const option = {
      code: parseInt(optionParts[0]),
      values: optionParts.slice(1)
    };
    
    iface.dhcpOptions.push(option);
  }

  _parseDhcpHost(value, currentInterface) {
    const parts = value.split(',');
    
    let interfaceName = currentInterface;
    let hostParts = parts;
    let tagIndex = -1;
    
    // Find and remove tag if present
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].startsWith('tag:')) {
        interfaceName = parts[i].substring(4);
        tagIndex = i;
        break;
      }
    }    
    if (tagIndex !== -1) {
      hostParts = parts.filter((_, index) => index !== tagIndex);
    }
    
    if (!interfaceName) {
      throw new Error('dhcp-host without interface context:', value);
    }
    
    this._ensureInterface(interfaceName);
    const iface = this.interfaces.get(interfaceName);
    
    const host = {
      mac: hostParts[0],
      ip: hostParts[1],
      hostname: hostParts[2], //|| null,
      leaseTime: hostParts[3] //|| 'infinite'
    };
    
    iface.dhcpHosts.push(host);
  }

  _parseDhcpLeaseMax(value, currentInterface) {
    const parts = value.split(',');
    let interfaceName = currentInterface;
    let maxLeases = parts[0];
    // Check for tag format
    if (parts.length > 1 && parts[1].startsWith('tag:')) {
      interfaceName = parts[1].substring(4);
    }
    
    if (!interfaceName) {
      throw new Error('dhcp-lease without interface context:', value);
    }
    
    this._ensureInterface(interfaceName);
    const iface = this.interfaces.get(interfaceName);
    
    iface.dhcpLeaseMax = parseInt(maxLeases);
  }

  _isIPAddress(str) {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    return ipRegex.test(str);
  }

  _getResult() {
    return {
      global: this.globalSettings,
      interfaces: Array.from(this.interfaces.values()).map(iface => ({
        ...iface,
        dhcpOptions: iface.dhcpOptions.sort((a, b) => a.code - b.code)
      }))
    };
  }
}

export default DnsmasqConfigParser;