var express = require('express');
var mongoose = require('mongoose');
var util = require('util');
var async = require('async');
var router = express.Router();

var Place = require('../schemas/place');
var Game = require('../schemas/game');

var title = "Take me from";

router.get('/design/:gameId', function(req, res) {
  Game.findOne({ _id: req.params.gameId }, function(err, game) {
    if (game && game.isEditable(req.user)) {

      Place.find({ gameId: req.params.gameId }, function(err2, places) {

        nodes = [];
        edges = [];

        places.forEach(function(place) {
          node = { data: { id: place._id + '', content: place.content + '' } }
          nodes.push(node);
        });

        Action.find({ gameId: req.params.gameId }, function(err3, actions) {
          actions.forEach(function(action) {
            edges.push({ data: { source: action.source + '',
                                 target: action.target + '',
                                 content: action.content + '',
                                 id: action.id + '' }})
            }
          });

          nodes = util.inspect(nodes);
          edges = util.inspect(edges);
          theBeginning = util.inspect({ id: game.theBeginning + ''});


          var gameUrl = req.protocol + '://' + req.get('host') + '/places/' + game.theBeginning;
          res.render('places/index', { title: title + " | " + game.name, game: game,
            err: err + err2 + err3, nodes: nodes, edges: edges,
            theBeginning: theBeginning }
          );
        });
      });
    } else {
      res.status('403').redirect('/login');
    }
  });
});

router.get('/create/:gameId/:fromPlaceId', function(req, res) {
  Game.findOne({ _id: req.params.gameId }, function(err, game) {
    if (game && !game.isEditable(req.user)) {
      res.status('403').redirect('/login');
    } else {
      Place({ content: '--new place--',
              gameId: req.params.gameId })
        .save(function(err, newPlace) {
        if (err) {
          res.send(err);
        } else {
          Action({ gameId: req.params.gameId,
                    source: req.params.fromPlaceId,
                    target: newPlace._id,
                    content: "new choice"})
            .save(function(err, newAction) {
            if (err) {
              res.send(err);
            } else {
              res.send({ newNode: { id: newPlace._id, content: newPlace.content },
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

router.post('/update', function(req, res) {
  id = req.body._id;
  delete req.body._id;

  Game.findOne({ _id: req.body.gameId }, function(err, game) {
    if (game && !game.isEditable(req.user)) {
      res.status('403').redirect('/login');
    } else {
      Place.update({ _id: id }, req.body, function(err, place) {
        if (err) {
          res.send(err);
        } else {
          res.redirect('/places/design/' + req.body.gameId);
        }
      });
    }
  });
});

router.get('/:id/destroy', function(req, res) {
  Place.findOne({ _id: req.params.id}, function(err, place) {
    Game.findOne({ _id: place.gameId }, function(err, game) {
      if (game.isEditable(req.user)) {
        if (place.isBeginning) {
          res.status('403').redirect('/places/design/' + place.gameId);
        } else {
          gameId = place.gameId;
          Place.remove({ _id: req.params.id }, function(err){
            Action.remove({$or:[{source: req.params.id}, {target: req.params.id}]}, function(err){
              res.redirect('/places/design/' + gameId);
            })
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
    checkedActions = [];
    isEditable = false;

    async.series([
      function(done) {
        async.each(place.actions, function(action, callback) {

          Place.findOne({ _id: action.link}, function(err, place) {
              if (place) {
                checkedActions.push(action);
              }
              callback();
          });
        }, done) },
      function(callback) {
        Game.findOne({ _id: place.gameId }, function(err2, game) {
          if (game && game.isEditable(req.user)) {
            isEditable = true;
          }
          res.render('places/show', { title: title, place: place,
            actions: checkedActions, isEditable: isEditable });
        });
      }
    ]);
  });
});

module.exports = router;
