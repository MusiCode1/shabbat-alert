# ⚡ Shabbat Alert - מערכת התראות RedAlert

מערכת תצוגה real-time להתראות פיקוד העורף, מבוססת API של [redalert.orielhaim.com](https://redalert.orielhaim.com).

## ארכיטקטורה

```
Browser ──WebSocket──▶ Cloudflare Worker (Durable Object)
                              │
                              └──Socket.IO──▶ redalert.orielhaim.com
```

- **`apps/web/`** — SvelteKit → Cloudflare Pages
- **`worker/`** — Cloudflare Worker + Durable Object (מחזיק חיבור Socket.IO יחיד)

## התקנה

```bash
bun install
```

## פיתוח מקומי

```bash
# Frontend בלבד (מתחבר לטסט-סרבר ישירות)
bun dev

# Worker
cd worker && bunx wrangler dev
```

## פריסה

### 1. פרוס את ה-Worker קודם

```bash
cd worker
bunx wrangler deploy
```

שמור את ה-URL שמתקבל: `https://shabbat-alert-worker.<subdomain>.workers.dev`

אם יש לך API key:
```bash
bunx wrangler secret put REDALERT_API_KEY
```

### 2. עדכן את ה-WebSocket URL

ב-`apps/web/.env.local`:
```env
VITE_WORKER_WS_URL=wss://shabbat-alert-worker.<subdomain>.workers.dev/ws
```

### 3. פרוס את ה-Frontend

```bash
cd apps/web
bun run build
bunx wrangler pages deploy .svelte-kit/cloudflare --project-name shabbat-alert-web
```

## מבנה הפרויקט

```
shabbat-alert/
├── apps/web/
│   └── src/
│       ├── routes/
│       │   ├── +page.svelte          # תצוגה ראשית
│       │   └── settings/+page.svelte # בחירת עיר
│       └── lib/
│           ├── components/
│           │   ├── StatusPanel.svelte   # לוח הסטטוס הראשי
│           │   ├── AlertList.svelte     # היסטוריית התראות
│           │   ├── Clock.svelte         # שעון
│           │   ├── ShelterTimer.svelte  # ספירה לאחור 90s
│           │   └── ConnectionBadge.svelte
│           ├── stores/alertStore.ts    # State Machine
│           └── types.ts
└── worker/
    └── src/
        ├── index.ts        # Worker entry
        └── AlertRelay.ts   # Durable Object
```

## מצבי State Machine

```
IDLE → ALERT (כנסו לממ"ד) → [90 שניות] → SHELTER (שהו בממ"ד) → ALL_CLEAR → IDLE
```
