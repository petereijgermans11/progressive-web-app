 
window.addEventListener('load', () => {
  const base = document.querySelector('base');
  let baseUrl = base && base.href || '';
  if (!baseUrl.endsWith('/')) {
        baseUrl = `${baseUrl}/`;
  }


 if ('serviceWorker' in navigator) {
     navigator.serviceWorker.register(`${baseUrl}sw.js`)
         .then( registration => {
         // Registration was successful
         console.log('ServiceWorker registration successful with scope: ', registration.scope);
     })
     .catch(err => {
         // registration failed :(
         console.log('ServiceWorker registration failed: ', err);
     });
 }

 bgFetchButton = document.querySelector('#bgFetchButton');
 bgFetchButton.addEventListener('click', async event => {
    try {
     const registration = await navigator.serviceWorker.ready;
     registration.backgroundFetch.fetch('my-fetch',  [new Request(`${baseUrl}src/images/main-image-lg.jpg`)]);
   } catch (err) {
     console.error(err);
   }
 });


});
