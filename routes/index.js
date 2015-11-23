var express = require('express');
var router = express.Router();

var Place = require('../schemas/place');

router.get('/', function(req, res, next) {
  Place.findOne({ content: "The beginning..." }, function(err, place) {
    if (place) {
      res.render('index', { title: 'Take me from', href: '/places/' + place._id, link: 'Play' });
    } else {
      res.render('index', { title: 'Take me from', href: '/places/', link: 'Create' });
    }
  });
});

module.exports = router;
