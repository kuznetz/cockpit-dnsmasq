import { parse as dhcpRangeParse } from "./dhcp-range-parser.js";

class DnsmasqConfigParser {
  constructor() {
    this.config = {
      interfaces: [],
      // Dhcp
      dhcpEnabled: false,
      dhcpRange: null,
      router: null,           // Option 3
      dnsServers: [],         // Option 6
      domainName: null,       // Option 15
      // broadcast: null,     // Option 28
      ntpServers: [],         // Option 42
      dhcpHosts: [],
      leaseTime: null,
      dhcpLeaseMax: null,
      parserWarnings: []
    };
  }

  static parse(configText) {
    //console.log('parse config...');
    const parser = new DnsmasqConfigParser();
    const lines = parser.parseText(configText);
    //console.log('lines', lines);
    const config = parser.parseLines(lines);
    //console.log('config', config);
    return config;
  }

  _warn(message, lineNumber = null) {
    const prefix = lineNumber != null ? `[${lineNumber}] ` : '';
    this.config.parserWarnings.push(`${prefix}${message}`);
  }

  parseText(configText) {
    const lines = configText.split(/\r?\n/);
    const result = [];

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      let trimmedLine = '';
      let comment = null;

      let lineParts = rawLine.split('#');
      if (lineParts.length > 0) {
        trimmedLine = lineParts[0].trim();
        if (lineParts.length > 1) {
          comment = lineParts.slice(1).join('#').trim();
        }
      }

      let param = null;
      let value = null;

      lineParts = trimmedLine.split('=');
      if (lineParts.length > 0) {
        param = lineParts[0].trim();
        if (lineParts.length > 1) {
          value = lineParts.slice(1).join('=').trim();
        }
      }

      result.push([param, value, comment, i + 1, rawLine]);
    }

    return result;
  }

  parseLines(lines) {
    const valueRequired = new Set([
      'interface','dhcp-range','dhcp-option','dhcp-host','dhcp-lease-max'
    ]);

    for (const line of lines) {
      const [param, value, comment, lineNumber, rawLine] = line;
      if (!param) continue;

      if (!param && value !== null) {
        this._warn(`Missing parameter name`, lineNumber);
        continue;
      }

      if (valueRequired.has(param) && !value) {
        this._warn(`Missing value for ${param}`, lineNumber);
        continue;
      }

      switch (param) {
        case 'interface':
          this.config.interfaces.push(value);
          break;

        case 'dhcp-range':
          this._parseDhcpRange(value, lineNumber);
          break;

        case 'dhcp-option':
          this._parseDhcpOption(value, lineNumber);
          break;

        case 'dhcp-host':
          this._parseDhcpHost(value, comment, lineNumber);
          break;

        case 'dhcp-lease-max':
          this.config.dhcpLeaseMax = value;
          break;

        default:
          this._warn(`Unsupported directive "${param}"`, lineNumber);
          break;
      }
    }

    return this.config;
  }

  _parseDhcpRange(value, lineNumber) {
    if (this.config.dhcpRange !== null) {
      this._warn(`Multiple dhcp-range not supported`, lineNumber);
      return;
    }
    try {
      const range = dhcpRangeParse(value);

      if (range.leaseTime) {
        this.config.leaseTime = range.leaseTime;
        range.leaseTime = null;
      }

      if (range.router) {
        this.config.router = range.router;
        range.router = null;
      }

      this.config.dhcpRange = range;
      this.config.dhcpEnabled = true;
    } catch (e) {
      this._warn(`Error parsing dhcp-range "${value}": ${e.message}`, lineNumber);
    }
  }

  _parseDhcpOption(value, lineNumber) {
    const parts = value.split(',');

    if (parts.length < 2) {
      this._warn(`Invalid dhcp-option: "${value}"`, lineNumber);
      return;
    }

    let code = parts[0].trim().toLowerCase();
    const vals = parts.slice(1).map(v => v.trim()).filter(v => v !== '');

    if (vals.length === 0) {
      this._warn(`No value provided for dhcp-option: "${value}"`, lineNumber);
      return;
    }

    const optionMap = {
      'router': '3',
      'dns-server': '6',
      'domain-name': '15',
      'ntp-server': '42',
    };

    if (code.startsWith('option:')) {
      const optionName = code.substring(7);
      const mapped = optionMap[optionName];

      if (!mapped) {
        this._warn(`Unknown option "${optionName}" in dhcp-option`, lineNumber);
        return;
      }

      code = mapped;
    }

    switch (code) {
      case '2':
        this.config.leaseTime = vals[0];
        break;
      case '3':
        this.config.router = vals[0];
        break;
      case '6':
        this.config.dnsServers.push(...vals);
        break;
      case '15':
        this.config.domainName = vals[0];
        break;
      case '42':
        this.config.ntpServers.push(...vals);
        break;
      default:
        this._warn(`Unsupported dhcp-option with code/name "${parts[0].trim()}"`, lineNumber);
        break;
    }
  }

  _parseDhcpHost(value, comment, lineNumber) {
    const parts = value.split(',').map(p => p.trim());

    if (parts.length < 2 || !parts[0]) {
      this._warn(`Invalid dhcp-host: "${value}"`, lineNumber);
      return;
    }

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