/**
 * Dnsmasq DHCP Range Parser
 * Parses dhcp-range configuration lines from Dnsmasq configuration files
 */

class DhcpRangeParser {
  constructor() {
    this.defaults = {
      mode: 'dynamic', // dynamic, static, or proxy
      ipv6: false,
      raOnly: false,
      temporary: false,
      deprecated: false
    };
  }

  /**
   * Parse a dhcp-range configuration line
   * @param {string} value - Configuration line value (e.g., "192.168.1.100,192.168.1.200,255.255.255.0,12h")
   * @returns {Object} Parsed configuration object
   */
  parse(value) {
    if (!value.trim()) {
      throw new Error('Empty dhcp-range value');
    }
    // Split by commas, but handle quoted sections
    const tokens = this.tokenize(value);    
    // Determine if this is IPv4 or IPv6
    const isIPv6 = this.detectIPv6(tokens);
    if (isIPv6) {
      return this.parseIPv6Range(tokens);
    } else {
      return this.parseIPv4Range(tokens);
    }
  }

  /**
   * Tokenize the value string, handling spaces and quoted text
   */
  tokenize(value) {
    const tokens = [];
    let currentToken = '';
    let inQuotes = false;
    let quoteChar = '';
    
    for (let i = 0; i < value.length; i++) {
      const char = value[i];
      
      if ((char === '"' || char === "'") && !inQuotes) {
        inQuotes = true;
        quoteChar = char;
        continue;
      } else if (char === quoteChar && inQuotes) {
        inQuotes = false;
        quoteChar = '';
        continue;
      }
      
      if (char === ',' && !inQuotes) {
        if (currentToken.trim()) {
          tokens.push(currentToken.trim());
        }
        currentToken = '';
      } else {
        currentToken += char;
      }
    }
    
    if (currentToken.trim()) {
      tokens.push(currentToken.trim());
    }
    
    return tokens;
  }

  /**
   * Detect if the range is for IPv6
   */
  detectIPv6(tokens) {
    if (tokens.length === 0) return false;
    
    const firstToken = tokens[0];
    
    // Check for IPv6 address indicators
    if (firstToken.includes(':')) {
      return true;
    }
    
    // Check for IPv6-specific keywords
    const ipv6Keywords = ['ra-only', 'ra-names', 'slaac', 'temporary', 'deprecated'];
    return tokens.some(token => ipv6Keywords.includes(token.toLowerCase()));
  }

  /**
   * Parse IPv4 dhcp-range
   * Syntax: dhcp-range=[<network id>,]<start-addr>,<end-addr>[,<netmask>|<prefix>][,<broadcast>][,<router>][,<lease time>][,<option:mtu>][,<option:static>][,<tag:>][,<set:<option>][,<class:<class>][,<mode>]
   */
  parseIPv4Range(tokens) {
    if (tokens.length < 2) {
      throw new Error('IPv4 dhcp-range requires at least start and end addresses');
    }

    const result = {
      type: 'ipv4',
      mode: this.defaults.mode,
      networkId: null,
      start: '',
      end: '',
      netmask: null,
      broadcast: null,
      router: null,
      leaseTime: null,
      options: [],
      tags: [],
      classes: [],
      settings: {},
      staticBindings: [],
      raw: tokens
    };

    let tokenIndex = 0;

    // Optional network identifier (usually interface name)
    if (tokens.length > 2 && !this.isIPAddress(tokens[0]) && !this.isCIDR(tokens[0])) {
      result.networkId = tokens[tokenIndex++];
    }

    // Start and end addresses (required)
    result.start = tokens[tokenIndex++];
    result.end = tokens[tokenIndex++];

    // Process remaining tokens
    while (tokenIndex < tokens.length) {
      const token = tokens[tokenIndex];
      const lowerToken = token.toLowerCase();

      // Check for netmask (could be CIDR or dotted decimal)
      if (this.isNetmask(token) && !result.netmask) {
        result.netmask = token;
        tokenIndex++;
        continue;
      }

      // Check for broadcast address
      if (this.isIPAddress(token) && !result.broadcast && !result.router) {
        result.broadcast = token;
        tokenIndex++;
        continue;
      }

      // Check for router
      if (this.isIPAddress(token) && !result.router) {
        result.router = token;
        tokenIndex++;
        continue;
      }

      // Check for lease time
      if (this.isLeaseTime(token)) {
        result.leaseTime = token;
        tokenIndex++;
        continue;
      }

      // Check for options
      if (lowerToken.startsWith('option:')) {
        const option = token.substring(7);
        result.options.push(option);
        tokenIndex++;
        continue;
      }

      // Check for static mode
      if (lowerToken === 'static') {
        result.mode = 'static';
        tokenIndex++;
        continue;
      }

      // Check for proxy mode
      if (lowerToken === 'proxy') {
        result.mode = 'proxy';
        tokenIndex++;
        continue;
      }

      // Check for tags
      if (lowerToken.startsWith('tag:')) {
        const tag = token.substring(4);
        result.tags.push(tag);
        tokenIndex++;
        continue;
      }

      // Check for classes
      if (lowerToken.startsWith('class:')) {
        const className = token.substring(6);
        result.classes.push(className);
        tokenIndex++;
        continue;
      }

      // Check for set options
      if (lowerToken.startsWith('set:')) {
        const setOption = token.substring(4);
        const [key, value] = setOption.split('=', 2);
        if (key) {
          result.settings[key] = value || true;
        }
        tokenIndex++;
        continue;
      }

      // Check for static bindings (host declarations)
      if (lowerToken.startsWith('id:')) {
        result.staticBindings.push(token);
        tokenIndex++;
        continue;
      }

      // If we reach here, it's an unrecognized token
      result.settings.unknown = result.settings.unknown || [];
      result.settings.unknown.push(token);
      tokenIndex++;
    }

    // Set default netmask if not specified
    if (!result.netmask && result.start) {
      result.netmask = this.inferNetmask(result.start);
    }

    return result;
  }

