class DnsmasqLeasesParser {
    /**
     * Parse dnsmasq leases file content
     * @param {string} content - The content of /var/lib/misc/dnsmasq.leases
     * @returns {Array} Array of lease objects
     */
    static parse(content) {
        const lines = content.trim().split('\n');
        const leases = [];
        
        for (const line of lines) {
            if (!line.trim()) continue; // Skip empty lines
            
            const lease = this.parseLine(line);
            if (lease) {
                leases.push(lease);
            }
        }
        
        return leases;
    }
    
    /**
     * Parse a single lease line
     * @param {string} line - A single line from the leases file
     * @returns {Object|null} Lease object or null if invalid
     */
    static parseLine(line) {
        //TODO: Now from server
        const now = Math.floor(Date.now() / 1000);

        const parts = line.trim().split(/\s+/);
        
        // Minimum required parts: timestamp, mac, ip, hostname
        if (parts.length < 4) {
            console.warn('Invalid lease line (too few parts):', line);
            return null;
        }
        
        const timestamp = parseInt(parts[0], 10)
        if (isNaN(timestamp)) throw new Error('Invalid timestamp');

        const lease = {
            timestamp,
            expiryDate: new Date(timestamp * 1000),
            isActive: timestamp > now,
            mac: parts[1],
            ip: parts[2],
            hostname: parts[3],
            clientId: parts[4] || null // Optional client identifier
        };
        
        // Validate required fields
        if (isNaN(lease.timestamp) || !this.isValidMac(lease.mac) || !this.isValidIp(lease.ip)) {
            throw new Error('Invalid lease data:', lease);
        }
        
        return lease;
    }
    
    /**
     * Validate MAC address format
     * @param {string} mac - MAC address to validate
     * @returns {boolean}
     */
    static isValidMac(mac) {
        return /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(mac);
    }
    
    /**
     * Validate IP address format
     * @param {string} ip - IP address to validate
     * @returns {boolean}
     */
    static isValidIp(ip) {
        return /^(\d{1,3}\.){3}\d{1,3}$/.test(ip);
    }
    
}

export default DnsmasqLeasesParser