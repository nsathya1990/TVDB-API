const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

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

app.get('/api/tvShows', tvShowController.getTVShows);//for getAll as well as getSome/getOne using query string
app.post('/api/tvshows', tvShowController.postTVShow); //create record for a TvShow using POST

app.get('/api/users', userController.getAllUsers);//for getAll as well as getSome/getOne using query string
app.post('/api/users', userController.postUser); //create record for a User using POST

app.set('port', 3000);
app.listen(app.get('port'), function() {
    console.log('the server is working');
})