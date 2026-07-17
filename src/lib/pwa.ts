// PWA kill switch: unregister any previously-installed service worker and
// clear its caches so users stuck on a stale cached build recover on next load.

export function registerPwa() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  const cleanup = async () => {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister().catch(() => {})));
    } catch {
      /* noop */
    }
    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k).catch(() => false)));
      }
    } catch {
      /* noop */
    }
  };

  void cleanup();
}

