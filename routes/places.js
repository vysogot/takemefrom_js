var express = require('express');
var mongoose = require('mongoose');
var util = require('util');
var async = require('async');
var router = express.Router();

// Places documents
var Schema = mongoose.Schema;

var PlaceSchema = new Schema({
    content: String,
    actions: [
      {
        _id: false,
        body: String,
        link: Schema.Types.ObjectId,
      }
    ]
});

var Place = mongoose.model('places', PlaceSchema);


/* GET users listing. */
router.get('/', function(req, res) {
  var place = new Place({ content: "", actions: [{body: "", link: ""}, {body:"", link:""}]});
  Place.find({}, function(err, places) {

    elements = {};
    nodes = [];
    edges = [];

    places.forEach(function(place) {
      nodes.push({ data: { id: place._id + '' } });
      place.actions.forEach(function(action) {
        if (action.link !== undefined) {
          edges.push({ data: { source: place._id + '',
                               target: action.link + '' }})
        }
      });
    });

    nodes = util.inspect(nodes);
    edges = util.inspect(edges);
    res.render('places', { title: 'Places',
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
        }
      }, done);
    },

    function(done) {
      Place(params).save(function(err, place) {
        if (err) {
          res.send(err);
        } else {
          Place.find({}, function(err, places) {
            res.redirect('/places')
          });
        }
      });
      done();
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
    }
  }, function() {
    Place.update({ _id: id }, req.body, function(err, place) {
      if (err) {
        Place.find({}, function(err, places) {
          res.render('edit', { title: 'Edit', place: req.body, places: places, err: err });
        });
      } else {
        res.redirect('/places');
      }
    });
  });
});

router.get('/:id/edit', function(req, res) {
  Place.findOne({ _id: req.params.id }, function(err, place) {
    Place.find({}, function(err, places) {
      res.render('edit', { title: 'Place', place: place, places: places, err: err });
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
    res.render('place', { title: 'Place', place: place });
  });
});

module.exports = router;
