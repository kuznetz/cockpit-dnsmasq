import DnsmasqConfig from './dnsmasq-config.js'
import { parse as dhcpRangeParse } from "./dhcp-range-parser.js";

// ---- helpers для IPv6 dhcp-range ----

const DHCPV6_MODES = ['ra-stateless', 'ra-names', 'slaac', 'ra-only', 'stateful'];

function _isIPv6Range(value) {
  const parts = value.split(',').map(p => p.trim()).filter(Boolean);
  for (const p of parts) {
    const lower = p.toLowerCase();
    if (lower.startsWith('tag:') || lower.startsWith('set:')) continue;
    if (lower.startsWith('constructor:')) return true;
    if (DHCPV6_MODES.includes(lower)) return true;
    // IPv6-адрес содержит ':' (в отличие от IPv4/имени интерфейса)
    if (p.includes(':')) return true;
  }
  return false;
}

function parseDhcpv6Range(value) {
  const parts = value.split(',').map(p => p.trim()).filter(Boolean);
  const result = {
    mode: [],
    start: null,
    end: null,
    constr: null,
    prefixLength: null,
    leaseTime: null
  };

  // пропускаем теги в начале
  let i = 0;
  while (i < parts.length) {
    const lower = parts[i].toLowerCase();
    if (lower.startsWith('tag:') || lower.startsWith('set:')) { i++; continue; }
    break;
  }

  // start
  if (i < parts.length && parts[i].includes(':')) {
    result.start = parts[i++];
  }

  // end | constructor:<iface>
  if (i < parts.length) {
    const p = parts[i];
    const lower = p.toLowerCase();
    if (lower.startsWith('constructor:')) {
      result.constr = p.substring('constructor:'.length);
      i++;
    } else if (p.includes(':')) {
      result.end = p;
      i++;
    }
  }

  // остаток: mode(s), prefix-length, lease-time (в любом порядке)
  while (i < parts.length) {
    const p = parts[i];
    const lower = p.toLowerCase();
    if (DHCPV6_MODES.includes(lower)) {
      result.mode.push(lower);
    } else if (/^\d+$/.test(p) && result.prefixLength === null) {
      result.prefixLength = parseInt(p, 10);
    } else {
      // '12h', 'infinite', число секунд и т.п.
      result.leaseTime = p;
    }
    i++;
  }

  return result;
}

class DnsmasqConfigParser {
  constructor() {
    this.config = new DnsmasqConfig();
  }

