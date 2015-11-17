var express = require('express');
var mongoose = require('mongoose');
var util = require('util');
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
    res.render('places', { title: 'Places', places: places, place: place, err: err }
    );
  });
});

router.post('/create', function(req, res) {
  var params = req.body;
  Place(params).save(function(err, place) {
    if (err) {
      res.send(err);
    } else {
      Place.find({}, function(err, places) {
        res.render('places', { title: 'Places', places: places, err: err }
        );
      });
    }
  });
});

router.post('/update', function(req, res) {
  id = req.body._id;
  delete req.body._id;

  Place.update({ _id: id }, req.body, function(err, place) {
    console.log(req.body);
    if (err) {
      res.render('edit', { place: req.body, err: err });
    } else {
      res.redirect('/places');
    }
  });
});

router.get('/:id/edit', function(req, res) {
  Place.findOne({ _id: req.params.id }, function(err, place) {
    Place.find({}, function(err, places) {
      res.render('edit', { title: 'Place', place: place, places: places, err: err });
    });
  });
});

router.get('/:id', function(req, res) {
  Place.findOne({ _id: req.params.id }, function(err, place) {
    res.render('place', { title: 'Place', place: place });
  });
});

module.exports = router;
