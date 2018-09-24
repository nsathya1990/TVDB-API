const TVShow = require('../models/TVShow');

exports.getTVShows = function (request, response) {
    console.log('request.query.search:',request.query.search);
    if (request.query.search !== null && request.query.search != "" && request.query.search != undefined) {
        console.log('IF request.query.search:',request.query.search);
        TVShow.find({name: request.query.search}).exec(function (error, tvshows) {
            if (error) {
                throw error;
            }
            if(tvshows) {
                response.json({
                    data: tvshows
                }) ;
            }
            else {
                response.json({
                    message: "No data found"
                });
            }
        });
    }
    else {
        console.log('ELSE request.query.search:',request.query.search);
        TVShow.find().exec(function (error, tvshows) {
            if (error) {
                throw error;
            }
            if(tvshows) {
                response.json({
                    data: tvshows
                }) ;
            }
            else {
                response.json({
                    message: "No data found"
                });
            }
        });
    }
}

exports.getTVShow = function (request, response) {
        TVShow.find({name: request.query.search}).exec(function(error, tvshows){
        if (error) {
            throw error;
        }
        if(tvshows) {
            console.log("Success");
            response.json({
                data: tvshows
            }) ;
        }
        else {
            response.json({
                message: "No Data have been found."
            });
        }
    });
}

exports.postTVShow = function (request, response) {
    var tvShow = new TVShow({
        name: request.body.name,
        no_of_seasons: req.body.no_of_seasons,
        genre: req.body.genre,
        director: req.body.director,
        producer: req.body.producer,
        actors: req.body.actors,
        releaseDate: req.body.releaseDate,
        budget: req.body.budget,
        country: req.body.country,
        showOverview: req.body.subTitle,
        running_time: req.body.running_time,
        distributor: req.body.distributor,
        rating: req.body.rating,
        poster: req.body.poster,
        episodes: []
    });
    _.each(episodes, function (episode) {
        tvShow.episodes.push({
            season: episode.seasonnumber,
            episodeNumber: episode.episodenumber,
            episodeName: episode.episodename,
            aired: episode.firstaired,
            overview: episode.overview
        })
    });
}