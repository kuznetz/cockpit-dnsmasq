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

  // Log operations
  static async readLogs() {
    return cockpit.spawn(["journalctl", "-u", "dnsmasq", "--since", "1 hour ago", "--no-pager"]);
  }
}

export default DnsmasqApi;