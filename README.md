# FaceMetrics AI

Premium Mobile-First PWA fuer Gesichtsanalyse.

## Lokal

```bash
npm install
npm start
```

## PWA Build & Deploy (Vercel)

```bash
npm run build:web
```

\ercel.json\ leitet alle Routen auf \/\ (SPA) um – kein 404 bei Refresh oder Home-Screen.

Enthalten:
- \public/manifest.json\ (start_url: \/\, standalone)
- Service Worker \public/sw.js\
- Icons 192 / 512 / Apple Touch / maskable
- Splash Screen + Theme Color \#07080A\
- \iewport-fit=cover\ fuer iPhone Safe Area

## Hinweis

Alle Scores sind KI-Schaetzungen. Keine objektive Schoenheit. Keine medizinischen Versprechen.
