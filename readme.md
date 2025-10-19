# Cockpit Dnsmasq

## Key Features

## Technical Details

- **Framework**: Built with React.js (v18+) for a modern, component-based UI
- **Privileges**: Requires superuser access for firewall modifications

## Using prebuild release

Just copy files from archive to directory `/usr/local/share/cockpit/port-forward`

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
   - Copy the `port-forward` directory to `/usr/share/cockpit/`
   - Or create a symbolic link from your development directory

## Requirements

- Cockpit installed and running
- dnsmasq service active
- Node.js and npm for development builds
