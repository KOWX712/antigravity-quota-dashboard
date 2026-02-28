# Antigravity Quota Dashboard

A professional, high-fidelity dashboard for managing multiple Antigravity developer accounts in one place. Designed for users who need a unified view of their quotas and model usage across various accounts.

## Key Features

- **Multi-Account Support**: Support for viewing multiple Antigravity accounts' quotas in one place.
- **Plugin Integration**: Support for importing configuration from the [opencode-antigravity-auth](https://github.com/NoeFabris/opencode-antigravity-auth) plugin (located at `~/.config/opencode/antigravity-accounts.json`).
- **High-Fidelity UI**: Modern interface with full dark mode support and interactive drag-and-drop features.
- **Signature-Based Grouping**: Signature-based quota grouping (clustering models that share the same bucket).
- **Recommended Model Filtering**: Strict filtering for "Recommended" models, ensuring you focus on the most relevant options.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (React 19)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Database**: [SQLite](https://www.sqlite.org/) (via `better-sqlite3`)
- **State Management**: [TanStack Query](https://tanstack.com/query/latest)

## LLM-Friendly Quick Context

If you want help from an LLM agent, you can paste this command so it can fetch this README context directly:

```bash
curl -s https://raw.githubusercontent.com/KOWX712/antigravity-quota-dashboard/master/README.md
```

## Getting Started

### 1. Clone the repository

```
git clone https://github.com/KOWX712/antigravity-quota-dashboard.git
cd antigravity-quota-dashboard
```

### 2. First-time setup

```bash
# Using pnpm (recommended)
pnpm install && pnpm build

# Or using npm
npm install && npm run build
```

### 3. Deploy

```bash
# Using pnpm
pnpm start

# Or using npm
npm start
```

### 4. Optional tips: local deployment behind Nginx for long-term use

Use this only if you want a local domain routed through Nginx (for example, `quota-dashboard.local`).

1. Run the app on a dedicated port
    ```bash
    pnpm install
    pnpm build
    PORT=3001 pnpm start
    ```

2. Add a hosts rule (example)
    ```text
    # /etc/hosts
    127.0.0.1 quota-dashboard.local
    ```

  Tips:
   - Use a unique local domain per app (`site-a.local`, `quota-dashboard.local`, etc.).
   - If you access the app from another device, add the same hosts entry on that client device.

3. Add an Nginx vhost in `/etc/nginx/conf.d/quota-dashboard.conf`
    ```nginx
    server {
      listen 80;
      server_name quota-dashboard.local;

      location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
      }
    }
    ```

4. Validate and reload Nginx
    ```bash
    sudo nginx -t
    sudo systemctl reload nginx
    ```

5. Optional: run with systemd and set a canonical base URL
    ```ini
    # /etc/systemd/system/quota-dashboard.service
    [Service]
    WorkingDirectory=/path/to/antigravity-quota-dashboard
    Environment=NODE_ENV=production
    Environment=PORT=3001
    Environment=APP_BASE_URL=http://quota-dashboard.local
    ExecStart=/path/to/pnpm start
    ```

Then reload service config:
  ```bash
  sudo systemctl daemon-reload
  sudo systemctl enable --now quota-dashboard
  ```

`APP_BASE_URL` is optional, but recommended when running behind a custom local domain.

## Configuration

This dashboard is specifically designed to work with the **opencode-antigravity-auth** plugin. It expects a configuration file at:

`~/.config/opencode/antigravity-accounts.json`

Ensure your account details are correctly configured in that file for them to appear in the dashboard.

### OAuth local workaround (when using the default bundled client)

If you hit `Error 400: invalid_request` on custom local domains (for example `https://quota-dashboard.local`), use this callback override:

```bash
OAUTH_REDIRECT_URI=https://localhost/api/auth/callback
```

Why this works:
- The bundled default OAuth client accepts localhost callbacks.
- Some custom local domains are rejected by Google's validation policy for that client.

For long-term stable deployment, prefer your own OAuth client credentials and authorize your actual domain callback URL.

Feel free to PR any changes or improvements.
