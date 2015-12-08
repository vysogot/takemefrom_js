var express = require('express');
var mongoose = require('mongoose');
var util = require('util');
var async = require('async');
var router = express.Router();

var Place = require('../schemas/place');
var Game = require('../schemas/game');
var Action = require('../schemas/action');

var title = "Take me from";

router.get('/create/:fromPlaceId/:toPlaceId', function(req, res) {
  Place.findOne({ _id: req.params.fromPlaceId }, function(err, place) {
    Game.findOne({ _id: place.gameId }, function(err, game) {
      if (game && !game.isEditable(req.user)) {
        res.status('403').redirect('/login');
      } else {
        Action({ gameId: game._id,
                 source: place._id,
                 target: req.params.toPlaceId,
                 content: "new choice"})
          .save(function(err, newAction) {
          if (err) {
            res.send(err);
          } else {
            res.send({ newEdge: { source: place._id,
                                  target: req.params.toPlaceId,
                                  content: newAction.content,
                                  id: newAction._id }})
          }
        });
      }
    });
  });
});

router.post('/:id/update', function(req, res) {
  Action.findOne({ _id: req.params.id }, function(err, action) {
    Game.findOne({ _id: action.gameId }, function(err, game) {
      if (game && !game.isEditable(req.user)) {
        res.status('403').redirect('/login');
      } else {
        Action.update({ _id: action._id },
                      { content: req.body.content }, function(err, action) {
          if (err) {
            res.send(err);
          } else {
            res.redirect('/games/' + game._id);
          }
        });
      }
    });
  });
});

router.get('/:id/destroy', function(req, res) {
  Action.findOne({ _id: req.params.id }, function(err, action) {
    Game.findOne({ _id: action.gameId }, function(err, game) {
      if (game.isEditable(req.user)) {
        Action.remove({ _id: action._id }, function(err){
          res.redirect('/games/' + game.id);
        });
      } else {
        res.status('403').redirect('/login');
      }
    });
  });
});

module.exports = router;
