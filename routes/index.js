var passport = require('passport');
var express = require('express');
var router = express.Router();

var User = require('../schemas/user');
var Place = require('../schemas/place');

var title = "Take me from";

router.get('/', function(req, res, next) {
  Place.findOne({ content: "The beginning..." }, function(err, place) {
    res.render('index', { title: 'Take me from', place: place });
  });
});

router.get('/register', function(req, res) {
  res.render('register', { title: title });
});

router.post('/register', function(req, res, next) {
  console.log('registering user');
  User.register(new User({username: req.body.username}), req.body.password, function(err) {
    if (err) {
      console.log('error while user register!', err);
      return next(err);
    }

    console.log('user registered!');

    res.redirect('/');
  });
});

router.get('/login', function(req, res) {
  res.render('login', {user: req.user,  title: title });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
  res.redirect('/games/my-games');
});

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

module.exports = router;
