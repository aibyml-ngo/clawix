# DigitalOcean Deployment Guide

## Step 1 — Create a Droplet

1. Log in to [digitalocean.com](https://digitalocean.com) → **Create → Droplets**
2. Choose:
   - **Image:** Ubuntu 24.04 LTS
   - **Size:** Basic → **$18/mo** (2 vCPU, 4GB RAM)
   - **Region:** closest to your users
   - **Authentication:** SSH key
3. Click **Create Droplet**, note the IP (e.g. `165.22.10.50`)

---

## Step 2 — Point Your Domain

You own `aibyml.com`. Add two DNS A records at your domain registrar (wherever you manage aibyml.com DNS — GoDaddy, Namecheap, Cloudflare, etc.):

```
A   clawix.aibyml.com       →  <your droplet IP>
A   api.clawix.aibyml.com   →  <your droplet IP>
```

DNS propagates in a few minutes (up to 1 hour max). You can verify with:

```bash
dig clawix.aibyml.com +short
dig api.clawix.aibyml.com +short
```

Both should return your droplet IP before proceeding to SSL (Step 7).

---

## Step 3 — SSH In and Install Dependencies

```bash
ssh root@165.22.10.50

# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Nginx + Certbot
apt install -y nginx certbot python3-certbot-nginx ufw

# Firewall rules
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

---

## Step 4 — Clone the Repo and Configure `.env`

```bash
git clone https://github.com/YOUR_ORG/clawix.git /opt/clawix
cd /opt/clawix
nano .env
```

Set these values in `.env`:

```env
# Postgres
POSTGRES_PASSWORD=your_strong_db_password_here
POSTGRES_USER=clawix
POSTGRES_DB=clawix

# JWT (generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=

# Encryption key (generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
PROVIDER_ENCRYPTION_KEY=

# CORS
CORS_ALLOWED_ORIGINS=https://clawix.aibyml.com

# URLs baked into Next.js at build time
NEXT_PUBLIC_API_URL=https://api.clawix.aibyml.com
NEXT_PUBLIC_WS_URL=wss://api.clawix.aibyml.com

# Host paths for Docker volume mounts
CLAWIX_HOST_DATA_DIR=/opt/clawix/data
CLAWIX_HOST_SKILLS_BUILTIN_DIR=/opt/clawix/skills/builtin
CLAWIX_HOST_SKILLS_CUSTOM_DIR=/opt/clawix/skills/custom

# Admin account (created automatically on first boot)
INITIAL_ADMIN_EMAIL=aibyml.ngo@gmail.com
INITIAL_ADMIN_PASSWORD=Passw@rd!234
INITIAL_ADMIN_NAME=Victor

# AI provider (at least one required)
OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...
DEFAULT_PROVIDER=openai
DEFAULT_LLM_MODEL=gpt-4o
```

Generate secrets:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"  # JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"  # PROVIDER_ENCRYPTION_KEY
```

---

## Step 5 — Build and Start the App

```bash
cd /opt/clawix

# Build images (3-5 minutes on first run)
docker compose -f docker-compose.prod.yml build

# Start everything
docker compose -f docker-compose.prod.yml up -d

# Watch logs to confirm startup
docker compose -f docker-compose.prod.yml logs -f
```

You should see migrations run, bootstrap create your admin, and all 4 containers go healthy.

---

## Step 6 — Configure Nginx Reverse Proxy

```bash
nano /etc/nginx/sites-available/clawix
```

Paste:

```nginx
server {
    server_name clawix.aibyml.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    server_name api.clawix.aibyml.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_read_timeout 300s;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/clawix /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

---

## Step 7 — SSL (requires a domain)

```bash
certbot --nginx -d clawix.aibyml.com -d api.clawix.aibyml.com
```

Certbot edits Nginx config automatically and sets up auto-renewal.

---

## Step 8 — Auto-start on Reboot

```bash
nano /etc/systemd/system/clawix.service
```

```ini
[Unit]
Description=Neusclawix
After=docker.service
Requires=docker.service

[Service]
WorkingDirectory=/opt/clawix
ExecStart=docker compose -f docker-compose.prod.yml up
ExecStop=docker compose -f docker-compose.prod.yml down
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
systemctl enable clawix
```

---

## Useful Commands

```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f

# Update and redeploy
git pull
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# Check container health
docker compose -f docker-compose.prod.yml ps

# Database shell
docker exec -it neusclawix-postgres psql -U clawix -d clawix
```

---

## Notes

- `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` are baked into the Next.js bundle at **build time**. If you change your domain later, rebuild the web image (`docker compose -f docker-compose.prod.yml build web`) — a restart alone won't pick up the change.
- The API runs as root to access the Docker socket for spawning agent containers. This is intentional.
- Postgres data persists in a Docker named volume (`postgres_data`). Back it up with `docker exec neusclawix-postgres pg_dump -U clawix clawix > backup.sql`.

---

## Appendix — Domain Setup for aibyml.com

### A. Add DNS Records

Log in to wherever you manage `aibyml.com` DNS and add two A records:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `clawix` | `<your droplet IP>` | 3600 |
| A | `api.clawix` | `<your droplet IP>` | 3600 |

This creates:
- `clawix.aibyml.com` → web dashboard
- `api.clawix.aibyml.com` → API + WebSocket

Verify propagation before continuing:

```bash
dig clawix.aibyml.com +short
dig api.clawix.aibyml.com +short
# Both should return your droplet IP
```

---

### B. Cloudflare Users (if aibyml.com uses Cloudflare)

**Important:** set the proxy toggle to **DNS only (grey cloud)** for both records — not the orange proxied mode.

The orange proxy breaks WebSocket connections, which the app uses for live agent output.

In the Cloudflare dashboard:
1. DNS → Records
2. Find `clawix` and `api.clawix`
3. Click the orange cloud icon on each → switch to grey (DNS only)

---

### C. Common Registrar Instructions

**Namecheap**
1. Domain List → Manage → Advanced DNS
2. Add Record → A Record → Host: `clawix` → Value: `<IP>`
3. Add Record → A Record → Host: `api.clawix` → Value: `<IP>`

**GoDaddy**
1. My Products → DNS → Manage
2. Add → Type: A → Name: `clawix` → Value: `<IP>`
3. Add → Type: A → Name: `api.clawix` → Value: `<IP>`

**Cloudflare**
1. Select `aibyml.com` → DNS → Records → Add record
2. Type: A → Name: `clawix` → IPv4: `<IP>` → Proxy: **DNS only**
3. Repeat for `api.clawix`

---

### D. If You Change the Domain Later

Since `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` are baked into the Next.js image at build time, changing domains requires:

1. Update `.env` with the new URLs
2. Rebuild the web image: `docker compose -f docker-compose.prod.yml build web`
3. Restart: `docker compose -f docker-compose.prod.yml up -d`
4. Re-run Certbot for the new domain: `certbot --nginx -d newdomain.com -d api.newdomain.com`
