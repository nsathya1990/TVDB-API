const TVShow = require('../models/TVShow');
const request = require('request');
const xml2js = require('xml2js');

exports.getTVShows = function (req, res, next) {

    var showName;
    var url;
    var parser = xml2js.Parser({
        explicitArray: false,
        normalizeTags: true
    });

    if (req.query.seriesname) {
        showName = req.query.seriesname.toLowerCase();
        url = "http://thetvdb.com/api/GetSeries.php?seriesname=" + showName;
        console.log('url', url);

        request(url, function (error, response, body) {
            if (error) {
                console.log('error:', error); // Print the error if one occurred
                return next (error);
            }
            console.log('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            parser.parseString (body, function (err, result) {
                if (!result.data.series) {
                    return res.send (404, { message: showName + ' was not found. '});
                }
                res.json({
                    data: result.data
                });
            });
        });
    }
}

exports.getTVShow = function (req, res, next) {
    Show.findById(req.params.id, function (err, show) {
        if (err) return next(err);
        res.send(show);
    });
}

exports.getTVShow = function (request, response) {
    TVShow.find({ name: request.query.search }).exec(function (error, tvshows) {
        if (error) {
            throw error;
        }
        if (tvshows) {
            console.log("Success");
            response.json({
                data: tvshows
            });
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
    tvShow.save().then(function (error, newTVShow) {
        if (error) {
            if (error.code == 11000) {
                return response.send(409, { message: show.name + ' already exists.' });
            }
            return next(error);
        }
        res.send(200);
        /* res.json({
            data: req.body
        }); */
    });
}

exports.subscribe = function (request, response, next) {
    TVShow.findById(req.body.showId, function (err, show) {
        if (err) return next(err);
        show.subscribers.push(req.user._id);
        show.save(function (err) {
            if (err) return next(err);
            res.send(200);
        });
    });
}

exports.unSubscribe = function (request, response, next) {
    TVShow.findById(req.body.showId, function (err, show) {
        if (err) return next(err);
        var index = show.subscribers.indexOf(req.user._id);
        show.subscribers.splice(index, 1);
        show.save(function (err) {
            if (err) return next(err);
            res.send(200);
        });
    });
}