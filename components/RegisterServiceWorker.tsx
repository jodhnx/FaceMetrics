import { useEffect } from 'react';
import { Platform } from 'react-native';

/** Registers the PWA service worker on web. */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        // Check for updates periodically
        setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
      } catch {
        // Ignore SW registration failures (e.g. insecure origin in local LAN)
      }
    };

    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register);
  }, []);

  return null;
}
