const cachePrefix = "nextround-shell-";
const cacheName = `${cachePrefix}v30-20261021-selection-performance`;
const appShell = ["./", "./index.html", "./theme-init.js?v=2.8.2", "./styles.css?v=2.8.2", "./notification-config.js?v=2.8.2", "./app.js?v=2.8.2", "./notion-import.js?v=2.8.2", "./notifications.js?v=2.8.2", "./inbox.js?v=2.8.2", "./ai-review.js?v=2.8.2", "./fit.js?v=2.8.2", "./refresh.js?v=2.8.2", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(appShell)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(key => key.startsWith(cachePrefix) && key !== cacheName)
        .map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          const copy = response.clone();
          event.waitUntil(caches.open(cacheName).then(cache => cache.put(request, copy)));
        }
        return response;
      })
      .catch(() => caches.match(request).then(cached => cached || caches.match("./index.html")))
  );
});

self.addEventListener("push", event => {
  let payload = {};
  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload = { body: event.data.text() };
    }
  }
  event.waitUntil(self.registration.showNotification(payload.title || "NEXTROUND", {
    body: payload.body || "締切・予定を確認してください。",
    icon: "./icon-192.png",
    badge: "./icon-192.png",
    tag: payload.tag || "nextround-reminder",
    renotify: false,
    timestamp: Number(payload.timestamp) || Date.now(),
    data: { url: payload.url || "./" }
  }));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil((async () => {
    const scope = self.registration.scope;
    let target = new URL(scope);
    try {
      const requested = new URL(event.notification.data?.url || scope, scope);
      if (requested.origin === self.location.origin && requested.href.startsWith(scope)) target = requested;
    } catch {}
    const windows = await self.clients.matchAll({ type: "window" });
    const existing = windows.find(client => {
      const clientUrl = new URL(client.url);
      return clientUrl.origin === target.origin && clientUrl.href.startsWith(scope);
    });
    if (existing) {
      await existing.navigate?.(target.href);
      return existing.focus();
    }
    return self.clients.openWindow(target.href);
  })());
});
