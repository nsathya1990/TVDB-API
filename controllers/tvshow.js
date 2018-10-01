const request = require('request');
const xml2js = require('xml2js');
const async = require('async');

const TVShow = require('../models/TVShow');

exports.getTVShows = function (req, res, next) {

    var showName;
    var url = "http://thetvdb.com/api/GetSeries.php?seriesname=";
    var showDetailsUrl;
    var posterUrl;
    var apiKey = '9EF1D1E7D28FDA0B';
    var seriesId;
    var poster;

    var shows = new Array();

    var parser = xml2js.Parser({
        explicitArray: false,
        normalizeTags: true
    });

    if (req.query.seriesname) {
        showName = req.query.seriesname.toLowerCase();
        url = url + showName;

        async.waterfall([
            function (callback) {
                request(url, function (error, response, body) {
                    if (error) {
                        console.log('error:', error); // Print the error if one occurred
                        return next(error);
                    }
                    //console.log('statusCode:', response && response.statusCode);
                    parser.parseString(body, function (err, result) {
                        if (!result.data.series) {
                            return res.send(404, { message: showName + ' was not found. ' });
                        }
                        console.log('isArray(show-name):', Array.isArray(result.data.series));
                        var seriesId = result.data.series.seriesid || result.data.series[0].seriesid;
                        callback(err, seriesId);
                    });
                });
            },
            function (seriesId, callback) {
                console.log('seriesid:', seriesId);

                showDetailsUrl = "http://thetvdb.com/api/";
                showDetailsUrl = showDetailsUrl + apiKey + "/series/" + seriesId + "/all/en.xml";
                //console.log("Show details url:", showDetailsUrl);
                request(showDetailsUrl, function (sDetailsError, sDetailsResponse, sDetailsBody) {
                    if (sDetailsError) {
                        return next(sDetailsError);
                    }
                    parser.parseString(sDetailsBody, function (err, sDetailsResult) {
                        if (!sDetailsResult.data.series) {
                            return res.send(404, { message: showName + ' was not found. ' });
                        }
                        var series = sDetailsResult.data.series;
                        var episodes = sDetailsResult.data.episode;

                        poster = series.poster;// || result.data.series[0].poster;
                        posterUrl = "http://thetvdb.com/banners/";
                        posterUrl += poster;
                        //console.log("posterUrl:", posterUrl);

                        var show = new TVShow({
                            _id: series.id,
                            name: series.seriesname,
                            poster: posterUrl,
                            episodeCount: episodes.length
                        });
                        //console.log("show:", show);
                        shows.push(show);
                        shows.push(show);
                        shows.push(show);
                        shows.push(show);
                        shows.push(show);
                        shows.push(show);
                        console.log("shows:", shows);
                        res.json({
                            data: shows
                        });
                    });
                });
            }
        ]);
        /* request(url, function (error, response, body) {
            if (error) {
                console.log('error:', error); // Print the error if one occurred
                return next(error);
            }
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received

            parser.parseString(body, function (err, result) {
                if (!result.data.series) {
                    return res.send(404, { message: showName + ' was not found. ' });
                }
                console.log('Array.isArray(result.data.series):', Array.isArray(result.data.series));

                if (Array.isArray(result.data.series)) {
                    
                    result.data.series.forEach(element => {

                        show = new TVShow();
                        show.name = element.seriesname;
                        show.overview = element.overview;
                        show.firstAired = element.firstaired;
                        show._id = element.seriesid;

                        showDetailsUrl = "http://thetvdb.com/api/";
                        showDetailsUrl = showDetailsUrl + apiKey + "/series/" + element.seriesid + "/all/en.xml";
                        console.log("Show details url:", showDetailsUrl);
                        request(showDetailsUrl, function (sDetailsError, sDetailsResponse, sDetailsBody) {
                            if (sDetailsError) {
                                return next(sDetailsError);
                            }
                            parser.parseString(sDetailsBody, function (err, sDetailsResult) {
                                if (!sDetailsResult.data.series) {
                                    return res.send(404, { message: showName + ' was not found. ' });
                                }
                                poster = sDetailsResult.data.series.poster || result.data.series[0].poster;
                                posterUrl = "http://thetvdb.com/banners/";
                                posterUrl += poster;
                                show.poster = posterUrl;
                                show.network = sDetailsResult.data.series.network;
                                show.airsTime = sDetailsResult.data.series.airs_time;
                                show.status = sDetailsResult.data.series.status;
                                show.airsDayOfWeek = sDetailsResult.data.series.airs_dayofweek;
                                show.episodeCount = sDetailsResult.data.episode.length;
                            });
                        });
                        shows.push(show);
                    });
                    console.log("Array shows:", shows);
                    res.json({
                        data: shows
                    });
                }
                else {
                    console.log("[ELSE] seriesid:", result.data.series.seriesid);

                    show = new TVShow();
                    show._id = result.data.series.seriesid;
                    show.name = result.data.series.seriesname;
                    show.overview = result.data.series.overview;
                    show.firstAired = result.data.series.firstaired;

                    showDetailsUrl = "http://thetvdb.com/api/";
                    showDetailsUrl = showDetailsUrl + apiKey + "/series/" + result.data.series.seriesid + "/all/en.xml";
                    console.log("Show details url:", showDetailsUrl);

                    request(showDetailsUrl, function (sDetailsError, sDetailsResponse, sDetailsBody) {
                        if (sDetailsError) {
                            return next(sDetailsError);
                        }
                        console.log("Show details status code:", sDetailsResponse && sDetailsResponse.statusCode);
                        parser.parseString(sDetailsBody, function (err, sDetailsResult) {
                            if (!sDetailsResult.data.series) {
                                return res.send(404, { message: showName + ' was not found. ' });
                            }
                            poster = sDetailsResult.data.series.poster || result.data.series[0].poster;
                            posterUrl = "http://thetvdb.com/banners/";
                            posterUrl += poster;

                            show.network = sDetailsResult.data.series.network;
                            show.airsTime = sDetailsResult.data.series.airs_time;
                            show.status = sDetailsResult.data.series.status;
                            show.airsDayOfWeek = sDetailsResult.data.series.airs_dayofweek;
                            show.episodeCount = sDetailsResult.data.episode.length;
                            show.poster = posterUrl;

                            res.json({
                                data: show
                            });
                        });
                    });
                }
            });
        }); */
    }
}

exports.getTVShow = function (req, res, next) {
    Show.findById(req.params.id, function (err, show) {
        if (err) return next(err);
        res.send(show);
    });
}

exports.postTVShow = function (request, response) {

    console.log("request.body._id:", request.body._id);
    response.json({
        data: request.body._id
    });
//    response.send({ data: request.body.id });
    /* var tvShow = new TVShow({
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
    }); */
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