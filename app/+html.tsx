import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * Root HTML for Expo web (SPA / PWA).
 * Runs at build time in Node – no browser APIs.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="de">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover, shrink-to-fit=no"
        />
        <title>FaceMetrics AI</title>
        <meta
          name="description"
          content="Premium Gesichtsanalyse für Symmetrie, Proportionen und Landmarken."
        />
        <meta name="theme-color" content="#07080A" />
        <meta name="color-scheme" content="dark" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="FaceMetrics AI" />

        {/* iOS PWA */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="FaceMetrics" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />

        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
        <link rel="shortcut icon" href="/favicon.ico" />

        <ScrollViewStyleReset />

        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body, #root {
                height: 100%;
                width: 100%;
                margin: 0;
                padding: 0;
                background-color: #07080A;
                color: #F4F5F7;
                overscroll-behavior: none;
                -webkit-tap-highlight-color: transparent;
                -webkit-text-size-adjust: 100%;
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              }
              #pwa-splash {
                position: fixed;
                inset: 0;
                z-index: 99999;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: #07080A;
                transition: opacity 0.35s ease;
              }
              #pwa-splash.hide {
                opacity: 0;
                pointer-events: none;
              }
              #pwa-splash img {
                width: 96px;
                height: 96px;
                border-radius: 22px;
              }
              #pwa-splash .label {
                margin-top: 18px;
                font-size: 13px;
                letter-spacing: 2px;
                font-weight: 700;
                color: #5EEAD4;
              }
            `,
          }}
        />
      </head>
      <body>
        <div id="pwa-splash" aria-hidden="true">
          <img src="/icons/icon-192.png" alt="" width={96} height={96} />
          <div className="label">FACEMETRICS AI</div>
        </div>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                function hideSplash() {
                  var el = document.getElementById('pwa-splash');
                  if (!el) return;
                  el.classList.add('hide');
                  setTimeout(function () { el.remove(); }, 400);
                }
                if (document.readyState === 'complete') {
                  setTimeout(hideSplash, 400);
                } else {
                  window.addEventListener('load', function () { setTimeout(hideSplash, 400); });
                }
                setTimeout(hideSplash, 2500);

                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function () {
                    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(function () {});
                  });
                }
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
