/**
 * Post-processes dist/index.html after `expo export -p web`
 * so the SPA has full PWA meta, splash, and service worker registration.
 * (Expo's +html.tsx is not always applied for web.output: "single".)
 */
const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, '..', 'dist');
const indexPath = path.join(dist, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('inject-pwa-html: dist/index.html not found. Run expo export first.');
  process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf8');

const headInject = `
    <meta name="theme-color" content="#07080A" />
    <meta name="color-scheme" content="dark" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="application-name" content="FaceMetrics AI" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="FaceMetrics" />
    <meta name="description" content="Premium Gesichtsanalyse für Symmetrie, Proportionen und Landmarken." />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover, shrink-to-fit=no" />
    <link rel="manifest" href="/manifest.json" />
    <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32.png" />
    <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
    <link rel="shortcut icon" href="/favicon.ico" />
    <style id="pwa-shell">
      html, body, #root { background-color: #07080A !important; color: #F4F5F7; }
      #pwa-splash {
        position: fixed; inset: 0; z-index: 99999;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        background: #07080A; transition: opacity .35s ease;
      }
      #pwa-splash.hide { opacity: 0; pointer-events: none; }
      #pwa-splash img { width: 96px; height: 96px; border-radius: 22px; }
      #pwa-splash .label {
        margin-top: 18px; font-size: 13px; letter-spacing: 2px;
        font-weight: 700; color: #5EEAD4;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
    </style>
`;

const bodyInject = `
    <div id="pwa-splash" aria-hidden="true">
      <img src="/icons/icon-192.png" alt="" width="96" height="96" />
      <div class="label">FACEMETRICS AI</div>
    </div>
    <script>
      (function () {
        function hideSplash() {
          var el = document.getElementById('pwa-splash');
          if (!el) return;
          el.classList.add('hide');
          setTimeout(function () { el && el.remove(); }, 400);
        }
        window.addEventListener('load', function () { setTimeout(hideSplash, 450); });
        setTimeout(hideSplash, 2500);
        if ('serviceWorker' in navigator) {
          window.addEventListener('load', function () {
            navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(function () {});
          });
        }
      })();
    </script>
`;

// Normalize viewport: replace existing viewport meta if present
html = html.replace(
  /<meta[^>]*name=["']viewport["'][^>]*>/i,
  ''
);

// Remove duplicate theme-color / description from expo defaults (we re-inject)
html = html.replace(/<meta[^>]*name=["']theme-color["'][^>]*>/gi, '');
html = html.replace(/<meta[^>]*name=["']description["'][^>]*>/gi, '');

if (!html.includes('rel="manifest"')) {
  html = html.replace(/<\/head>/i, `${headInject}\n  </head>`);
}

if (!html.includes('id="pwa-splash"')) {
  html = html.replace(/<div id="root"><\/div>/i, `<div id="root"></div>\n${bodyInject}`);
}

// Ensure lang
html = html.replace(/<html[^>]*>/i, '<html lang="de">');

fs.writeFileSync(indexPath, html, 'utf8');

// Ensure 404.html / fallback for hosts that need it
fs.writeFileSync(path.join(dist, '404.html'), html, 'utf8');

console.log('inject-pwa-html: patched dist/index.html + dist/404.html');
