const express = require('express');
const app = express();
const data = require('./lib/functions.js');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

const router = express.Router();

router.get('/data', (req, res) => {
    res.json({
        names: data.namesFormatted,
        create: data.create,
    });
});

router.get('/', (req, res) => {
    res.render('index', {
        data: {
            names: data.namesFormatted,
            create: data.create,
        },
    });
});

// Hier wird der Router eingebunden
app.use(router);

app.set('view engine', 'pug');

app.listen(5555, () => {
    console.log('Server started at http://localhost:5555');
});