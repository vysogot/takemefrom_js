var express = require('express');
var util = require('util');
var async = require('async');
var router = express.Router();

var Place = require('../schemas/place');
var title = "Places | Take me from";

router.get('/', function(req, res) {
  var place = new Place({ content: "", actions: [{body: "", link: ""}, {body:"", link:""}]});
  Place.find({}, function(err, places) {

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

  async.series([
    function(done) {
      async.each(params.actions, function(action, callback) {
        if (action.body !== '' && action.link === '') {
          Place({ content: 'Post - ' + action.body, actions: [] }).save(function(err, place) {
            action.link = place._id;
            callback();
          });
        } else {
          callback();
        }
      }, done);
    },

    function(callback) {
      filteredActions = req.body.actions.filter(function(e) { return e.body !== ''})
      req.body.actions = filteredActions;

      Place(params).save(function(err, place) {
        if (err) {
          res.send(err);
        } else {
          Place.find({}, function(err, places) {
            res.redirect('/places')
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

  async.each(req.body.actions, function(action, callback) {
    if (action.body !== '' && action.link === '') {
      Place({ content: 'Post - ' + action.body, actions: [] }).save(function(err, place) {
        action.link = place._id;
        callback();
      });
    } else {
      callback();
    }
  }, function() {
    filteredActions = req.body.actions.filter(function(e) { return e.body !== ''})
    req.body.actions = filteredActions;

    Place.update({ _id: id }, req.body, function(err, place) {
      if (err) {
        res.send(err);
      } else {
        res.redirect('/places');
      }
    });
  });
});

router.get('/:id/edit', function(req, res) {
  Place.findOne({ _id: req.params.id }, function(err, place) {
    Place.find({}, function(err, places) {

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

      res.render('places/edit', { title: title, place: place, places: places, err: err, nodes: nodes, edges: edges });
    });
  });
});

router.get('/:id/destroy', function(req, res) {
  Place.remove({ _id: req.params.id }, function(err, place) {
    res.redirect('/places');
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
