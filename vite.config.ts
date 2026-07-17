// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { Plugin } from "vite";

// Self-destruct service worker. Replaces the previous vite-plugin-pwa build,
// which was serving stale HTML/JS and hiding the app. Any browser that had
// the old SW installed will fetch this new /sw.js, activate it, unregister
// itself, and wipe all caches — restoring access to the live site.
const selfDestructSw = (): Plugin => {
  const code = `self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    } catch (_) {}
    try { await self.registration.unregister(); } catch (_) {}
    try {
      const clients = await self.clients.matchAll({ type: 'window' });
      for (const c of clients) { try { c.navigate(c.url); } catch (_) {} }
    } catch (_) {}
  })());
});
`;
  return {
    name: "self-destruct-sw",
    apply: "build",
    generateBundle() {
      this.emitFile({ type: "asset", fileName: "sw.js", source: code });
    },
  };
};

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [selfDestructSw()],
  },
});

