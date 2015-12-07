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
      var place = new Place({ content: "", gameId: req.params.gameId,
        actions: [{body: "", link: ""}, {body:"", link:""}]});

      Place.find({ gameId: req.params.gameId }, function(err2, places) {

        elements = {};
        nodes = [];
        edges = [];

        places.forEach(function(place) {
          nodes.push({ data: { id: place._id + '', content: place.content + '' } });
          place.actions.forEach(function(action) {
            if (action.link !== undefined) {
              edges.push({ data: { source: place._id + '',
                                   target: action.link + '',
                                   content: action.body + '',
                                   id: action.id + ''}})
            }
          });
        });

        nodes = util.inspect(nodes);
        edges = util.inspect(edges);


        var gameUrl = req.protocol + '://' + req.get('host') + '/places/' + game.theBeginning;
        res.render('places/index', { title: title + " | " + game.name, game: game,
          places: places, place: place, err: err + err2, nodes: nodes, edges: edges }
        );
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
      Place({ content: '--new place--', actions: [], gameId: req.params.gameId })
        .save(function(err, newPlace) {
        if (err) {
          res.send(err);
        } else {
          Place.findOne({ _id: req.params.fromPlaceId },
            function(err, oldPlace) {
            if (err) {
              res.send(err);
            } else {
              newActionId = mongoose.Types.ObjectId();
              oldPlace.update({ $push: { actions: { body: '--new choice--',
                         link: newPlace._id, _id: newActionId }}}, function(err, result) {
                if (err) {
                  res.send(err);
                } else {
                  res.send({ newNode: { id: newPlace._id, content: newPlace.content },
                           newEdge: { source: oldPlace._id,
                                      target: newPlace._id,
                                      content: '--new choice--',
                                      id: newActionId }})
                }
              });
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
      if (req.body.content) {
        Place.update({ _id: id }, req.body, function(err, place) {
          if (err) {
            res.send(err);
          } else {
            res.redirect('/places/design/' + req.body.gameId);
          }
        });
      } else {
        Place.update({ _id: id, 'actions._id': req.body.actionId },
          { $set: { "actions.$.body": req.body.actionBody }}, function(err, result) {
          if (err) {
            res.send(err);
          } else {
            res.redirect('/places/design/' + req.body.gameId);
          }
        });
      }
    }
  });
});

router.get('/connect/:gameId/:fromPlaceId/:toPlaceId', function(req, res) {
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

router.get('/:id/edit', function(req, res) {
  Place.findOne({ _id: req.params.id }, function(err, place) {
    Game.findOne({ _id: place.gameId }, function(err, game) {
      if (game && game.isEditable(req.user)) {
        Place.find({ gameId: place.gameId }, function(err, places) {

          // code duplication on purpose
          nodes = [];
          edges = [];

          places.forEach(function(place) {
            nodes.push({ data: { id: place._id + '', content: place.content + '' } });
            place.actions.forEach(function(action) {
              if (action.link !== undefined) {
                edges.push({ data: { source: place._id + '',
                                     target: action.link + '',
                                     label: action.body + '' }})
              }
            });
          });

          nodes = util.inspect(nodes);
          edges = util.inspect(edges);

          var gameUrl = req.protocol + '://' + req.get('host') + '/places/' + game.theBeginning;
          res.render('places/edit', { title: title + " | " + game.name, place: place, places: places,
            err: err, nodes: nodes, edges: edges, gameUrl: gameUrl });
        });
      } else {
        res.status('403').redirect('/login');
      }
    });
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
          Place.remove({ _id: req.params.id }, function(err, place) {
            res.redirect('/places/design/' + gameId);
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
