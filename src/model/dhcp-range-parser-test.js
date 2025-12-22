/**
 * Utility function for quick parsing
 */
function parseDnsmasqDhcpRange(line) {
  const parser = new DnsmasqDhcpRangeParser();
  return parser.parse(line);
}

/**
 * Example usage and test cases
 */
const testCases = [
  // Basic IPv4 ranges
  '192.168.1.100,192.168.1.200,255.255.255.0,12h',
  'eth0,192.168.1.100,192.168.1.200,255.255.255.0',
  '192.168.1.100,192.168.1.200,24',
  
  // IPv4 with options
  '192.168.1.100,192.168.1.200,255.255.255.0,192.168.1.255,192.168.1.1,24h',
  '192.168.1.100,192.168.1.200,,,192.168.1.1',
  
  // IPv4 modes
  '192.168.1.100,192.168.1.200,static',
  '192.168.1.100,192.168.1.200,proxy',
  
  // IPv4 with tags and classes
  '192.168.1.100,192.168.1.200,tag:office,class:employees',
  '192.168.1.100,192.168.1.200,set:router=192.168.1.1',
  
  // IPv6 ranges
  '2001:db8::100,2001:db8::200,64',
  '2001:db8::100,2001:db8::200,64,12h',
  
  // IPv6 with flags
  'fd00::100,fd00::200,7,temporary',
  'fe80::,fe80::ffff,64,deprecated',
  '2001:db8::,2001:db8::ffff,64,ra-only',
  
  // With comments and whitespace
  '192.168.1.100,192.168.1.200',
  '192.168.1.100 , 192.168.1.200 , 255.255.255.0  ',
  
  // Different formats
  '192.168.1.100,192.168.1.200',
  '192.168.1.50,192.168.1.150, infinite',
];

// Run test cases
function runTests() {
  const parser = new DnsmasqDhcpRangeParser();
  const results = [];
  
  console.log('Testing Dnsmasq DHCP Range Parser\n' + '='.repeat(50));
  
  testCases.forEach((testCase, index) => {
    try {
      const parsed = parser.parse(testCase);
      const validation = parser.validate(parsed);
      const formatted = parser.format(parsed);
      
      results.push({
        input: testCase,
        parsed,
        validation,
        formatted,
        error: null
      });
      
      console.log(`Test ${index + 1}: ✓`);
      console.log(`  Input:    ${testCase}`);
      console.log(`  Type:     ${parsed.type.toUpperCase()}`);
      console.log(`  Range:    ${parsed.start} - ${parsed.end}`);
      console.log(`  Valid:    ${validation.valid ? 'Yes' : 'No'}`);
      if (!validation.valid) {
        console.log(`  Errors:   ${validation.errors.join(', ')}`);
      }
      console.log();
      
    } catch (error) {
      results.push({
        input: testCase,
        parsed: null,
        validation: null,
        formatted: null,
        error: error.message
      });
      
      console.log(`Test ${index + 1}: ✗`);
      console.log(`  Input:  ${testCase}`);
      console.log(`  Error:  ${error.message}`);
      console.log();
    }
  });
  
  return results;
}

// Example usage in browser or Node.js
/*
const parser = new DnsmasqDhcpRangeParser();

// Parse a configuration line
const config = parser.parse('192.168.1.100,192.168.1.200,255.255.255.0,12h');

console.log(config);
// Outputs:
// {
//   type: 'ipv4',
//   mode: 'dynamic',
//   networkId: null,
//   start: '192.168.1.100',
//   end: '192.168.1.200',
//   netmask: '255.255.255.0',
//   broadcast: null,
//   gateway: null,
//   leaseTime: '12h',
//   options: [],
//   tags: [],
//   classes: [],
//   settings: {},
//   staticBindings: [],
//   raw: ['192.168.1.100', '192.168.1.200', '255.255.255.0', '12h']
// }

// Format back to dnsmasq syntax
const formatted = parser.format(config);
console.log(formatted); // 192.168.1.100,192.168.1.200,255.255.255.0,12h

// Validate configuration
const validation = parser.validate(config);
console.log(validation.valid); // true
*/

// Uncomment to run tests
// runTests();