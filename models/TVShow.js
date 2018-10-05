const mongoose = require('mongoose');

const tvShowSchema = mongoose.Schema({
    _id: Number,
    name: String,
    actors: [String],
    airsDayOfWeek: String,
    airsTime: String,
    firstAired: Date,
    finaleaired: Date,
    genre: [String],
    network: String,
    overview: String,
    rating: Number,
    ratingCount: Number,
    status: String,
    poster: String,
    subscribers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    episodes: [{
        season: Number,
        episodeNumber: Number,
        episodeName: String,
        firstAired: Date,
        overview: String
    }],
    episodeCount: Number
})

module.exports = mongoose.model('TVShow', tvShowSchema);