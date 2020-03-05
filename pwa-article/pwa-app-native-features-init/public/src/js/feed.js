const shareImageButton = document.querySelector('#share-image-button');
const createPostArea = document.querySelector('#create-post');
const closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
const form = document.querySelector('form');
const titleInput = document.querySelector('#title');
const locationInput = document.querySelector('#location');
const sharedMomentsArea = document.querySelector('#shared-moments');
const videoPlayer = document.querySelector('#player');
const canvasElement = document.querySelector('#canvas');
const captureButton = document.querySelector('#capture-btn');
const locationButton = document.querySelector('#location-btn');
const locationLoader = document.querySelector('#location-loader');
let fetchedLocation = {lat: 0, lng: 0};
let picture;
let deferredPrompt;

 
const initializeLocation = () => {
  if (!('geolocation' in navigator)) {
      locationButton.style.display = 'none';
  }
};

const initializeMedia = () => {
  if (!('mediaDevices' in navigator)) {
      navigator.mediaDevices = {};
  }

  if (!('getUserMedia' in navigator.mediaDevices)) {
      navigator.mediaDevices.getUserMedia = (constraints) => {
          const getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

          if (!getUserMedia) {
              return Promise.reject(new Error('getUserMedia is not implemented!'));
          }

          return new Promise((resolve, reject) => getUserMedia.call(navigator, constraints, resolve, reject));
      };
  }

  navigator.mediaDevices.getUserMedia({video: {facingMode: 'user'}, audio: false})
      .then(stream => {
          videoPlayer.srcObject = stream;
          videoPlayer.style.display = 'block';
          videoPlayer.setAttribute('autoplay', '');
          videoPlayer.setAttribute('muted', '');
          videoPlayer.setAttribute('playsinline', '');
      })
      .catch(error => {
          console.log(error);
      });
};


const openCreatePostModal = () => {
  setTimeout(() => createPostArea.style.transform = 'translateY(0)', 1);
  initializeMedia();
  initializeLocation();

  if (deferredPrompt) {
      deferredPrompt.prompt();

      // Determine the user's choice - returned as a Promise
      deferredPrompt.userChoice.then(result => {
          console.log(result.outcome);

          // Based on the user's choice, decide how to proceed
          if (result.outcome === 'dismissed') {
              // Send to analytics
              console.log('User cancelled installation');
          } else {
              // Send to analytics
              console.log('User added to home screen');
          }
      });

      deferredPrompt = null;
  }
};


const closeCreatePostModal = () => {
  //imagePickerArea.style.display = 'none';
  videoPlayer.style.display = 'none';
  canvasElement.style.display = 'none';
  captureButton.style.display = 'inline';
  locationButton.style.display = 'inline';
  locationLoader.style.display = 'none';
  if (videoPlayer.srcObject) {
      videoPlayer.srcObject.getVideoTracks().forEach(track => track.stop());
  }
  setTimeout(() => createPostArea.style.transform = 'translateY(100vh)', 1);
};


shareImageButton.addEventListener('click', openCreatePostModal);


closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);


captureButton.addEventListener('click', event => {
   canvasElement.style.display = 'block';
   videoPlayer.style.display = 'none';
   captureButton.style.display = 'none';
   const context = canvasElement.getContext('2d');
   context.drawImage(
       videoPlayer, 0, 0, canvasElement.width, videoPlayer.videoHeight / (videoPlayer.videoWidth / canvasElement.width)
   );
   videoPlayer.srcObject.getVideoTracks().forEach(track => track.stop());
   picture = dataURItoBlob(canvasElement.toDataURL());
});

locationButton.addEventListener('click', event => {
  if (!('geolocation' in navigator)) {
      return;
  }
  let sawAlert = false;

  locationButton.style.display = 'none';
  locationLoader.style.display = 'block';

  navigator.geolocation.getCurrentPosition(position => {
      locationButton.style.display = 'inline';
      locationLoader.style.display = 'none';
      fetchedLocation = {lat: position.coords.latitude, lng: position.coords.longitude};

      const reverseGeocodeService = 'https://nominatim.openstreetmap.org/reverse';
      fetch(`${reverseGeocodeService}?format=jsonv2&lat=${fetchedLocation.lat}&lon=${fetchedLocation.lng}`)
          .then(response => response.json())
          .then(data => {
              locationInput.value = `${data.address.country}, ${data.address.state}`;
              document.querySelector('#manual-location').classList.add('is-focused');
          })
          .catch(error => {
              console.log(error);
              locationButton.style.display = 'inline';
              locationLoader.style.display = 'none';
              if (!sawAlert) {
                  alert('Couldn\'t fetch location, please enter manually!');
                  sawAlert = true;
              }
              fetchedLocation = {lat: 0, lng: 0};
          });
  }, error => {
      console.log(error);
      locationButton.style.display = 'inline';
      locationLoader.style.display = 'none';
      if (!sawAlert) {
          alert('Couldn\'t fetch location, please enter manually!');
          sawAlert = true;
      }
      fetchedLocation = {lat: 0, lng: 0};
  }, {timeout: 7000});
});


