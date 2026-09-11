const RE = {
  ipv4: /^(\d{1,3}\.){3}\d{1,3}$/,
  ipv4Cidr: /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/,
  prefix: /^\d{1,3}$/,
  ipv6: /^([0-9a-f]{1,4}:){1,7}[0-9a-f]{1,4}$/i,
  ipv6Short: /^::([0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4}$/i,
  ipv6Mixed: /^([0-9a-f]{1,4}:){1,6}:(\d{1,3}\.){3}\d{1,3}$/i,
  lease: /^(\d+[smhd]?|\d+:\d+)$/i,
};

function tokenize(value) {
  const tokens = [];
  let cur = '';
  let quote = '';

  for (const ch of value) {
    if (!quote && (ch === '"' || ch === "'")) {
      quote = ch;
      continue;
    }
    if (quote && ch === quote) {
      quote = '';
      continue;
    }
    if (ch === ',' && !quote) {
      if (cur.trim()) tokens.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }

  if (cur.trim()) tokens.push(cur.trim());
  return tokens;
}

function isIPAddress(s) {
  if (RE.ipv4.test(s)) {
    return s.split('.').every(n => n >= 0 && n <= 255);
  }
  return RE.ipv6.test(s) || RE.ipv6Short.test(s) || RE.ipv6Mixed.test(s);
}

function isCIDR(s) {
  return RE.prefix.test(s) || RE.ipv4Cidr.test(s);
}

function isNetmask(s) {
  if (RE.prefix.test(s)) {
    const n = +s;
    return n >= 0 && n <= 32;
  }

  if (!RE.ipv4.test(s)) return false;

  const parts = s.split('.').map(Number);
  if (!parts.every(n => n >= 0 && n <= 255)) return false;

  const bits = parts.map(n => n.toString(2).padStart(8, '0')).join('');
  return /^1*0*$/.test(bits);
}

function isLeaseTime(s) {
  return RE.lease.test(s);
}

function inferNetmask(ip) {
  if (ip.startsWith('10.')) return '255.0.0.0';
  if (ip.startsWith('172.16.')) return '255.240.0.0';
  if (ip.startsWith('192.168.')) return '255.255.255.0';
  if (ip.startsWith('169.254.')) return '255.255.0.0';
  return '255.255.255.0';
}

function inferIPv6Prefix(ip) {
  if (ip.startsWith('fe80:')) return '64';
  if (ip.startsWith('fc00:') || ip.startsWith('fd00:')) return '7';
  return '64';
}

function parseIPv4Range(tokens) {
  const r = {
    type: 'ipv4',
    mode: 'dynamic',
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
    raw: tokens,
  };

  let i = 0;

  if (
    tokens.length > 2 &&
    !isIPAddress(tokens[0]) &&
    !isCIDR(tokens[0])
  ) {
    r.networkId = tokens[i++];
  }

  r.start = tokens[i++];
  r.end = tokens[i++];

  for (; i < tokens.length; i++) {
    const t = tokens[i];
    const low = t.toLowerCase();

    if (!r.netmask && isNetmask(t)) {
      r.netmask = t;
    } else if (!r.broadcast && !r.router && isIPAddress(t)) {
      r.broadcast = t;
    } else if (!r.router && isIPAddress(t)) {
      r.router = t;
    } else if (isLeaseTime(t)) {
      r.leaseTime = t;
    } else if (low.startsWith('option:')) {
      r.options.push(t.slice(7));
    } else if (low === 'static' || low === 'proxy') {
      r.mode = low;
    } else if (low.startsWith('tag:')) {
      r.tags.push(t.slice(4));
    } else if (low.startsWith('class:')) {
      r.classes.push(t.slice(6));
    } else if (low.startsWith('set:')) {
      const [key, value] = t.slice(4).split('=', 2);
      if (key) r.settings[key] = value ?? true;
    } else if (low.startsWith('id:')) {
      r.staticBindings.push(t);
    } else {
      (r.settings.unknown ??= []).push(t);
    }
  }

  if (!r.netmask && r.start) {
    r.netmask = inferNetmask(r.start);
  }

  return r;
}

function parseIPv6Range(tokens) {
  const r = {
    type: 'ipv6',
    mode: 'dynamic',
    start: tokens[0] || null,
    end: tokens[1] || null,
    prefix: null,
    leaseTime: null,
    flags: [],
    temporary: false,
    deprecated: false,
    raOnly: false,
    raw: tokens,
  };

  let i = 2;

  if (i < tokens.length && isCIDR(tokens[i])) {
    r.prefix = tokens[i++];
  } else {
    r.prefix = inferIPv6Prefix(r.start);
  }

  for (; i < tokens.length; i++) {
    const t = tokens[i];
    const low = t.toLowerCase();

    if (isLeaseTime(t)) {
      r.leaseTime = t;
    } else if (low === 'static' || low === 'proxy' || low === 'dynamic') {
      r.mode = low;
    } else if (low === 'slaac') {
      r.mode = 'slaac';
      r.flags.push(low);
    } else if (low === 'temporary') {
      r.temporary = true;
      r.flags.push(low);
    } else if (low === 'deprecated') {
      r.deprecated = true;
      r.flags.push(low);
    } else if (low === 'ra-only' || low === 'ra-names') {
      r.raOnly = true;
      r.flags.push('ra-only');
    } else {
      r.flags.push(t);
    }
  }

  return r;
}

// ---------- public API ----------

export function parse(value) {
  const tokens = tokenize(value);
  if (!tokens.length) throw new Error('Empty dhcp-range value');

  const ipv6 =
    tokens[0].includes(':') ||
    tokens.some(t =>
      ['ra-only', 'ra-names', 'slaac', 'temporary', 'deprecated']
        .includes(t.toLowerCase())
    );

  return ipv6 ? parseIPv6Range(tokens) : parseIPv4Range(tokens);
}

export function format(c) {
  const parts = [];

  if (c.networkId) parts.push(c.networkId);
  parts.push(c.start, c.end);

  if (c.type === 'ipv4') {
    [c.netmask, c.broadcast, c.router, c.leaseTime]
      .forEach(v => v && parts.push(v));

    c.options.forEach(o => parts.push(`option:${o}`));
    c.tags.forEach(t => parts.push(`tag:${t}`));
    c.classes.forEach(cl => parts.push(`class:${cl}`));

    if (c.mode !== 'dynamic') parts.push(c.mode);

    Object.entries(c.settings).forEach(([k, v]) => {
      parts.push(v === true ? `set:${k}` : `set:${k}=${v}`);
    });

    c.staticBindings.forEach(b => parts.push(b));
  } else {
    if (c.prefix) parts.push(c.prefix);
    if (c.mode !== 'dynamic') parts.push(c.mode);
    if (c.leaseTime) parts.push(c.leaseTime);
    if (c.temporary) parts.push('temporary');
    if (c.deprecated) parts.push('deprecated');
    if (c.raOnly) parts.push('ra-only');

    c.flags.forEach(f => {
      if (
        f !== c.mode &&
        !['temporary', 'deprecated', 'ra-only'].includes(f)
      ) {
        parts.push(f);
      }
    });
  }

  return `dhcp-range=${parts.join(',')}`;
}

export function validate(c) {
  const errors = [];

  if (!c.start || !c.end) {
    errors.push('Start and end addresses are required');
  }

  if (c.type === 'ipv4') {
    if (c.netmask && !isNetmask(c.netmask)) {
      errors.push(`Invalid netmask: ${c.netmask}`);
    }
  } else if (c.prefix) {
    const n = +c.prefix;
    if (isNaN(n) || n < 0 || n > 128) {
      errors.push(`Invalid IPv6 prefix: ${c.prefix}`);
    }
  }

  if (c.leaseTime && !isLeaseTime(c.leaseTime)) {
    errors.push(`Invalid lease time: ${c.leaseTime}`);
  }

  return { valid: errors.length === 0, errors };
}