const mongoose = require('mongoose');

const tvShowSchema = mongoose.Schema({
    name: String,
    no_of_seasons: Number,
    genre: [String], //genre: Array,
    director: String,
    producer: String,
    actors:	Array,
    releaseDate: Date,
    budget: Number,
    country: String,
    showOverview: String,
    running_time: String,
    distributor: String,
    rating: Number,
    poster: String,
    episodes: [{
        season: Number,
        episodeNumber: Number,
        episodeName: String,
        aired: Date,
        overview: String
    }]
})

module.exports = mongoose.model('TVShow', tvShowSchema);