# Cockpit Dnsmasq

## Key Features
- View DHCP Leases
- Set static DHCP Hosts
- Edit DHCP values: IP range, gateways, DNS, Lease Time
- Edit network Interfaces

## Technical Details

- **Framework**: Built with VUE3 with custom skeleton based css
- **Privileges**: Requires superuser access for config modifications

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
- dnsmasq service active
- Node.js and npm for development builds
