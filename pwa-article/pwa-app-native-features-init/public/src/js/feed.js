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

// ADD YOUR CODE HERE !


// ADD initializeLocation

// ADD initializeMedia

// ADD openCreatePostModal

const closeCreatePostModal = () => {
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

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

// ADD form.addEventListener('submit', event => {

// ADD captureButton.addEventListener('click', event => {

// ADD locationButton.addEventListener('click', event => {

const createCard = selfie => {
  if (!selfie.selfie) return;
  const cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';

  const cardTitle = document.createElement('div');
  const blobUrl = URL.createObjectURL(selfie.selfie)
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url(' + blobUrl + ')';
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
