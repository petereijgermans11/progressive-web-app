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
