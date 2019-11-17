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
    "revision": "48e487bf2c2346fdb054c5e1e7459d2a"
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
    "revision": "078758ce0ac18d3ff6180aa4844244ab"
  },
  {
    "url": "src/css/feed.css",
    "revision": "10167930de1d512329f5ec9eccd03dd9"
  },
  {
    "url": "src/css/help.css",
    "revision": "81922f16d60bd845fd801a889e6acbd7"
  },
  {
    "url": "src/js/app.js",
    "revision": "092c9bfab7feb9a3e23554a7a3a715fe"
  },
  {
    "url": "src/js/feed.js",
    "revision": "41b7ab94de47fa88cda9c12cf21197f3"
  },
  {
    "url": "src/js/utility.js",
    "revision": "b3c5fe563ec484b3443242e368011d9f"
  },
  {
    "url": "src/lib/idb.js",
    "revision": "7d6f6a38f24b0f9aabf756f7736b1e36"
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

self.addEventListener('notificationclick', event => {
    const notification = event.notification;
    const action = event.action;

    console.log(notification);

    if (action === 'confirm') {
        console.log('Confirm was chosen');
        notification.close();
    } else {
        event.waitUntil(
            self.clients.matchAll()
                .then(clients => {
                    let visibleClient = clients.find(client => client.visibilityState === 'visible');

                    if (visibleClient && 'navigate' in visibleClient) {
                        visibleClient.navigate(notification.data.url);
                        visibleClient.focus();
                    } else {
                        self.clients.openWindow(`fe-guild-2019-pwa/${notification.data.url}`);
                    }
                    notification.close();
                })
        );
        console.log(action);
        notification.close();
    }
});

self.addEventListener('notificationclose', event => console.log('Notification was closed', event));

self.addEventListener('push', event => {
    console.log('Push Notification received', event);

    let data = {title: 'New!', content: 'Something new happened!', openUrl: '/'};

    if (event.data) {
        data = JSON.parse(event.data.text());
    }

    const options = {
        body: data.content,
        image: data.imageUrl,
        icon: 'src/images/icons/app-icon-96x96.png',
        badge: 'src/images/icons/app-icon-96x96.png',
        data: {
            url: data.openUrl
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});
