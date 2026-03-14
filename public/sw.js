const CACHE_NAME = "coreinventory-v1";
const STATIC_ASSETS = [
  "/",
  "/dashboard",
  "/offline",
  "/manifest.json",
  "/favicon.ico"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip chrome-extension and other non-http schemes
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  // Handle API requests
  if (url.pathname.startsWith("/api/")) {
    if (request.method === "GET") {
      // Cache-First for GET API requests
      event.respondWith(
        caches.match(request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return fetch(request).then((response) => {
            if (response.ok) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          });
        })
      );
    } else if (["POST", "PATCH", "DELETE"].includes(request.method)) {
      // Intercept mutations when offline
      if (!navigator.onLine) {
        event.respondWith(
          (async () => {
            try {
              const body = await request.clone().text();
              const headers = {};
              request.headers.forEach((value, key) => {
                headers[key] = value;
              });

              // Post message to client to queue the operation
              const clients = await self.clients.matchAll();
              clients.forEach((client) => {
                client.postMessage({
                  type: "QUEUE_OPERATION",
                  payload: {
                    method: request.method,
                    url: request.url,
                    body,
                    headers,
                    timestamp: Date.now()
                  }
                });
              });

              return new Response(
                JSON.stringify({
                  queued: true,
                  message: "You are offline. Operation queued for sync."
                }),
                {
                  status: 202,
                  headers: { "Content-Type": "application/json" }
                }
              );
            } catch (err) {
              return fetch(request);
            }
          })()
        );
      }
    }
  } else {
    // Stale-While-Revalidate for static assets
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
          if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        });
        return cachedResponse || fetchPromise;
      })
    );
  }
});
