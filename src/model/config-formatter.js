import DhcpRangeParser from "./dhcp-range-parser.js";

class DnsmasqConfigFormatter {
  constructor() {
    this.indentation = "  ";
    this.lineEnding = "\n";
  }

  static format(config) {
    const formatter = new DnsmasqConfigFormatter();
    return formatter.formatConfig(config);
  }

  formatConfig(config) {
    let lines = [];
    
    // Format interfaces
    if (config.interfaces && config.interfaces.length > 0) {
      for (const iface of config.interfaces) {
        lines.push(`interface=${iface}`);
      }
      lines.push(''); // Empty line for separation
    }

    // Format DHCP range
    if (config.dhcpRange) {
      const rangeLine = this.formatDhcpRange(config.dhcpRange, config.leaseTime);
      if (rangeLine) {
        lines.push(rangeLine);
        lines.push('');
      }
    }

    // Format DHCP options
    const dhcpOptionLines = this.formatDhcpOptions(config);
    if (dhcpOptionLines.length > 0) {
      lines.push(...dhcpOptionLines);
      lines.push('');
    }

    // Format DHCP hosts
    if (config.dhcpHosts && config.dhcpHosts.length > 0) {
      const hostLines = this.formatDhcpHosts(config.dhcpHosts);
      if (hostLines.length > 0) {
        lines.push(...hostLines);
        lines.push('');
      }
    }

    // Format DHCP lease max
    if (config.dhcpLeaseMax) {
      lines.push(`dhcp-lease-max=${config.dhcpLeaseMax}`);
    }

    // Format lease time if specified separately
    if (config.leaseTime) {
      lines.push(`# Note: lease time is configured via dhcp-option=2,${config.leaseTime}`);
    }

    return lines.join(this.lineEnding).trim() + this.lineEnding;
  }

  formatDhcpRange(dhcpRange, leaseTime=null) {
    if (!dhcpRange) return '';
    const parts = [];
    if (dhcpRange.start) {
      parts.push(dhcpRange.start);
    }
    if (dhcpRange.end) {
      parts.push(dhcpRange.end);
    }
    if (leaseTime) {
      parts.push(leaseTime);
    }
    if (dhcpRange.netmask) {
      parts.push(`netmask:${dhcpRange.netmask}`);
    }    
    return `dhcp-range=${parts.join(',')}`;
  }

  formatDhcpOptions(config) {
    const lines = [];    
    // Lease Time (Option 2)
    // if (config.leaseTime) {
    //   lines.push(`dhcp-option=2,${config.leaseTime}`);
    // }
    // Router/Gateway (Option 3)
    if (config.router) {
      lines.push(`dhcp-option=option:router,${config.router}`);
    }    
    // DNS Servers (Option 6)
    if (config.dnsServers && config.dnsServers.length > 0) {
      lines.push(`dhcp-option=option:dns-server,${config.dnsServers.join(',')}`);
    }    
    // Domain Name (Option 15)
    if (config.domainName) {
      lines.push(`dhcp-option=option:domain-name,${config.domainName}`);
    }    
    // Broadcast Address (Option 28)
    if (config.broadcast) {
      lines.push(`dhcp-option=option:broadcast,${config.broadcast}`);
    }    
    // NTP Servers (Option 42)
    if (config.ntpServers && config.ntpServers.length > 0) {
      lines.push(`dhcp-option=option:ntp-server,${config.ntpServers.join(',')}`);
    }    
    return lines;
  }

  formatDhcpHosts(dhcpHosts) {
    const lines = [];
    
    for (const host of dhcpHosts) {
      const parts = [];
      
      // MAC address (required)
      if (host.mac) {
        parts.push(host.mac);
      }
      
      // IP address (optional for some configurations)
      if (host.ip) {
        parts.push(host.ip);
      }
      
      // Hostname (optional)
      if (host.hostname) {
        parts.push(host.hostname);
      }
      
      // Lease time (optional)
      if (host.leaseTime) {
        parts.push(host.leaseTime);
      }
      
      let line = `dhcp-host=${parts.join(',')}`;
      
      // Add comment if present
      if (host.comment) {
        line += ` # ${host.comment}`;
      }
      
      lines.push(line);
    }
    
    return lines;
  }

  // Helper method to create a complete config from scratch
  static createConfig(options = {}) {
    const defaultConfig = {
      interfaces: [],
      dhcpRange: null,
      router: null,
      dnsServers: [],
      domainName: null,
      broadcast: null,
      ntpServers: [],
      dhcpHosts: [],
      leaseTime: null,
      dhcpLeaseMax: null
    };
    
    return { ...defaultConfig, ...options };
  }

  // Method to update an existing config
  static updateConfig(existingConfig, updates) {
    const updatedConfig = { ...existingConfig };
    
    for (const [key, value] of Object.entries(updates)) {
      if (key in updatedConfig) {
        if (Array.isArray(value)) {
          // For arrays, we can either replace or merge based on needs
          updatedConfig[key] = [...value];
        } else if (value && typeof value === 'object') {
          updatedConfig[key] = { ...updatedConfig[key], ...value };
        } else {
          updatedConfig[key] = value;
        }
      }
    }
    
    return updatedConfig;
  }
}

export default DnsmasqConfigFormatter;