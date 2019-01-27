const shareImageButton = document.querySelector('#share-image-button');
const createPostArea = document.querySelector('#create-post');
const closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');

const openCreatePostModal = () => {
    createPostArea.style.transform = 'translateY(0)';

    if(deferredPrompt) {
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
