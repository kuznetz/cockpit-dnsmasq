import cockpit from 'cockpit';

class DnsmasqApi {
  // System service operations
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

  // File operations
  static async readConfig() {
    return cockpit.file("/etc/dnsmasq.conf").read();
  }

  static async saveConfig(content) {
    return cockpit.file("/etc/dnsmasq.conf").replace(content);
  }

  static async readLeases() {
    return cockpit.file("/var/lib/misc/dnsmasq.leases").read();
  }

  // Log operations
  static async readLogs() {
    return cockpit.spawn(["journalctl", "-u", "dnsmasq", "--since", "1 hour ago", "--no-pager"]);
  }
}

export default DnsmasqApi;