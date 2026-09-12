import DnsmasqConfig from './dnsmasq-config.js'

class DnsmasqConfigFormatter {
  constructor() {
    this.lineEnding = "\n";
  }

  /**
   * 
   * @param {DnsmasqConfig} config 
   * @returns {String}
   */
  static format(config) {
    const formatter = new DnsmasqConfigFormatter();
    return formatter.formatConfig(config);
  }

  formatConfig(config) {
    const c = config || {};
    const dns = c.dns || {};
    const v4 = c.dhcpv4 || {};
    const v6 = c.dhcpv6 || {};

    const lines = [];

    // ---- interfaces / bind ----
    if (Array.isArray(c.interfaces)) {
      for (const iface of c.interfaces) {
        if (iface) lines.push(`interface=${iface}`);
      }
    }
    if (c.bind === 'interfaces') lines.push('bind-interfaces');
    else if (c.bind === 'dynamic') lines.push('bind-dynamic');

    // ---- DHCPv4 ----
    const v4Range = this._formatDhcpv4Range(v4);
    if (v4Range) lines.push(v4Range);

    if (v4.router) {
      lines.push(`dhcp-option=option:router,${v4.router}`);
    }
    if (Array.isArray(v4.dnsServers) && v4.dnsServers.length > 0) {
      lines.push(`dhcp-option=option:dns-server,${v4.dnsServers.join(',')}`);
    }
    if (Array.isArray(v4.ntpServers) && v4.ntpServers.length > 0) {
      lines.push(`dhcp-option=option:ntp-server,${v4.ntpServers.join(',')}`);
    }
    if (Array.isArray(v4.dhcpHosts)) {
      for (const host of v4.dhcpHosts) {
        const line = this._formatDhcpHost(host);
        if (line) lines.push(line);
      }
    }

    // ---- DHCPv6 / RA ----
    const v6Range = this._formatDhcpv6Range(v6);
    if (v6Range) lines.push(v6Range);

    if (Array.isArray(v6.dnsServers) && v6.dnsServers.length > 0) {
      lines.push(`dhcp-option=option6:dns-server,${v6.dnsServers.join(',')}`);
    }
    if (Array.isArray(v6.ntpServers) && v6.ntpServers.length > 0) {
      lines.push(`dhcp-option=option6:ntp-server,${v6.ntpServers.join(',')}`);
    }
    if (Array.isArray(v6.dhcpHosts)) {
      for (const host of v6.dhcpHosts) {
        const line = this._formatDhcpHost(host);
        if (line) lines.push(line);
      }
    }

    // ---- DHCP lease max ----
    if (c.dhcpLeaseMax != null && c.dhcpLeaseMax !== '') {
      lines.push(`dhcp-lease-max=${c.dhcpLeaseMax}`);
    }

    // ---- DNS ----
    const domain = c.domain || dns.domain;
    if (domain) lines.push(`domain=${domain}`);

    if (dns.noResolv) lines.push('no-resolv');
    if (dns.noHosts) lines.push('no-hosts');
    if (dns.domainNeeded) lines.push('domain-needed');
    if (dns.bogusPriv) lines.push('bogus-priv');
    if (dns.expandHosts) lines.push('expand-hosts');
    if (dns.cacheSize != null && dns.cacheSize !== '') {
      lines.push(`cache-size=${dns.cacheSize}`);
    }

    if (Array.isArray(dns.servers)) {
      for (const s of dns.servers) if (s) lines.push(`server=${s}`);
    }
    if (Array.isArray(dns.addresses)) {
      for (const a of dns.addresses) if (a) lines.push(`address=${a}`);
    }
    if (Array.isArray(dns.local)) {
      for (const l of dns.local) if (l) lines.push(`local=${l}`);
    }
    if (Array.isArray(dns.listenAddresses)) {
      for (const la of dns.listenAddresses) if (la) lines.push(`listen-address=${la}`);
    }
    if (Array.isArray(dns.interfaceNames)) {
      for (const n of dns.interfaceNames) if (n) lines.push(`interface-name=${n}`);
    }
    if (Array.isArray(dns.addnHosts)) {
      for (const f of dns.addnHosts) if (f) lines.push(`addn-hosts=${f}`);
    }
    if (Array.isArray(dns.hostRecords)) {
      for (const r of dns.hostRecords) if (r) lines.push(`host-record=${r}`);
    }
    if (Array.isArray(dns.cnames)) {
      for (const cn of dns.cnames) if (cn) lines.push(`cname=${cn}`);
    }

    if (lines.length === 0) return '';

    return lines.join(this.lineEnding) + this.lineEnding;
  }

  // ---- private helpers ----

  _formatDhcpv4Range(v4) {
    if (!v4 || !v4.enabled) return null;
    if (!v4.start && !v4.end) return null;

    const parts = [];
    if (v4.start) parts.push(v4.start);
    if (v4.end) parts.push(v4.end);

    if (v4.netmask) {
      parts.push(v4.netmask);
    } else if (v4.prefixLength != null && v4.prefixLength !== '') {
      parts.push(String(v4.prefixLength));
    }

    if (v4.broadcast) parts.push(v4.broadcast);
    if (v4.leaseTime) parts.push(v4.leaseTime);

    return `dhcp-range=${parts.join(',')}`;
  }

  _formatDhcpv6Range(v6) {
    if (!v6) return null;

    const hasMode = Array.isArray(v6.mode) && v6.mode.length > 0;
    if (!hasMode && !v6.start && !v6.constr && v6.prefixLength == null && !v6.leaseTime) {
      return null;
    }

    const parts = [];
    if (v6.start) parts.push(v6.start);
    if (v6.end) parts.push(v6.end);
    if (v6.constr) parts.push(`constructor:${v6.constr}`);
    if (hasMode) parts.push(...v6.mode);
    if (v6.prefixLength != null && v6.prefixLength !== '') {
      parts.push(String(v6.prefixLength));
    }
    if (v6.leaseTime) parts.push(v6.leaseTime);

    return `dhcp-range=${parts.join(',')}`;
  }

  _formatDhcpHost(host) {
    if (!host) return null;
    const parts = [];
    if (host.mac) parts.push(host.mac);
    if (host.ip) parts.push(host.ip);
    if (host.hostname) parts.push(host.hostname);
    if (host.leaseTime) parts.push(host.leaseTime);
    if (parts.length === 0) return null;

    let line = `dhcp-host=${parts.join(',')}`;
    if (host.comment) line += ` # ${host.comment}`;
    return line;
  }
}

export default DnsmasqConfigFormatter;