const shareImageButton = document.querySelector('#share-image-button');
const createPostArea = document.querySelector('#create-post');
const closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
const form = document.querySelector('form');
const titleInput = document.querySelector('#title');
const locationInput = document.querySelector('#location');
const sharedMomentsArea = document.querySelector('#shared-moments');
const imagePicker = document.querySelector('#image-picker');
let picture;

const API_URL = 'http://192.168.1.162:3000/selfies';

const openCreatePostModal = () => {
    createPostArea.style.transform = 'translateY(0)';

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

const closeCreatePostModal = () => createPostArea.style.transform = 'translateY(100vh)';

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

    const postData = new FormData();
    postData.append('title', titleInput.value);
    postData.append('location', locationInput.value);
    postData.append('selfie', picture);

    fetch(API_URL, {method: 'POST', body: postData})
        .then(response => {
            console.log('Sent data', response);
        });
});

imagePicker.addEventListener('change', event => picture = event.target.files[0]);

fetch(API_URL)
    .then(response=> response.json())
    .then(data => {
        console.log('From server', data);
        const selfies = [];
        for (const key in data) {
            selfies.push(data[key]);
        }
        updateUI(selfies);
    });

