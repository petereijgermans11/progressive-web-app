const uuid = require('uuid');
const path = require('path');
const webpush = require('web-push');

const VAPID_MAIL = 'mailto:raduenuca@gmail.com';
const VAPID_PUBLIC_KEY = 'BGMYWA_g_tpLeOXlR4oykccGE00remgS_-2PrH2WjgWrg93lPDsjnJ0pDKmuGaAfbzuOtvkUWK-CivusHQdL0BE';
const VAPID_PRIVATE_KEY = '_8Cdt4_GmUrct_qR51gYbOQpSyevbdgCgFELiEhO95I';

webpush.setVapidDetails(VAPID_MAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

const appRouter = (app, selfiesDb, subscriptionsDb) => {
    app.post('/selfies', (req, res) => {
        const post = {title: req.fields.title, location: req.fields.location};

        if (req.files.selfie) {
            const selfieFileName = path.basename(req.files.selfie.path);
            post.selfieUrl = `${req.protocol}://${req.get('host')}/images/${selfieFileName}`;
        } else {
            post.selfieUrl = `${req.protocol}://${req.get('host')}/dummy/dummy_selfie.jpg`;
        }

        post.id = req.fields.id;

        selfiesDb.push(`selfies/${post.id}`, post, false);

        const subscriptions = subscriptionsDb.getData('/');

        Object.values(subscriptions).forEach(subscription => {
            const pushConfig = {
                endpoint: subscription.endpoint,
                keys: {
                    auth: subscription.keys.auth,
                    p256dh: subscription.keys.p256dh
                }
            };

            webpush.sendNotification(pushConfig, JSON.stringify({
                title: 'New Selfie Added!',
                content: `${post.title} @ ${post.location}`,
                imageUrl: post.selfieUrl,
                openUrl: 'help'
            })).catch(error => console.log(error));
        });

        res.status(200).send({message: 'Selfie stored', id: post.id});
    });

    app.get('/selfies', (req, res) => {
        const selfies = selfiesDb.getData('/');

        res.send(selfies);
    });

    app.post('/subscriptions', (req, res) => {
        const subscription = req.fields;

        subscription.id = uuid.v4();

        subscriptionsDb.push(`subscriptions/${subscription.id}`, subscription, false);
        res.status(200).send('subscription saved');
    });
};

module.exports = appRouter;