  static parse(configText) {
    const parser = new DnsmasqConfigParser();
    const lines = parser.parseText(configText);
    const config = parser.parseLines(lines);
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
      'interface',
      'dhcp-range',
      'dhcp-option',
      'dhcp-host',
      'dhcp-lease-max',
      'server',
      'address',
      'local',
      'domain',
      'cache-size',
      'listen-address',
      'interface-name',
      'addn-hosts',
      'host-record',
      'cname',
      'ra-param'
    ]);

    for (const line of lines) {
      const [param, value, comment, lineNumber] = line;
      if (!param) continue;

      if (valueRequired.has(param) && !value) {
        this._warn(`Missing value for ${param}`, lineNumber);
        continue;
      }

      switch (param) {
        // interface=<iface> — слушать только указанный сетевой интерфейс.
        // Директива может повторяться; накапливаем интерфейсы в config.interfaces.
        case 'interface':
          this.config.interfaces.push(value);
          break;

        // bind-interfaces — привязываться только к интерфейсам, заданным через interface=...
        // Полезно для запуска нескольких экземпляров dnsmasq. Соответствует режиму 'interfaces'.
        case 'bind-interfaces':
          this.config.bind = 'interfaces';
          break;

        // bind-dynamic — как bind-interfaces, но динамически подхватывает новые/удалённые интерфейсы.
        // Соответствует режиму 'dynamic'.
        case 'bind-dynamic':
          this.config.bind = 'dynamic';
          break;

        // dhcp-range=... — диапазон адресов/параметры DHCP для IPv4 или IPv6.
        // Формат зависит от семейства: IPv4 — start,end,netmask,lease; IPv6 — режимы RA/DHCPv6.
        case 'dhcp-range':
          if (_isIPv6Range(value)) {
            this._parseDhcpv6Range(value, lineNumber);
          } else {
            this._parseDhcpRange(value, lineNumber);
          }
          break;

        // dhcp-option=... — дополнительная опция DHCP (router, DNS, NTP и т.п.),
        // может быть привязана к тегам клиентов/сетей.
        case 'dhcp-option':
          this._parseDhcpOption(value, lineNumber);
          break;

        // dhcp-host=... — статическая привязка клиента: MAC/client-id -> IP, hostname,
        // lease time, tags, ignore и т.д.
        case 'dhcp-host':
          this._parseDhcpHost(value, comment, lineNumber);
          break;

        // dhcp-lease-max=... — максимальное количество одновременных DHCP-аренд.
        case 'dhcp-lease-max':
          this.config.dhcpLeaseMax = value;
          break;

        // ---- DNS ----

        // server=... — вышестоящий DNS-сервер. Может быть общим или для конкретного домена:
        // server=/domain/1.2.3.4.
        case 'server':
          this.config.dns.servers.push(value);
          break;

        // address=/domain/ip — вернуть заданный IP для домена (локальная A/AAAA-запись).
        case 'address':
          this.config.dns.addresses.push(value);
          break;

        // local=/domain/ — не пересылать запросы для домена наружу, отвечать локально
        // (из /etc/hosts, DHCP и т.п.).
        case 'local':
          this.config.dns.local.push(value);
          break;

        // domain=... — домен для DNS и DHCP; используется, например, для expand-hosts
        // и формирования FQDN.
        case 'domain':
          this.config.domain = value;
          break;

        // no-resolv — не читать /etc/resolv.conf для получения вышестоящих DNS-серверов.
        case 'no-resolv':
          this.config.dns.noResolv = true;
          break;

        // no-hosts — не читать /etc/hosts.
        case 'no-hosts':
          this.config.dns.noHosts = true;
          break;

        // domain-needed — не пересылать вверх имена без точки/доменной части.
        case 'domain-needed':
          this.config.dns.domainNeeded = true;
          break;

        // bogus-priv — не пересылать reverse-запросы для приватных диапазонов,
        // если для них нет локальных данных.
        case 'bogus-priv':
          this.config.dns.bogusPriv = true;
          break;

        // expand-hosts — добавлять domain к простым именам из /etc/hosts.
        case 'expand-hosts':
          this.config.dns.expandHosts = true;
          break;

        // cache-size=... — размер DNS-кэша. 0 отключает кэширование.
        case 'cache-size':
          this.config.dns.cacheSize = value;
          break;

        // listen-address=... — дополнительно слушать указанный IP-адрес.
        case 'listen-address':
          this.config.dns.listenAddresses.push(value);
          break;

        // interface-name=... — DNS-запись (A/AAAA) для имени, связанного с интерфейсом.
        case 'interface-name':
          this.config.dns.interfaceNames.push(value);
          break;

        // addn-hosts=... — дополнительный файл hosts.
        case 'addn-hosts':
          this.config.dns.addnHosts.push(value);
          break;

        // host-record=... — добавить A/AAAA/PTR-запись для имени.
        case 'host-record':
          this.config.dns.hostRecords.push(value);
          break;

        // cname=... — CNAME-алиас.
        case 'cname':
          this.config.dns.cnames.push(value);
          break;

        // ---- DHCPv6 / RA ----

        // enable-ra — включить отправку IPv6 Router Advertisement.
        // В dnsmasq часто включается автоматически при DHCPv6-режимах;
        // отдельного поля в config нет — игнорируем.
        case 'enable-ra':
          break;

        // ra-param=... — параметры Router Advertisement для сетевого интерфейса
        // (интервалы, router lifetime и т.п.). Отдельного поля в config нет — игнорируем.
        case 'ra-param':
          break;

        default:
          this._warn(`Unsupported directive "${param}"`, lineNumber);
          break;
      }
    }

    return this.config;
  }

  _parseDhcpRange(value, lineNumber) {
    const dhcpv4 = this.config.dhcpv4;
    if (dhcpv4.enabled) {
      this._warn(`Multiple dhcp-range not supported`, lineNumber);
      return;
    }
    try {
      const range = dhcpRangeParse(value);
      // router и leaseTime поднимаем на верхний уровень
      if (range.leaseTime) {
        dhcpv4.leaseTime = range.leaseTime;
        delete range.leaseTime;
      }
      if (range.router) {
        dhcpv4.router = range.router;
        delete range.router;
      }
      Object.assign(dhcpv4, range);
      dhcpv4.enabled = true;
    } catch (e) {
      this._warn(`Error parsing dhcp-range "${value}": ${e.message}`, lineNumber);
    }
  }

  _parseDhcpv6Range(value, lineNumber) {
    const dhcpv6 = this.config.dhcpv6;
    // mode — массив; пустой массив означает "ещё не задавали range"
    if (dhcpv6.mode.length > 0 || dhcpv6.start !== null || dhcpv6.constr !== null) {
      this._warn(`Multiple dhcp-range (IPv6) not supported`, lineNumber);
      return;
    }
    try {
      const range = parseDhcpv6Range(value);
      // сохраняем ссылочно, чтобы mode был массивом
      dhcpv6.mode = range.mode;
      dhcpv6.start = range.start;
      dhcpv6.end = range.end;
      dhcpv6.constr = range.constr;
      dhcpv6.prefixLength = range.prefixLength;
      dhcpv6.leaseTime = range.leaseTime;
    } catch (e) {
      this._warn(`Error parsing dhcp-range (IPv6) "${value}": ${e.message}`, lineNumber);
    }
  }

  _parseDhcpOption(value, lineNumber) {
    const dhcpv4 = this.config.dhcpv4;
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

    if (code.startsWith('option6:')) {
      this._parseDhcpv6Option(code, vals, value, lineNumber);
      return;
    }

    const optionMap = {
      router: '3',
      'dns-server': '6',
      'domain-name': '15',
      'ntp-server': '42'
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
        dhcpv4.leaseTime = vals[0];
        break;
      case '3':
        dhcpv4.router = vals[0];
        break;
      case '6':
        dhcpv4.dnsServers.push(...vals);
        break;
      case '42':
        dhcpv4.ntpServers.push(...vals);
        break;
      default:
        this._warn(`Unsupported dhcp-option with code/name "${parts[0].trim()}"`, lineNumber);
        break;
    }
  }

  _parseDhcpv6Option(code, vals, originalValue, lineNumber) {
    const dhcpv6 = this.config.dhcpv6;
    const optionName = code.substring('option6:'.length);

    const optionMap = {
      'dns-server': '23',
      'domain-search': '24',
      'sntp-server': '31',
      'ntp-server': '56'
    };

    const codeNum = optionMap[optionName] || optionName;

    switch (codeNum) {
      case '23':
        dhcpv6.dnsServers.push(...vals);
        break;
      case '56':
        dhcpv6.ntpServers.push(...vals);
        break;
      default:
        this._warn(`Unsupported dhcp-option6 with code/name "${optionName}"`, lineNumber);
        return;
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

    const isV6Host = (host.ip && host.ip.includes(':')) || host.mac.startsWith('id:');

    if (isV6Host) {
      this.config.dhcpv6.dhcpHosts.push(host);
    } else {
      this.config.dhcpv4.dhcpHosts.push(host);
    }
  }
}

export { DnsmasqConfig };
export default DnsmasqConfigParser;