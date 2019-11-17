const shareImageButton = document.querySelector('#share-image-button');
const createPostArea = document.querySelector('#create-post');
const closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
const form = document.querySelector('form');
const titleInput = document.querySelector('#title');
const locationInput = document.querySelector('#location');
const sharedMomentsArea = document.querySelector('#shared-moments');
const imagePicker = document.querySelector('#image-picker');
const imagePickerArea = document.querySelector('#pick-image');
const videoPlayer = document.querySelector('#player');
const canvasElement = document.querySelector('#canvas');
const captureButton = document.querySelector('#capture-btn');
const locationButton = document.querySelector('#location-btn');
const locationLoader = document.querySelector('#location-loader');
let fetchedLocation = {lat: 0, lng: 0};
let picture;

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
            imagePickerArea.style.display = 'block';
        });
};

const openCreatePostModal = () => {
    setTimeout(() => createPostArea.style.transform = 'translateY(0)', 1);
    initializeMedia();

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
    imagePickerArea.style.display = 'none';
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

const createCard = selfie => {
    const cardWrapper = document.createElement('div');
    cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';

    const cardTitle = document.createElement('div');
    cardTitle.className = 'mdl-card__title';
    cardTitle.style.backgroundImage = 'url(' + selfie.selfieUrl + ')';
    cardTitle.style.backgroundSize = 'cover';
    cardWrapper.appendChild(cardTitle);

    const cardTitleTextElement = document.createElement('h2');
    cardTitleTextElement.style.color = 'white';
    cardTitleTextElement.className = 'mdl-card__title-text';
    cardTitleTextElement.textContent = selfie.title;
    cardTitle.appendChild(cardTitleTextElement);

    const cardSupportingText = document.createElement('div');
    cardSupportingText.className = 'mdl-card__supporting-text';
    cardSupportingText.textContent = selfie.location;
    cardSupportingText.style.textAlign = 'center';
    cardWrapper.appendChild(cardSupportingText);

    // Material design lite stuff
    componentHandler.upgradeElement(cardWrapper);

    sharedMomentsArea.appendChild(cardWrapper);
};

const clearCards = () => {
    while (sharedMomentsArea.hasChildNodes()) {
        sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
    }
};

const updateUI = selfies => {
    clearCards();
    selfies.forEach(selfie => createCard(selfie));
};

form.addEventListener('submit', event => {
    event.preventDefault();

    if (titleInput.value.trim() === '' || locationInput.value.trim() === '') {
        // Very professional validation
        alert('Please enter valid data!');
        return;
    }

    closeCreatePostModal();

    const id = new Date().getTime();

    if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready
            .then(sw => {
                const selfie = {
                    id: id,
                    title: titleInput.value,
                    location: locationInput.value,
                    selfie: picture,
                };
                writeData('sync-selfies', selfie)
                    .then(() => sw.sync.register('sync-new-selfies'))
                    .then(() => {
                        const snackbarContainer = document.querySelector('#confirmation-toast');
                        const data = {message: 'Your Selfie was saved for syncing!'};
                        snackbarContainer.MaterialSnackbar.showSnackbar(data);
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
            });
    } else {
        const postData = new FormData();
        postData.append('id', id);
        postData.append('title', titleInput.value);
        postData.append('location', locationInput.value);
        postData.append('selfie', picture);

        fetch(API_URL, {method: 'POST', body: postData})
            .then(response => console.log('Sent data', response));
    }
});

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

imagePicker.addEventListener('change', event => picture = event.target.files[0]);

let networkDataReceived = false;
fetch(API_URL)
    .then(response => response.json())
    .then(data => {
        console.log('From server', data);
        networkDataReceived = true;
        const selfies = [];
        for (const key in data) {
            selfies.push(data[key]);
        }
        updateUI(selfies);
    });

if ('indexedDB' in window) {
    readAllData('selfies')
        .then(selfies => {
            if (!networkDataReceived) {
                console.log('From cache', selfies);
                updateUI(selfies);
            }
        });
}

// if ('serviceWorker' in navigator && 'SyncManager' in window) {
//     navigator.serviceWorker.ready.then(sw => {
//         sw.periodicSync.register({
//             tag: 'get-latest-selfies',
//             minPeriod: 12 * 60 * 60 * 1000,
//             powerState: 'avoid-draining',
//             networkState: 'avoid-cellular'
//         })
//             .then(periodicSyncReg => console.log('Success!'))
//             .catch(error => console.log('Error', error))
//     });
// }

