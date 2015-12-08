var express = require('express');
var mongoose = require('mongoose');
var util = require('util');
var async = require('async');
var router = express.Router();

var Place = require('../schemas/place');
var Game = require('../schemas/game');

var title = "Take me from";

router.get('/create/:gameId/:fromPlaceId/:toPlaceId', function(req, res) {
  Game.findOne({ _id: req.params.gameId }, function(err, game) {
    if (game && !game.isEditable(req.user)) {
      res.status('403').redirect('/login');
    } else {
      newActionId = mongoose.Types.ObjectId();
      Place.update({ _id: req.params.fromPlaceId },
        { $push: { actions: {
            body: "--new choice--",
            link: req.params.toPlaceId,
            _id: newActionId }}}, function(err, result) {
        if (err) {
          res.send(err);
        } else {
          res.send({ newEdge: { source: req.params.fromPlaceId,
                              target: req.params.toPlaceId,
                              content: '--new choice--',
                              id: newActionId }})
        }
      });
    }
  });
});

module.exports = router;