  /**
   * Parse IPv6 dhcp-range
   * Syntax: dhcp-range=<IPv6 start>,<IPv6 end>,<prefix>[,<mode>][,<lease time>][,<flags>]
   */
  parseIPv6Range(tokens) {
    if (tokens.length < 2) {
      throw new Error('IPv6 dhcp-range requires at least start and end addresses');
    }

    const result = {
      type: 'ipv6',
      mode: this.defaults.mode,
      start: '',
      end: '',
      prefix: null,
      leaseTime: null,
      flags: [],
      temporary: this.defaults.temporary,
      deprecated: this.defaults.deprecated,
      raOnly: this.defaults.raOnly,
      raw: tokens
    };

    let tokenIndex = 0;

    // Start and end addresses
    result.start = tokens[tokenIndex++];
    result.end = tokens[tokenIndex++];

    // Prefix (required for IPv6)
    if (tokenIndex < tokens.length && this.isCIDR(tokens[tokenIndex])) {
      result.prefix = tokens[tokenIndex++];
    } else {
      // Try to infer prefix from start address
      result.prefix = this.inferIPv6Prefix(result.start);
    }

    // Process remaining tokens
    while (tokenIndex < tokens.length) {
      const token = tokens[tokenIndex];
      const lowerToken = token.toLowerCase();

      // Check for lease time
      if (this.isLeaseTime(token)) {
        result.leaseTime = token;
        tokenIndex++;
        continue;
      }

      // Check for modes
      if (lowerToken === 'static') {
        result.mode = 'static';
        tokenIndex++;
        continue;
      }

      if (lowerToken === 'temporary') {
        result.temporary = true;
        result.flags.push('temporary');
        tokenIndex++;
        continue;
      }

      if (lowerToken === 'deprecated') {
        result.deprecated = true;
        result.flags.push('deprecated');
        tokenIndex++;
        continue;
      }

      if (lowerToken === 'ra-only' || lowerToken === 'ra_names') {
        result.raOnly = true;
        result.flags.push('ra-only');
        tokenIndex++;
        continue;
      }

      if (lowerToken === 'slaac') {
        result.mode = 'slaac';
        result.flags.push('slaac');
        tokenIndex++;
        continue;
      }

      if (lowerToken === 'proxy') {
        result.mode = 'proxy';
        tokenIndex++;
        continue;
      }

      // Default to dynamic if not specified
      if (lowerToken === 'dynamic') {
        result.mode = 'dynamic';
        tokenIndex++;
        continue;
      }

      // Any other token is treated as a flag or unknown
      result.flags.push(token);
      tokenIndex++;
    }

    return result;
  }

  /**
   * Helper methods for validation
   */
  isIPAddress(str) {
    // IPv4 pattern
    const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipv4Pattern.test(str)) {
      const parts = str.split('.').map(Number);
      return parts.every(part => part >= 0 && part <= 255);
    }
    
