const manifest = {
    'name': 'Progressive Selfies',
    'short_name': 'PWA Selfies',
    'icons': [
        {
            'src': 'src/images/icons/app-icon-48x48.png',
            'type': 'image/png',
            'sizes': '48x48'
        },
        {
            'src': 'src/images/icons/app-icon-96x96.png',
            'type': 'image/png',
            'sizes': '96x96'
        },
        {
            'src': 'src/images/icons/app-icon-144x144.png',
            'type': 'image/png',
            'sizes': '144x144'
        },
        {
            'src': 'src/images/icons/app-icon-192x192.png',
            'type': 'image/png',
            'sizes': '192x192'
        },
        {
            'src': 'src/images/icons/app-icon-256x256.png',
            'type': 'image/png',
            'sizes': '256x256'
        },
        {
            'src': 'src/images/icons/app-icon-384x384.png',
            'type': 'image/png',
            'sizes': '384x384'
        },
        {
            'src': 'src/images/icons/app-icon-512x512.png',
            'type': 'image/png',
            'sizes': '512x512'
        }
    ],
    //"start_url": "index.html",
    //"scope": ".",
    'display': 'standalone',
    'orientation': 'portrait-primary',
    'background_color': '#fff',
    'theme_color': '#3f51b5',
    'description': 'Take selfies PWA style.',
    'dir': 'ltr',
    'lang': 'en-US'
};
let deferredPrompt;
const enableNotificationsButtons = document.querySelectorAll('.enable-notifications');

window.addEventListener('load', () => {
    const base = document.querySelector('base');
    let baseUrl = base && base.href || '';

    if (!baseUrl.endsWith('/')) {
        baseUrl = `${baseUrl}/`;
    }

    manifest['start_url'] = `${baseUrl}index.html`;

    manifest.icons.forEach(icon => {
        icon.src = `${baseUrl}${icon.src}`;
    });

    const stringManifest = JSON.stringify(manifest);
    const blob = new Blob([stringManifest], {type: 'application/json'});
    const manifestURL = URL.createObjectURL(blob);
    document.querySelector('#manifestPlaceholder').setAttribute('href', manifestURL);

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register(`${baseUrl}sw.js`)
            .then(registration => {
                // Registration was successful
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(err => {
                // registration failed :(
                console.log('ServiceWorker registration failed: ', err);
            });
    }
});

window.addEventListener('beforeinstallprompt', event => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    event.preventDefault();

    console.log('beforeinstallprompt fired');

    // Stash the event so it can be triggered later.
    deferredPrompt = event;

    return false;
});

const displayConfirmNotification = () => {
    if ('serviceWorker' in navigator) {
        const options = {
            body: 'You successfully subscribed to our Notification service!',
            icon: 'src/images/icons/app-icon-96x96.png',
            image: 'src/images/main-image-sm.jpg',
            dir: 'ltr',
            lang: 'en-US', // BCP 47,
            vibrate: [100, 50, 200],
            badge: 'src/images/icons/app-icon-96x96.png',
            tag: 'confirm-notification',
            renotify: true,
            actions: [
                {
                    action: 'confirm',
                    title: 'Okay',
                    icon: 'src/images/icons/app-icon-96x96.png'
                },
                {
                    action: 'cancel',
                    title: 'Cancel',
                    icon: 'src/images/icons/app-icon-96x96.png'
                }
            ]
        };

        navigator.serviceWorker.ready
            .then(sw => sw.showNotification('Successfully subscribed (from SW)!', options));
    }
};

const configurePushSubscription = () => {
    if ('serviceWorker' in navigator) {
        let serviceWorkerRegistration;
        navigator.serviceWorker.ready
            .then(registration => {
                serviceWorkerRegistration = registration;
                return registration.pushManager.getSubscription();
            })
            .then(subscription => {
                if (subscription === null) {
                    // Create a new subscription
                    return serviceWorkerRegistration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(
                            'BGMYWA_g_tpLeOXlR4oykccGE00remgS_-2PrH2WjgWrg93lPDsjnJ0pDKmuGaAfbzuOtvkUWK-CivusHQdL0BE'
                        )
                    });
                }
            })
            .then(pushSubscription => {
                return fetch(`${SERVER_URL}/subscriptions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(pushSubscription)
                });
            })
            .then(response => {
                if (response.ok) {
                    displayConfirmNotification();
                }
            })
            .catch(error => console.log(error));
    }
};

const unsubscribe = () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
            .then(serviceWorkerRegistration => {
                return serviceWorkerRegistration.pushManager.getSubscription();
            })
            .then(subscription => {
                if (!subscription) {
                    console.log("Not subscribed, nothing to do.");
                    return;
                }
                return subscription.unsubscribe();
            })
            .then(() => console.log("Successfully unsubscribed!."))
            .catch(error => console.error('Error thrown while unsubscribing from push messaging', error));
    }
};

const askForNotificationPermission = () => {
    Notification.requestPermission(result => {
        console.log('User Choice', result);
        if (result !== 'granted') {
            console.log('No notification permission granted!');
        } else {
            console.log('Notification permission granted!');
            // displayConfirmNotification();
            configurePushSubscription();
        }
    });
};

if ('Notification' in window) {
    for (let i = 0; i < enableNotificationsButtons.length; i++) {
        enableNotificationsButtons[i].style.display = 'inline-block';
        enableNotificationsButtons[i].addEventListener('click', askForNotificationPermission);
    }
}
