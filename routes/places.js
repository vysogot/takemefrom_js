var express = require('express');
var mongoose = require('mongoose');
var util = require('util');
var async = require('async');
var router = express.Router();

var Game = require('../schemas/game');
var Place = require('../schemas/place');
var Action = require('../schemas/action');

var title = "Take me from";

router.get('/create/:fromPlaceId', function(req, res) {
  Place.findOne({ _id: req.params.fromPlaceId }, function(err, place) {
    Game.findOne({ _id: place.gameId }, function(err, game) {
      if (game && !game.isEditable(req.user)) {
        res.status('403').redirect('/login');
      } else {
        Place({ content: '--new place--',
                gameId: game._id })
          .save(function(err, newPlace) {
          if (err) {
            res.send(err);
          } else {
            Action({ gameId: game._id,
                     source: req.params.fromPlaceId,
                     target: newPlace._id,
                     content: "new choice"})
              .save(function(err, newAction) {
              if (err) {
                res.send(err);
              } else {
                res.send({ newNode: { id: newPlace._id,
                                      content: newPlace.content },
                           newEdge: { source: req.params.fromPlaceId,
                                      target: newPlace._id,
                                      content: newAction.content,
                                      id: newAction._id }})
              }
            });
          }
        });
      }
    });
  });
});

router.post('/:id/update', function(req, res) {
  Place.findOne({ _id: req.params.id }, function(err, place) {
    Game.findOne({ _id: place.gameId }, function(err, game) {
      if (game && !game.isEditable(req.user)) {
        res.status('403').redirect('/login');
      } else {
        Place.update({ _id: place._id },
                     { content: req.body.content }, function(err, result) {
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
  Place.findOne({ _id: req.params.id}, function(err, place) {
    Game.findOne({ _id: place.gameId }, function(err, game) {
      if (game.isEditable(req.user)) {
        if (place.isBeginning) {
          res.status('403').redirect('/games/' + place.gameId);
        } else {
          gameId = place.gameId;
          Place.remove({ _id: req.params.id }, function(err){
            Action.remove({ $or: [
              { source: req.params.id },
              { target: req.params.id }
              ]}, function(err) {
                res.redirect('/games/' + gameId);
            });
          });
        }
      } else {
        res.status('403').redirect('/login');
      }
    });
  });
});

router.get('/:id', function(req, res) {
  Place.findOne({ _id: req.params.id }, function(err, place) {
    Game.findOne({ _id: place.gameId }, function(err2, game) {
      Action.find({ source: place._id }, function(err, actions) {
        if (err2) {
          res.send(err2);
        } else {
          res.render('places/show', {
            title: title,
            place: place,
            actions: actions,
            isEditable: (game && game.isEditable(req.user)) }
          );
        }
      });
    });
  });
});

module.exports = router;
