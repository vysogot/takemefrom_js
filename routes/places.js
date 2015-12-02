var express = require('express');
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
                                   label: action.body + '' }})
            }
          });
        });

        nodes = util.inspect(nodes);
        edges = util.inspect(edges);


        var gameUrl = req.protocol + '://' + req.get('host') + '/places/' + game.theBeginning;
        res.render('places/index', { title: title + " | " + game.name, gameUrl: gameUrl,
          places: places, place: place, err: err + err2, nodes: nodes, edges: edges }
        );
      });
    } else {
      res.status('403').redirect('/login');
    }
  });
});

router.post('/create', function(req, res) {
  var params = req.body;

  filteredActions = req.body.actions.filter(function(e) { return e.body !== ''})
  req.body.actions = filteredActions;

  async.series([
    function(callback) {
      Game.findOne({ _id: params.gameId }, function(err, game) {
        if (game && !game.isEditable(req.user)) {
          res.redirect(403, '/login');
        }
      });

      callback();
    },

    function(done) {
      async.each(params.actions, function(action, callback) {
        if (action.link === '') {
          newPlace = { content: 'Post - ' + action.body, gameId: params.gameId, actions: [] }
          Place(newPlace).save(function(err, place) {
            action.link = place._id;
            callback();
          });
        } else {
          callback();
        }
      }, done);
    },

    function(callback) {

      Place(params).save(function(err, place) {
        if (err) {
          res.send(err);
        } else {
          Place.find({}, function(err, places) {
            res.redirect('/places/design/' + place.gameId)
          });
        }
      });
      callback();
    }
  ]);
});

router.post('/update', function(req, res) {
  id = req.body._id;
  delete req.body._id;

  filteredActions = req.body.actions.filter(function(e) { return e.body !== ''})
  req.body.actions = filteredActions;

  async.series([
    function(callback) {
      Game.findOne({ _id: req.body.gameId }, function(err, game) {
        if (game && !game.isEditable(req.user)) {
          res.status('403').redirect('/login');
          return callback('stop');
        } else {
          callback();
        }
      });
    },

    function(done) {
      async.each(req.body.actions, function(action, callback) {
        if (action.link === '') {
          newPlace = { content: 'Post - ' + action.body, gameId: req.body.gameId, actions: [] }
          Place(newPlace).save(function(err, place) {
            action.link = place._id;
            callback();
          });
        } else {
          callback();
        }
      }, function() {

        Place.update({ _id: id }, req.body, function(err, place) {
          if (err) {
            res.send(err);
          } else {
            Place.findOne({ _id: id}, function(err, place) {
              res.redirect('/places/design/' + place.gameId);
            });
          }
        });
      });
      done();
    }
  ]);
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
