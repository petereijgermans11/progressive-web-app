importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.5.0/workbox-sw.js');

if (workbox) {
    console.log(`Yay! Workbox is loaded 🎉`);

    workbox.precaching.precacheAndRoute([]);

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
