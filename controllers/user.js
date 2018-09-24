const User = require('../models/User');

exports.postUser = function(req, res) {
    console.log(req.body);
    var user = new User ({
        eMailId: req.body.eMailId,
        username: req.body.username,
        password: req.body.password,
        movie: req.body.movie
    });
    user.save().then(function(newUser) {
        res.json({
            data: req.body
        });
    });
}

exports.postLogin = function(req, res) {
    console.log(req.body);

    User.find({"username":req.body.username}).exec(function(error, user) {
        if (error) {
            throw err;
        }
        if(user) {
            console.log(user);
            res.json({
                success: true,
                data: user
            }) ;
        }
        else {
            res.json({
                message: "No Data have been found."
            });
        }
    });
}

exports.getAllUsers = function(req, res) {
    User.find().exec(function(error, users) {
        if (error) {
            throw err;
        }
        if(users) {
            res.json({
                data: users
            }) ;
        }
        else {
            res.json({
                message: "No Data have been found."
            });
        }
    });
};