var express = require('express');
var router = express.Router();

var Place = require('../schemas/place');

router.get('/', function(req, res, next) {
  Place.findOne({ content: "The beginning..." }, function(err, place) {
    res.render('index', { title: 'Take me from', place: place });
  });
});

module.exports = router;
