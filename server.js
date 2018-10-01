const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require ('cors');

const tvShowController = require('./controllers/tvshow');
const userController = require('./controllers/user');

mongoose.connect("mongodb://localhost:27017/tvShowDB");
mongoose.connection.on('error', function() {
    console.log("Error while connecting to MongoDB");
});
mongoose.connection.on('on', function() {
    console.log('Connected to MongoDB');
});

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(cors());

/* app.get('*', function (req, res) {
    res.redirect('/#', req.originalUrl);
}); */

app.get('/api/shows', tvShowController.getTVShows);//for getAll as well as getSome/getOne using query string
app.post('/api/show', tvShowController.postTVShow); //create record for a TvShow using POST in local DB

app.get('/api/shows/:id', tvShowController.getTVShow);
app.post('/api/show/subscribe', userController.ensureAuthenticated, tvShowController.subscribe);
app.post('/api/show/unsubscribe', userController.ensureAuthenticated, tvShowController.unSubscribe);

app.get('/api/users', userController.getAllUsers);
app.post('/api/user/signup', userController.signup);
app.post('/api/user/login', userController.login);

app.set('port', 3001);
app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
})