const request = require('request');
const xml2js = require('xml2js');
const async = require('async');
const _ = require('lodash');
const rp = require('request-promise-native');

const TVShow = require('../models/TVShow');

var parser = xml2js.Parser({
    explicitArray: false,
    normalizeTags: true
});

exports.getTVShows = function (req, res, next) {

    var showName;
    var url = "http://thetvdb.com/api/GetSeries.php?seriesname=";
    var showDetailsUrl;
    var posterUrl;
    var seriesids = [];
    var poster;

    var username = "nsathya1990tm7";
    var userkey = "KZDF4DJ2VBYSLX5Y";
    var apikey = "GZW3FBA4YC4GAT75";
    var jwtToken;

    if (req.query.seriesname) {

        showName = req.query.seriesname.toLowerCase();
        url += showName;

        async.waterfall([

            // Function 1: to retrieve JWT token
            function (callback) {
                var loginUrl = "https://api.thetvdb.com/login";
                var formData = {
                    "apikey": apikey,
                    "userkey": userkey,
                    "username": username
                };
                var headers = {
                    "Content-Type": "application/json"
                }
                request({
                    method: 'POST',
                    headers: headers,
                    url: loginUrl,
                    body: formData,
                    json: true
                }, function (err, httpResponse, body) {
                    if (err) {
                        return console.error('upload failed:', err);
                    }
                    jwtToken = body.token;
                    callback(null, jwtToken);
                });
            },

            // Function 2: to retrieve show ids
            function (token, callback) {

                var authorization = "Bearer " + token
                var header = {
                    "Content-Type": "application/json",
                    "Authorization": authorization,
                    "Accept": "application/json"
                }
                var showSearchUrl = "https://api.thetvdb.com/search/series?";
                var queryString = { 'name': showName };
                request({
                    method: 'GET',
                    headers: header,
                    url: showSearchUrl,
                    qs: queryString,
                    json: true
                }, function (error, response, seriesData) {
                    if (error) {
                        return next(error);
                    }
                    callback(null, token, seriesData.data);
                });
            },

            // Function 3: to retrieve show details using id
            function (token, shows) {

                console.log("Array.isArray(shows):", Array.isArray(shows));
                if (Array.isArray(shows)) {

                    var series = shows.map(show => {
                        var show = new TVShow({
                            name: show.seriesName,
                            _id: show.id
                        });
                        return show
                    });

                    var authorization = "Bearer " + token
                    var header = {
                        "Content-Type": "application/json",
                        "Authorization": authorization,
                        "Accept": "application/json"
                    }
                    var promises = series.map((show) =>
                        new Promise(function (rs, rj) {
                            rp({
                                method: 'GET',
                                headers: header,
                                url: "https://api.thetvdb.com/series/" + show.id + "/images/query?keyType=poster",
                                json: true
                            }).then(function (posters) {

                                show.poster = "https://www.thetvdb.com/banners/" + posters.data[0].fileName;
                                rs(show);
                            }).catch(function (error) {
                                console.error("error:", show.id);
                            });
                        })
                    );

                    Promise.all(promises)
                        .then((shows) => {
                            console.log("Promise All");
                            console.log("SHOWS:", shows);
                            res.json({ "data": shows });
                        })
                        .catch(error => {
                            console.error("Msg", error);
                        });
                }
                else {
                    console.log("ELSE", shows);
                    res.json(shows);
                }

            }
        ]);
    }
}

exports.postTVShow = function (req, resp, next) {

    var apikey = "9EF1D1E7D28FDA0B";

    showDetailsUrl = "http://thetvdb.com/api/";
    showDetailsUrl = showDetailsUrl + apikey + "/series/" + req.body._id + "/all/en.xml";

    async.waterfall([
        function (callback) {
            request(showDetailsUrl, function (err, response, body) {

                if (err) {
                    return next(err);
                }
                parser.parseString(body, function (err, showDetailsResult) {
                    if (!showDetailsResult.data.series) {
                        return resp.send(404, { message: showName + ' was not found. ' });
                    }
                    var series = showDetailsResult.data.series;
                    var episodes = showDetailsResult.data.episode;
                    //console.log("parseString O/P series", series);

                    poster = series.poster;
                    posterUrl = "http://thetvdb.com/banners/";
                    posterUrl += poster;

                    var genre = series.genre.split(['|']).filter(function (x) {
                        return (x !== (undefined || null || ''));
                    });
                    var actors = series.actors.split('|').filter(function (x) {
                        return (x !== (undefined || null || ''));
                    });

                    var show = new TVShow({
                        _id: series.id,
                        name: series.seriesname,
                        actors: actors,
                        airsDayOfWeek: series.airs_dayofweek,
                        airsTime: series.airs_time,
                        firstAired: series.firstaired,
                        finaleaired: series.finale_aired,
                        genre: genre,
                        network: series.network,
                        overview: series.overview,
                        rating: series.rating,
                        ratingCount: series.ratingcount,
                        status: series.status,
                        poster: posterUrl,
                        episodeCount: episodes.length,
                        episodes: []
                    });
                    _.each(episodes, function (episode) {
                        show.episodes.push({
                            season: episode.seasonnumber,
                            episodeNumber: episode.episodenumber,
                            episodeName: episode.episodename,
                            firstAired: episode.firstaired,
                            overview: episode.overview
                        });
                    });
                    callback(err, show);
                });
            });
        },
        function (show, callback) {
            request({ url: show.poster, encoding: null }, function (error, response, body) {
                show.poster = 'data:' + response.headers['content-type'] + ';base64,' + body.toString('base64');
                callback(error, show);
            });
        },
        function (show) {
            //console.log("333");
            show.save().then(function (newShow) {
                resp.json({
                    message: 'OK',
                    success: true,
                    status: 200
                });
            });
        }
    ]);
}

exports.getAllShowsFromDB = function (request, response, next) {
    TVShow.find().exec(function (error, shows) {
        if (error) {
            throw err;
        }
        if (shows) {
            response.json({
                data: shows
            });
        }
        else {
            response.json({
                message: "No Data have been found."
            });
        }
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