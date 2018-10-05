const User = require('../models/User');
const jwt = require ('jwt-simple');
var moment = require ('moment');

var tokenSecret = 'sanmar@#1234';

exports.postUser = function(req, res) {

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

exports.getAllUsers = function(req, res, next) {
    if(!req.query.email) {
        //return res.send(400, { message: 'Email parameter is required.' });
        return res.status(400).send({ message: 'Email parameter is required.' });
    }
    User.findOne({ email: req.query.email }).exec(function(error, user) {
        if (error) {
            return next(error);
        }
        res.send({ available: !user });
    });
};

exports.ensureAuthenticated = function (req, res, next) {
    if (req.headers.authorization) {
        var token = req.headers.authorization.split(' ')[1];
        try {
            var decoded = jwt.decode (token, tokenSecret);
            if (decoded.exp <= Date.now()) {
                res.send (400, 'Access token has expired');
            }
            else {
                req.user = decoded.user;
                return next();
            }
        } catch (err) {
            return res.send (500, 'Error parsing token');
        }
    }
}

function createJwtToken (user) {
    var payLoad = {
        user: user,
        iat: new Date().getTime(),
        exp: moment().add('days', 7).valueOf()
    };
    return jwt.encode(payLoad, tokenSecret);
}

exports.signup = function(req, res, next) {
    var user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
    });
    user.save(function(err) {
      if (err) return next(err);
      //res.send(200);
      res.json({
          data: req.body.name+" registered",
          message: 'Success',
          status:200
        });
    });
}

exports.login = function(req, res, next) {

    User.findOne({ email: req.body.email }, function(err, user) {
      if (!user) return res.send(401, 'User does not exist');
      user.comparePassword(req.body.password, function(err, isMatch) {
        if (!isMatch) return res.send(401, 'Invalid email and/or password');
        var token = createJwtToken(user);
        res.send({ token: token });
      });
    });
  }
  