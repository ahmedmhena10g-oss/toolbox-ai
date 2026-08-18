# Run Doc — ToolBox AI

## How to reproduce artifacts
- No special env files needed — everything runs client-side
- `npm install` to install dependencies

## How to run the server
```bash
npm run dev
```
Default port: 3000 (auto-assigned if busy)

## Current instance
- **URL**: http://localhost:55838
- **PID**: 12036
- **Locales**: /en (English, default), /ar (Arabic, RTL)
- **Server started**: via PowerShell Start-Process detached

## Key routes
- `/en` — English homepage
- `/ar` — Arabic homepage (RTL)
- `/en/tools` — All tools directory
- `/ar/tools` — Arabic tools directory
- `/en/tools/[slug]` — Individual tool pages
- `/ar/tools/[slug]` — Arabic tool pages
- `/sitemap.xml` — Sitemap with both locales + hreflang
- `/admin` — Admin dashboard

## Architecture
- Next.js 15 App Router with `[locale]` dynamic segment
- Middleware routes `/` → `/en` and `/ar/*` through locale validation
- 55 tools across 8 categories, all client-side processing
- Full Arabic translation via `src/lib/ar-content.ts` + extra modules
- RTL support via CSS `dir="rtl"` + Tailwind RTL utilities
- Language switcher in header
