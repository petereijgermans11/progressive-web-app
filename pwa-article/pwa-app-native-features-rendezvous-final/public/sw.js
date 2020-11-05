importScripts('src/lib/idb.js');
importScripts('src/js/utility.js'); 

self.addEventListener('install', event => {
  console.log('[Service Worker] Installing Service Worker ...', event);
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating Service Worker ...', event);
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  console.log('[Service Worker] Fetching something ....', event);

  event.respondWith(
    
      caches.match(event.request)
          .then(response => {
              if (response) {
                console.log('fetch request from CACHE: ', event.request);
                  console.log('fetch response from CACHE: ', response);
                  return response;
              }

              return fetch(event.request);
          })
  );
});
 
const CACHE_STATIC_NAME = 'static';
const URLS_TO_PRECACHE = [
    '/',
    'index.html',
    'src/js/app.js',
    'src/js/facedetection.js',
    'src/js/feed.js',
    'src/js/languages.js',
    'src/js/speech.js',
    'src/js/utility.js',
  
    'src/lib/face-api.min.js',
    'src/lib/idb.js',
    'src/lib/material.min.js',    
    
    'src/css/app.css',
    'src/css/facedetection.css',
    'src/css/feed.css',
    'src/css/help.css',
    'src/css/speech.css',
    
    'src/images/main-image-lg.jpg',
    'src/images/main-image-sm.jpg',
    'src/images/main-image.jpg',
    'src/images/mic-animate.gif',
    'src/images/mic-slash.gif',
    'src/images/mic.gif',

    'src/models/age_gender_model-shard1',
    'src/models/age_gender_model-weights_manifest.json',
    'src/models/face_expression_model-shard1',
    'src/models/face_expression_model-weights_manifest.json',
    'src/models/face_landmark_68_model-shard1',
    'src/models/face_landmark_68_model-weights_manifest.json',
    'src/models/face_landmark_68_tiny_model-shard1',
    'src/models/face_landmark_68_tiny_model-weights_manifest.json',
    'src/models/face_recognition_model-shard1',
    'src/models/face_recognition_model-shard2',
    'src/models/face_recognition_model-weights_manifest.json',
    'src/models/tiny_face_detector_model-shard1',
    'src/models/tiny_face_detector_model-weights_manifest.json',
    
    'https://fonts.googleapis.com/css?family=Roboto:400,700',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
];

self.addEventListener('install', event => {
    console.log('[Service Worker] Installing Service Worker ...', event);
    event.waitUntil(
        caches.open(CACHE_STATIC_NAME)
            .then(cache => {
                console.log('[Service Worker] Precaching App Shell');
                cache.addAll(URLS_TO_PRECACHE);
            })
            .then(() => {
                console.log('[ServiceWorker] Skip waiting on install');
                return self.skipWaiting();
            })
    );
});

addEventListener('backgroundfetchsuccess', event => {
  console.log('[Service Worker]: Background Fetch Success', event.registration);
  event.waitUntil(
    (async function() {
      try {
        // Iterating the records to populate the cache
        const cache = await caches.open(event.registration.id);
        const records = await event.registration.matchAll();
        const promises = records.map(async record => {
          const response = await record.responseReady;
          await cache.put(record.request, response);
        });
        await Promise.all(promises);
      } catch (err) {
        console.log('[Service Worker]: Caching error');
      }
    })()
  );
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

self.addEventListener('push', event => {
  console.log('Push Notification received!!! YES', event);
});
