export default class DnsmasqConfig {
  constructor() {
    this.interfaces = [];
    this.bind = ''; // '','interfaces','dynamic'
    this.dhcpLeaseMax = null;
    this.parserWarnings = [];
    this.domain = null;

    this.dhcpv4 = {
      enabled: false,
      start: null,
      end: null,
      netmask: null,
      prefixLength: null,
      broadcast: null,
      router: null,           // Option 3
      dnsServers: [],         // Option 6
      ntpServers: [],         // Option 42
      dhcpHosts: [],
      leaseTime: null
    };

    // DHCPv6 / RA
    this.dhcpv6 = {
      mode: [], // 'ra-stateless' | 'ra-names' | 'slaac' | 'ra-only' | 'stateful' | 'dhcpv6'
      start: null,
      end: null,
      constr: null,
      prefixLength: null,
      dnsServers: [], // option6:dns-server / 23
      ntpServers: [], // option6:ntp-server / 56
      dhcpHosts: [],
      leaseTime: null
    };

    this.dns = {
      servers: [],
      noResolv: false,
      noHosts: false,
      domainNeeded: false,
      bogusPriv: false,
      expandHosts: false,
      local: [],
      addresses: [],
      hostRecords: [],
      cnames: [],
      cacheSize: null,
      listenAddresses: [],
      interfaceNames: [],
      addnHosts: []
    };
  }
}
