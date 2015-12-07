var passport = require('passport');
var express = require('express');
var router = express.Router();

var User = require('../schemas/user');
var Game = require('../schemas/game');

var title = "Take me from";

router.get('/', function(req, res, next) {
  Game.findOne({ isPrivate: { $exists: false } }, function(err, game) {
    res.render('index', { title: 'Take me from', game: game, user: req.user });
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
      return res.render('error', { error: err });
    }

    console.log('user registered!');

    res.redirect('/login');
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
