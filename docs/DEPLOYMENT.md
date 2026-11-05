<div dir="rtl">

# 🚀 Deployment · النشر

## نظرة عامة

النشر يستخدم **Hetzner VPS واحد** مع Docker Compose لإدارة كل الخدمات: Next.js app + Caddy reverse proxy + Loki/Grafana للـ logs + Uptime Kuma للمراقبة.

التكلفة الشهرية المتوقعة: **~€18/شهر** (VPS + Backblaze B2 + Cloudflare).

---

## 📋 المتطلبات

| العنصر | التفاصيل | التكلفة |
|--------|---------|---------|
| **VPS** | Hetzner CX32 (4 vCPU, 8 GB, 80 GB NVMe) Falkenstein | €13/شهر |
| **DNS** | Cloudflare (مجاني) — wildcard A record | $0 |
| **Domain** | ostazna.com مسجّل | ~$15/سنة |
| **Backups** | Backblaze B2 (~5 GB) | ~$0.30/شهر |
| **Email** | Resend (3K emails مجاناً) | $0 |
| **Supabase** | Pro plan (موصى به للـ production) | $25/شهر |

---

## 🌍 إعداد DNS (Cloudflare)

### 1. أضف الدومين لـ Cloudflare

اتبع وثائق Cloudflare لـ delegation الـ name servers.

### 2. أضف DNS records

| Type | Name | Value | Proxy |
|------|------|------|-------|
| `A` | `@` | `<VPS_IP>` | 🟠 Proxied |
| `A` | `*` | `<VPS_IP>` | ⚫ DNS Only |
| `A` | `admin` | `<VPS_IP>` | 🟠 Proxied |

⚠️ الـ wildcard `*` يجب أن يكون **DNS Only** (Grey cloud) حتى يستطيع Caddy إصدار wildcard SSL عبر DNS-01 challenge.

### 3. أنشئ API Token لـ Caddy

Cloudflare → My Profile → API Tokens → Create Token:
- Permissions: `Zone → DNS → Edit`
- Zone Resources: `Include → Specific zone → ostazna.com`
- انسخ الـ Token → سيستخدم في `.env.production`

---

## 🖥️ إعداد VPS

### 1. توفير الـ VPS

```
Provider:  Hetzner Cloud
Type:      CX32 (4 vCPU, 8 GB RAM, 80 GB NVMe)
Location:  Falkenstein (DE) — أقرب للمستخدمين في مصر
OS:        Ubuntu 24.04 LTS minimal
SSH:       أضف مفتاحك العام أثناء الإنشاء
```

### 2. تأمين السيرفر

```bash
ssh root@<VPS_IP>

# 2.1 إنشاء مستخدم deploy
adduser deploy
usermod -aG sudo deploy
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys

# 2.2 تعطيل SSH للـ root
sed -i 's/^PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/^#PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart sshd

# 2.3 Firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 443/udp   # for HTTP/3
ufw enable

# 2.4 fail2ban
apt install -y fail2ban
systemctl enable --now fail2ban

# 2.5 Auto security updates
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

### 3. تثبيت Docker

```bash
# As deploy user
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker $USER
# تسجيل خروج ودخول لتطبيق المجموعة
```

### 4. استنساخ المشروع

```bash
sudo mkdir -p /opt/ostazna
sudo chown deploy:deploy /opt/ostazna
cd /opt/ostazna
git clone https://github.com/your-org/ostazna.git .

# نسخ الـ env
cp .env.example .env.production
nano .env.production           # املأ كل القيم
chmod 600 .env.production
```

---

## ⚙️ ملف `.env.production`

```env
# Public
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
NEXT_PUBLIC_SITE_URL=https://ostazna.com
NEXT_PUBLIC_ROOT_DOMAIN=ostazna.com
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BN...                 # for Web Push

# Server-only
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...                # NEVER expose
SUPABASE_DB_URL=postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:ops@ostazna.com

# Email (Resend)
RESEND_API_KEY=re_xxx
RESEND_FROM=Ostazna <hello@ostazna.com>

# OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Caddy DNS challenge
CF_API_TOKEN=...                                    # Cloudflare API token

# Backups
RESTIC_REPOSITORY=b2:ostazna-backups:/postgres
RESTIC_PASSWORD=<strong-random-password>
B2_ACCOUNT_ID=...
B2_ACCOUNT_KEY=...

# Edge Function cron
CRON_SECRET=<strong-random-string>

# Monitoring
GRAFANA_PASSWORD=<strong-password>
```

---

## 🐳 تشغيل الـ Stack

```bash
cd /opt/ostazna

# 1. بناء الـ images (custom Caddy + app)
docker compose build

# 2. تشغيل الكل
docker compose up -d

# 3. متابعة الـ logs
docker compose logs -f app
```

تأكد من تشغيل كل الـ services:

```bash
docker compose ps

# المتوقع:
# app          Up   3000/tcp
# caddy        Up   0.0.0.0:80, 0.0.0.0:443
# uptime-kuma  Up   3001/tcp
# loki         Up
# grafana      Up   3000/tcp
# promtail     Up
```

### 4. اختبار

```bash
# الـ apex domain
curl -I https://ostazna.com/

# admin
curl -I https://admin.ostazna.com/login

# subdomain (replace with real subdomain)
curl -I https://ahmed.ostazna.com/
```

---

## 🔐 Caddyfile

```
{
    email ops@ostazna.com
    on_demand_tls {
        ask http://app:3000/api/tls/check       # validate custom domains
    }
}

