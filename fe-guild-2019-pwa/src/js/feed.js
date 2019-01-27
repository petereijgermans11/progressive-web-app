const shareImageButton = document.querySelector('#share-image-button');
const createPostArea = document.querySelector('#create-post');
const closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');

const openCreatePostModal = () => createPostArea.style.transform = 'translateY(0)';
const closeCreatePostModal = () => createPostArea.style.transform = 'translateY(100vh)';

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);
