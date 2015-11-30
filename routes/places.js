var express = require('express');
var util = require('util');
var async = require('async');
var router = express.Router();

var Place = require('../schemas/place');
var title = "Places | Take me from";

router.get('/design/:gameId', function(req, res) {
  var place = new Place({ content: "", gameId: req.params.gameId,
    actions: [{body: "", link: ""}, {body:"", link:""}]});

  Place.find({ gameId: req.params.gameId }, function(err, places) {

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
    res.render('places/index', { title: title,
      places: places, place: place, err: err, nodes: nodes, edges: edges }
    );
  });
});

router.post('/create', function(req, res) {
  var params = req.body;

  filteredActions = req.body.actions.filter(function(e) { return e.body !== ''})
  req.body.actions = filteredActions;

  async.series([
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
});

router.get('/:id/edit', function(req, res) {
  Place.findOne({ _id: req.params.id }, function(err, place) {
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

      res.render('places/edit', { title: title, place: place, places: places,
        err: err, nodes: nodes, edges: edges });
    });
  });
});

router.get('/:id/destroy', function(req, res) {
  Place.findOne({ _id: id}, function(err, place) {
    gameId = place.gameId;
    Place.remove({ _id: req.params.id }, function(err, place) {
      res.redirect('/places/design/' + gameId);
    });
  });
});

router.get('/:id', function(req, res) {
  Place.findOne({ _id: req.params.id }, function(err, place) {
    checkedActions = [];

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
        res.render('places/show', { title: title, place: place, actions: checkedActions });
      }
    ]);
  });
});

module.exports = router;
