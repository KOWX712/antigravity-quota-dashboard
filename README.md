# Ag-Quota-Dashboard

A CLI tool and dashboard for managing Antigravity developer accounts in one place.

## Installation

```bash
npm install -g ag-quota-dashboard
# or
pnpm add -g ag-quota-dashboard
```

## Usage

### Start the dashboard

```bash
ag-quota-dashboard start
```

Options:
- `-p, --port <port>` - Port to run on (default: 3000)
- `-d, --daemon` - Run as a daemon (background process)

### Stop the dashboard

```bash
ag-quota-dashboard stop
```

### Restart the dashboard

```bash
ag-quota-dashboard restart
```

Options:
- `-p, --port <port>` - Port to run on (default: 3000)

### Check status

```bash
ag-quota-dashboard status
```

Shows PID, port, URL, and uptime.

### Show dashboard URL

```bash
ag-quota-dashboard dashboard
```

### Open in browser

```bash
ag-quota-dashboard open
```

Opens the dashboard in your default browser.

### View logs

```bash
ag-quota-dashboard logs
```

Options:
- `-f, --follow` - Follow log output (tail -f)
- `-n, --lines <number>` - Number of lines to show (default: 50)

### Configuration

```bash
ag-quota-dashboard config
```

Show current configuration:
```bash
ag-quota-dashboard config
```

Set a custom port:
```bash
ag-quota-dashboard config --set port=3001
```

## Configuration

This dashboard works with the **opencode-antigravity-auth** plugin. It expects a configuration file at:

`~/.config/opencode/antigravity-accounts.json`

## Development

```bash
# Install dependencies
pnpm install

# Build CLI
pnpm build

# Link for local testing
pnpm link
```
