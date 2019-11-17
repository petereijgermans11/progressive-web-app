const express = require('express');
const formidableMiddleware = require('express-formidable');
const JsonDB = require('node-json-db');
const cors = require('cors');
const routes = require('./routes/routes');
const fs = require('fs');

// Create folders
const images = `${__dirname}/images`;

!fs.existsSync(images) && fs.mkdirSync(images);

const selfiesDb = new JsonDB('data/selfies', true, true);
const subscriptionsDb = new JsonDB('data/subscriptions', true, true);
const app = express();

app.use(cors());
app.use('/images', express.static('images'));
app.use('/dummy', express.static('dummy'));
app.use(formidableMiddleware({
    encoding: 'utf-8',
    uploadDir: images,
    keepExtensions: true,
    multiples: false,
}));

routes(app, selfiesDb, subscriptionsDb);

const server = app.listen(3000, ()=> console.log('app running on port:', server.address().port));