# Custom domain catch-all (on_demand_tls)
:443 {
    tls { on_demand }
    encode zstd gzip
    reverse_proxy app:3000
}

# Apex + wildcard via DNS-01
ostazna.com, *.ostazna.com {
    tls {
        dns cloudflare {env.CF_API_TOKEN}
    }

    encode zstd gzip
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Content-Type-Options "nosniff"
        Referrer-Policy "strict-origin-when-cross-origin"
        -Server
    }

    reverse_proxy app:3000

    log {
        output stdout
        format json
    }
}
```

---

## 📨 إعداد Resend (Email)

1. أنشئ حساب على [resend.com](https://resend.com)
2. أضف الدومين `ostazna.com` → ضع SPF/DKIM records في Cloudflare
3. انتظر التحقق (~10 دقائق)
4. أنشئ API Key → ضعه في `RESEND_API_KEY`

---

## 🔑 إعداد Web Push (VAPID)

```bash
npx web-push generate-vapid-keys
```

سيطبع:
```
Public Key: BN...
Private Key: ...
```

ضعهم في `.env.production`:
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BN...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:ops@ostazna.com
```

---

## ⏰ نشر Edge Function (Nightly Cron)

```bash
cd /opt/ostazna
npx supabase functions deploy nightly-tasks --project-ref xxx
npx supabase secrets set CRON_SECRET=<random-string> SUPABASE_SERVICE_ROLE_KEY=<key>

# في Supabase Dashboard → Edge Functions → Cron:
# Schedule: 0 2 * * * (يومياً 2 صباحاً UTC)
# Headers: Authorization: Bearer <CRON_SECRET>
```

---

## 💾 إعداد Backups

### 1. أنشئ Bucket على Backblaze B2

- أنشئ حساب على [backblaze.com](https://backblaze.com)
- أنشئ bucket: `ostazna-backups` (private)
- أنشئ Application Key بصلاحيات على هذا bucket فقط
- انسخ `keyId` و `applicationKey` → `B2_ACCOUNT_ID` و `B2_ACCOUNT_KEY`

### 2. تثبيت restic

```bash
sudo apt install -y restic
restic version       # تأكد من الإصدار

# تهيئة الـ repo (مرة واحدة)
export RESTIC_REPOSITORY=b2:ostazna-backups:/postgres
export RESTIC_PASSWORD=<password>
export B2_ACCOUNT_ID=...
export B2_ACCOUNT_KEY=...
restic init
```

### 3. جدولة النسخ

```bash
sudo crontab -e

# أضف:
0 3 * * * /opt/ostazna/scripts/backup.sh >> /var/log/ostazna-backup.log 2>&1
```

`scripts/backup.sh` ينفّذ:
- `pg_dump` للقاعدة كاملة
- يضغطها ويرفعها لـ B2 عبر restic
- يحتفظ بـ 7 daily / 4 weekly / 6 monthly

### 4. اختبار الاستعادة (ربع سنوي)

راجع [`runbooks/restore.md`](../docs/runbooks/restore.md) — إجراء الاستعادة + الـ smoke checks.

---

## 🚨 المراقبة

### Uptime Kuma

```
URL:     https://status.ostazna.com (إذا أضفت subdomain)
Default: http://localhost:3001 (داخل VPS)
```

أضف monitors لـ:
- `https://ostazna.com/api/health` كل 60 ثانية
- `https://admin.ostazna.com/login` كل 5 دقائق
- DB query (via custom HTTP)

### Grafana + Loki

```
URL:    http://localhost:3000 (port mapped or behind Caddy)
Login:  admin / $GRAFANA_PASSWORD
```

Promtail يجمع logs من Docker containers تلقائياً. Loki يخزّنهم. Grafana يعرضهم.

### Sentry (اختياري)

أضف لـ `.env.production`:
```
SENTRY_DSN=https://...
NEXT_PUBLIC_SENTRY_DSN=https://...
```

---

## 🚀 CI/CD (GitHub Actions)

`.github/workflows/deploy.yml` ينفّذ:

```yaml
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: cd /opt/ostazna && ./scripts/deploy.sh
```

`scripts/deploy.sh` على الـ VPS:
- `git pull` آخر التحديثات
- `docker compose build app`
- `docker compose up -d --no-deps --build app`
- ينتظر healthcheck

---

## 🔄 Rollback

لو deployment فشل:

```bash
cd /opt/ostazna
git log --oneline -10                  # شوف الـ commits
git checkout <previous-good-commit>
docker compose build app
docker compose up -d --no-deps --build app
```

أو استعادة DB إن لزم:

```bash
restic snapshots                       # احصل على snapshot id
restic restore <id> --target /tmp/restore
psql $SUPABASE_DB_URL < /tmp/restore/dump.sql
```

---

## ✅ Production Smoke Checklist

بعد كل deployment:

- [ ] `https://ostazna.com/` → 200
- [ ] `https://ostazna.com/login` → 200
- [ ] `https://ostazna.com/api/health` → 200 + valid JSON
- [ ] `https://admin.ostazna.com/login` → 200
- [ ] sample subdomain `<test>.ostazna.com` → 200
- [ ] إنشاء حساب جديد يعمل
- [ ] Login/logout flow
- [ ] Dashboard يحمّل بدون أخطاء
- [ ] Edge Function يعمل (تحقق من logs Supabase)
- [ ] Backup الليلة الفائتة موجود في B2

</div>
