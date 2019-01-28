importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.5.0/workbox-sw.js');
importScripts('src/lib/idb.js');
importScripts('src/js/utility.js');

if (workbox) {
    console.log(`Yay! Workbox is loaded 🎉`);

    workbox.precaching.precacheAndRoute([
  {
    "url": "favicon.ico",
    "revision": "0251fdb59b82f5f8f448fca84e94f357"
  },
  {
    "url": "index.html",
    "revision": "e1bba6b63555bbdec61436000024d72a"
  },
  {
    "url": "manifest.json",
    "revision": "839abadb6c74e82a34ae5cac52bc697c"
  },
  {
    "url": "offline.html",
    "revision": "7a2ff0fc24a0a6b1a125c98a3664a5ac"
  },
  {
    "url": "src/css/app.css",
    "revision": "574e324013279b516504023455b26b32"
  },
  {
    "url": "src/css/feed.css",
    "revision": "9a683ea9c6fb0e77e78db33c51b987f7"
  },
  {
    "url": "src/css/help.css",
    "revision": "81922f16d60bd845fd801a889e6acbd7"
  },
  {
    "url": "src/js/app.js",
    "revision": "7c2fe4be27096194a1c1243b675891e5"
  },
  {
    "url": "src/js/feed.js",
    "revision": "6de46fccf2293789ec8281549abb448f"
  },
  {
    "url": "src/js/utility.js",
    "revision": "e136e618f44bbbc509e9e837cbe3be35"
  },
  {
    "url": "src/lib/idb.js",
    "revision": "e0cc55c458ad9e2803ff7605286577c0"
  },
  {
    "url": "src/lib/material.indigo-deep_orange.min.css",
    "revision": "1b5a4a3c84a73a3a53654e9dd3ef70c0"
  },
  {
    "url": "src/lib/material.min.js",
    "revision": "e68511951f1285c5cbf4aa510e8a2faf"
  },
  {
    "url": "src/images/main-image-lg.jpg",
    "revision": "05b87e478ce30957f4e2f00b5c18f80a"
  },
  {
    "url": "src/images/main-image-sm.jpg",
    "revision": "6172dffd0848144bbc3f7504d8585058"
  },
  {
    "url": "src/images/main-image.jpg",
    "revision": "489ce4c1c7ebc7545aa528cea56e50c1"
  }
]);

    workbox.routing.registerRoute(
        /.*(?:googleapis|gstatic)\.com.*$/,
        workbox.strategies.staleWhileRevalidate({
            cacheName: 'google-fonts',
            plugins: [
                new workbox.expiration.Plugin({
                    maxEntries: 50,
                    maxAgeSeconds: 30 * 24 * 60 * 60 // 30 Days
                })
            ]
        }));

    // Cache the Google Fonts stylesheets with a stale-while-revalidate strategy.
    // workbox.routing.registerRoute(
    //     /^https:\/\/fonts\.googleapis\.com/,
    //     workbox.strategies.staleWhileRevalidate({
    //         cacheName: 'google-fonts-stylesheets',
    //     })
    // );

    // Cache the underlying font files with a cache-first strategy for 1 year.
    // workbox.routing.registerRoute(
    //     /^https:\/\/fonts\.gstatic\.com/,
    //     workbox.strategies.cacheFirst({
    //         cacheName: 'google-fonts-webfonts',
    //         plugins: [
    //             new workbox.cacheableResponse.Plugin({
    //                 statuses: [0, 200],
    //             }),
    //             new workbox.expiration.Plugin({
    //                 maxAgeSeconds: 60 * 60 * 24 * 365,
    //                 maxEntries: 30,
    //             }),
    //         ],
    //     })
    // );

    workbox.routing.registerRoute(
        new RegExp('/images/icons/*/'),
        workbox.strategies.staleWhileRevalidate({
            cacheName: 'icons-cache',
            plugins: [
                new workbox.expiration.Plugin({
                    maxEntries: 5,
                    maxAgeSeconds: 30 * 24 * 60 * 60 // 30 Days
                })
            ]
        }));

    workbox.routing.registerRoute(
        new RegExp('/images/splashscreens/*/'),
        workbox.strategies.staleWhileRevalidate({
            cacheName: 'splashscreens-cache',
            plugins: [
                new workbox.expiration.Plugin({
                    maxEntries: 1,
                    maxAgeSeconds: 30 * 24 * 60 * 60 // 30 Days
                })
            ]
        }));

    workbox.routing.registerRoute(
        new RegExp(`${SERVER_URL}/(images|dummy)/*`),
        workbox.strategies.staleWhileRevalidate({
            cacheName: 'selfie-images'
        }));

    workbox.routing.registerRoute(API_URL, args => {
        return fetch(args.event.request)
            .then(response => {
                const clonedResponse = response.clone();
                clearAllData('selfies')
                    .then(() => clonedResponse.json())
                    .then(selfies => {
                        for (const selfie in selfies) {
                            writeData('selfies', selfies[selfie]);
                        }
                    });
                return response;
            });
    });

    self.addEventListener('sync', event => {
        console.log('[Service Worker] Background syncing', event);
        if (event.tag === 'sync-new-selfies') {
            console.log('[Service Worker] Syncing new Posts');
            event.waitUntil(
                readAllData('sync-selfies')
                    .then(syncSelfies => {
                        for (const syncSelfie of syncSelfies) {
                            const postData = new FormData();
                            postData.append('id', syncSelfie.id);
                            postData.append('title', syncSelfie.title);
                            postData.append('location', syncSelfie.location);
                            postData.append('selfie', syncSelfie.selfie);

                            fetch(API_URL, {method: 'POST', body: postData})
                                .then(response => {
                                    console.log('Sent data', response);
                                    if (response.ok) {
                                        response.json()
                                            .then(resData => {
                                                deleteItemFromData('sync-selfies', parseInt(resData.id));
                                            });
                                    }
                                })
                                .catch(error => console.log('Error while sending data', error));
                        }
                    })
            );
        }
    });

    workbox.routing.registerRoute(
        routeData => routeData.event.request.headers.get('accept').includes('text/html'),
        args => {
            return caches.match(args.event.request)
                .then(response => {
                    if (response) {
                        console.log(response);
                        return response;
                    }

                    // Clone the request - a request is a stream and can be only consumed once
                    const requestToCache = args.event.request.clone();

                    // Try to make the original HTTP request as intended
                    return fetch(requestToCache)
                        .then(response => {
                            // If request fails or server responds with an error code, return that error immediately
                            if (!response || response.status !== 200) {
                                return response;
                            }

                            // Again clone the response because you need to add it into the cache and because it's used
                            // for the final return response
                            const responseToCache = response.clone();

                            caches.open('dynamic')
                                .then(cache => {
                                    cache.put(requestToCache, responseToCache);
                                });

                            return response;
                        });
                })
                .catch(error => {
                    return caches.match('/fe-guild-2019-pwa/offline.html');
                });
        }
    );

} else {
    console.log(`Boo! Workbox didn't load 😬`);
}
