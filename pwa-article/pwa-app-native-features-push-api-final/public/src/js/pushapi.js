const enableNotificationsButtons = document.querySelectorAll('.enable-notifications');

const displayConfirmNotification = () => {
    console.log('displayConfirmNotification !!!')
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
                            'BPg36y0YwKrMOgutw18ZeX9Ps3fBy5tNnA_OdPIoraBn4u7ptTxJKt14bNcT3WC67b_zaMe5UQgflinBotYubEM'
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
            .then(() => console.log("Successfully unsubscribed!.")
                .catch(error => console.error('Error thrown while unsubscribing from push messaging', error)));
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