    // IPv6 pattern (simplified)
    const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){1,7}[0-9a-fA-F]{1,4}$/;
    const ipv6ShortPattern = /^::([0-9a-fA-F]{1,4}:){0,5}[0-9a-fA-F]{1,4}$/;
    const ipv6MixedPattern = /^([0-9a-fA-F]{1,4}:){1,6}:(\d{1,3}\.){3}\d{1,3}$/;
    
    return ipv6Pattern.test(str) || ipv6ShortPattern.test(str) || ipv6MixedPattern.test(str);
  }

  isCIDR(str) {
    return /^\d{1,3}$/.test(str) || /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/.test(str);
  }

  isNetmask(str) {
    // Check for CIDR notation
    if (/^\d{1,3}$/.test(str)) {
      const prefix = parseInt(str, 10);
      return prefix >= 0 && prefix <= 32;
    }
    
    // Check for dotted decimal notation
    if (/^(\d{1,3}\.){3}\d{1,3}$/.test(str)) {
      const parts = str.split('.').map(Number);
      if (!parts.every(part => part >= 0 && part <= 255)) return false;
      
      // Convert to binary and check it's a valid netmask
      const binary = parts.map(part => part.toString(2).padStart(8, '0')).join('');
      return /^1+0+$/.test(binary) || binary === '00000000000000000000000000000000';
    }
    
    return false;
  }

  isLeaseTime(str) {
    const timePattern = /^(\d+[smhd]?|\d+:\d+)$/;
    return timePattern.test(str.toLowerCase());
  }

  inferNetmask(ip) {
    // Simple inference based on private IP ranges
    if (ip.startsWith('10.')) return '255.0.0.0';
    if (ip.startsWith('172.16.')) return '255.240.0.0';
    if (ip.startsWith('192.168.')) return '255.255.255.0';
    if (ip.startsWith('169.254.')) return '255.255.0.0'; // APIPA
    
    // Default for other ranges
    return '255.255.255.0';
  }

  inferIPv6Prefix(ip) {
    // Common IPv6 prefix lengths
    if (ip.startsWith('fe80:')) return '64'; // Link-local
    if (ip.startsWith('fc00:')) return '7'; // ULA
    if (ip.startsWith('fd00:')) return '7'; // ULA
    return '64'; // Default prefix length
  }

  /**
   * Format parsed configuration back to dnsmasq format
   */
  format(config) {
    const parts = [];
    
    if (config.networkId) {
      parts.push(config.networkId);
    }
    
    parts.push(config.start, config.end);
    
    if (config.type === 'ipv4') {
      if (config.netmask) parts.push(config.netmask);
      if (config.broadcast) parts.push(config.broadcast);
      if (config.router) parts.push(config.router);
      if (config.leaseTime !== this.defaults.leaseTime) parts.push(config.leaseTime);
      
      config.options.forEach(opt => parts.push(`option:${opt}`));
      config.tags.forEach(tag => parts.push(`tag:${tag}`));
      config.classes.forEach(cls => parts.push(`class:${cls}`));
      
      if (config.mode !== 'dynamic') parts.push(config.mode);
      
      Object.entries(config.settings).forEach(([key, value]) => {
        if (value === true) {
          parts.push(`set:${key}`);
        } else {
          parts.push(`set:${key}=${value}`);
        }
      });
      
      config.staticBindings.forEach(binding => parts.push(binding));
      
    } else { // IPv6
      if (config.prefix) parts.push(config.prefix);
      if (config.mode !== 'dynamic') parts.push(config.mode);
      if (config.leaseTime !== this.defaults.leaseTime) parts.push(config.leaseTime);
      
      if (config.temporary) parts.push('temporary');
      if (config.deprecated) parts.push('deprecated');
      if (config.raOnly) parts.push('ra-only');
      
      config.flags.forEach(flag => {
        if (!['temporary', 'deprecated', 'ra-only'].includes(flag)) {
          parts.push(flag);
        }
      });
    }
    
    return `dhcp-range=${parts.join(',')}`;
  }

  /**
   * Validate parsed configuration
   */
  validate(config) {
    const errors = [];
    
    if (!config.start || !config.end) {
      errors.push('Start and end addresses are required');
    }
    
    if (config.type === 'ipv4') {
      if (config.netmask && !this.isNetmask(config.netmask)) {
        errors.push(`Invalid netmask: ${config.netmask}`);
      }
    } else {
      if (config.prefix) {
        const prefixNum = parseInt(config.prefix, 10);
        if (isNaN(prefixNum) || prefixNum < 0 || prefixNum > 128) {
          errors.push(`Invalid IPv6 prefix: ${config.prefix}`);
        }
      }
    }
    
    if (config.leaseTime && !this.isLeaseTime(config.leaseTime)) {
      errors.push(`Invalid lease time: ${config.leaseTime}`);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export default DhcpRangeParser