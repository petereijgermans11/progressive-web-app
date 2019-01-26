if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/fe-guild-2019-pwa/public/sw.js')
            .then( registration => {
            // Registration was successful
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch(err => {
            // registration failed :(
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}
