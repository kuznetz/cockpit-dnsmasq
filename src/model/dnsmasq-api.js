import DnsmasqLeasesParser from './leases-parser.js';
import cockpit from 'cockpit';

class DnsmasqApi {

  static async init() {
    console.log('DnsmasqApi init',cockpit)
  }
  
  static async checkStatus() {
    return cockpit.spawn(["systemctl", "is-active", "dnsmasq"]);
  }

  static async startService() {
    return cockpit.spawn(["systemctl", "start", "dnsmasq"], { superuser: true });
  }

  static async stopService() {
    return cockpit.spawn(["systemctl", "stop", "dnsmasq"], { superuser: true });
  }

  static async restartService() {
    return cockpit.spawn(["systemctl", "restart", "dnsmasq"], { superuser: true });
  }

  static async reloadService() {
    return cockpit.spawn(["systemctl", "reload", "dnsmasq"], { superuser: true });
  }

  static async getConfigPath() {
    return "/etc/dnsmasq.conf"
  }

  // File operations
  static async readConfig(configPath) {
    return cockpit.file(configPath).read();
  }

  static async saveConfig(configPath, content) {
    console.log('saveConfig', content)
    const newConfigPath = `${configPath}.new`;
    const backupPath = `${configPath}.bak`;  
    try {
      //Save to temporary new file
      try {
        await cockpit.file(newConfigPath, { superuser: "require" }).replace(content);
      } catch (error) {
        throw new Error(`Failed to write file ${newConfigPath}: ${error.message}`);
      }
      //Validate dnsmasq configuration (if it's a dnsmasq config)
      if (configPath.includes('dnsmasq')) {
        try {
          await cockpit.spawn(['dnsmasq', '--test', '-C', newConfigPath], { superuser: "try" });
          console.log('DNSmasq configuration validation passed');
        } catch (error) {
          // Remove the invalid new config file
          await cockpit.spawn(["rm", "-f", newConfigPath], { superuser: "require" })
          throw new Error(`DNSmasq configuration invalid: ${error.message}`);
        }
      }
      
      //Backup original file if it exists
      const originalContent = await cockpit.file(configPath, { superuser: "try" }).read();
      if (originalContent !== null) {
        await cockpit.file(backupPath, { superuser: "require" }).replace(originalContent);
        console.log(`Backup created at: ${backupPath}`);
      }
      
      //Replace original with new config
      await cockpit.file(configPath, { superuser: "require" }).replace(content);
      await cockpit.spawn(["rm", "-f", newConfigPath], { superuser: "require" })
      console.log(`Configuration successfully saved to: ${configPath}`);
      
    } catch (error) {
      // Clean up temporary file on error
      try {
        await cockpit.spawn(["rm", "-f", newConfigPath], { superuser: "require" })
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
      
      console.error('Failed to save configuration:', error);
      throw error;
    }
}

  static async readLeases() {
    let txt = await cockpit.file("/var/lib/misc/dnsmasq.leases").read();
    console.log('readLeases', txt)
    let result = DnsmasqLeasesParser.parse(txt)
    console.log('parseLeases', result)
    return result
  }

  static async removeLease(mac) {
    const leaseFile = "/var/lib/misc/dnsmasq.leases";
    const content = await cockpit.file(leaseFile, { superuser: "require" }).read();
    if (content === null) {
      throw new Error(`Lease file not found: ${leaseFile}`);
    }
    const lines = content.trim().split('\n');
    const filtered = lines.filter(line => {
      const parts = line.trim().split(/\s+/);
      return parts[1] !== mac;
    });
    if (filtered.length === lines.length) {
      throw new Error(`Lease with MAC ${mac} not found`);
    }
    await cockpit.file(leaseFile, { superuser: "require" }).replace(filtered.join('\n') + '\n');
    console.log(`Lease with MAC ${mac} removed`);
  }

  static async readNetworks() {
      const SYS_NET = "/sys/class/net";

      // Get list of interface names
      const dir = cockpit.file(SYS_NET, { superuser: "try" });
      let names;
      try {
          names = await dir.read();
      } catch (e) {
          return [];
      }

      // If cockpit.file can't read directories — use ls via spawn
      if (!Array.isArray(names)) {
          const proc = cockpit.spawn(["ls", "-1", SYS_NET],
                                    { superuser: "try", err: "message" });
          const out = await proc;
          names = out.trim().split("\n").filter(Boolean);
      }

      const interfaces = [];

      for (const name of names.sort()) {
          if (name === "lo") continue;

          // Read operstate
          let state = "unknown";
          try {
              const st = await cockpit.file(`${SYS_NET}/${name}/operstate`,
                                            { superuser: "try" }).read();
              state = (st || "").trim();
          } catch (_) { /* ignore */ }

          interfaces.push({ name, state });
      }

      return interfaces;
  }

}

export default DnsmasqApi;