/**
 * FinTrack - Service Worker
 * Progressive Web App & Offline Capabilities
 */

const CACHE_NAME = "fintrack-v1";

const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./index.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon.svg"
];

// 1. Install Event: Pre-cache core application shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// 2. Activate Event: Clean up stale caches & claim clients immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Stale-While-Revalidate with offline fallback
self.addEventListener("fetch", (event) => {
  // Only handle standard HTTP/HTTPS GET requests
  if (event.request.method !== "GET") return;

  // Skip browser extensions or non-http requests
  if (!event.request.url.startsWith("http")) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Fetch fresh version in background and refresh cache
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            (networkResponse.type === "basic" || networkResponse.type === "cors")
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline and request is a navigation request, fallback to cached index.html
          if (event.request.mode === "navigate") {
            return caches.match("./index.html");
          }
        });

      // Serve from cache immediately if present (instant load), or await network
      return cachedResponse || fetchPromise;
    })
  );
});
