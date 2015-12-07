var express = require('express');
var mongoose = require('mongoose');
var util = require('util');
var async = require('async');
var bcrypt = require('bcrypt');
var router = express.Router();

var Game = require('../schemas/game');
var Place = require('../schemas/place');

var title = "Games | Take me from";

router.get('/', function(req, res) {
  Game.find({}, function(err, games) {
    res.render('games/index', { title: title, games: games })
  });
});

router.get('/my-games', function(req, res) {
  Game.find({ userId: req.user.id }, function(err, games) {
    res.render('games/my-games', { title: title, games: games })
  });
});

router.get('/new', function(req, res) {
  res.render('games/new', { title: title, err: '', user: req.user });
});

router.post('/create', function(req, res) {
  var params = req.body;
  firstPlaceId = mongoose.Types.ObjectId();
  params['theBeginning'] = firstPlaceId;

  if (req.user) {
    params.userId = req.user.id;
  }

  if (req.user && params.isPrivate) {
    params.isPrivate = true;
  }

  Game(params).save(function(err, game) {
    if (err) {
      res.send(err);
    } else {
      firstPlace = { _id: firstPlaceId, gameId: game._id, isBeginning: true,
        content: "The beginning...", actions: [] }
      Place(firstPlace).save(function(err, place) {
        res.redirect('/places/design/' + game._id)
      });
    }
  });
});


module.exports = router;
