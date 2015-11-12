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
        body: { type: String },
        link: Schema.Types.ObjectId,
      }
    ]
});

var Place = mongoose.model('places', PlaceSchema);


/* GET users listing. */
router.get('/', function(req, res) {
  Place.find({}, function(err, places) {
    res.render('places', { title: 'Places',
      places: util.inspect(places)}
    );
  });
});

router.get('/:id', function(req, res) {
  Place.findOne({ _id: req.params.id }, function(err, place) {
    res.render('place', { title: 'Place', place: place });
  });
});

router.post('/create', function(req, res) {
  var params = req.body;
  Place(params).save(function(err, place) {
    if (err) {
      res.send(err);
    } else {
      Place.find({}, function(err, places) {
        res.render('places', { title: 'Places',
          places: util.inspect(places)}
        );
      });
    }
  });
});

module.exports = router;
