# Cockpit Dnsmasq

## Key Features
- Restart/Reload service
- View DHCP Leases
- Remove DHCP Leases
- Set static DHCP Hosts by DHCP Leases
- Edit DHCP values: IP range, gateways, DNS, Lease Time
- Edit network interfaces list
- Test new config before overwrite
- Don't need server backend (except cockpit)
- Dark theme support

## Technical Details
- **Only DHCP configuration, DNS not supported**
- **Only IPv4 support**
- **Only single IP range**
- **Don't support dnsmasq.d directory**
- Built with VUE3 with custom skeleton based css
- Requires superuser access for config modifications
- Tested on Debian 12

## Using prebuild release

Just copy files from archive to directory `/usr/local/share/cockpit/dnsmasq`

## Building

1. Install dependencies:
```bash
npm install
```

2. Build the plugin:
```bash
npm run build
```

3. Deploy to Cockpit:
   - Copy the `dnsmasq` directory to `/usr/local/share/cockpit/dnsmasq`
   - Or create a symbolic link from your development directory

## Requirements
- Cockpit installed and running
- dnsmasq service installed
- Node.js and npm for development builds
