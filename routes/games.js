var express = require('express');
var mongoose = require('mongoose');
var util = require('util');
var router = express.Router();

var Game = require('../schemas/game');
var Place = require('../schemas/place');
var Action = require('../schemas/action');

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
        res.redirect('/games/' + game._id)
      });
    }
  });
});

router.get('/:id/:placeToEditId?', function(req, res) {
  Game.findOne({ _id: req.params.id }, function(err, game) {
    if (game && game.isEditable(req.user)) {

      Place.find({ gameId: req.params.id }, function(err2, places) {

        nodes = [];
        edges = [];

        places.forEach(function(place) {
          node = { data: { id: place._id + '', content: place.content + '' } }
          nodes.push(node);
        });

        Action.find({ gameId: req.params.id }, function(err3, actions) {
          actions.forEach(function(action) {
            edges.push({ data: { source: action.source + '',
                                 target: action.target + '',
                                 content: action.content + '',
                                 id: action.id + '' }})
          });

          nodes = util.inspect(nodes);
          edges = util.inspect(edges);
          theBeginning = util.inspect({ id: game.theBeginning + ''});

          placeToEdit = {};
          if (req.params.placeToEditId) {
            placeToEdit = { id: req.params.placeToEditId + '' };
          }

          res.render('places/index', { title: title + " | " + game.name,
                                       game: game,
                                       err: err + err2 + err3,
                                       nodes: nodes,
                                       edges: edges,
                                       placeToEdit: util.inspect(placeToEdit),
                                       theBeginning: theBeginning }
          );
        });
      });
    } else {
      res.status('403').redirect('/login');
    }
  });
});


module.exports = router;
