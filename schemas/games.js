var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var GameSchema = new Schema({
    name: String,
    slug: String,
    places: [PlaceSchema]
})

module.exports = mongoose.model('Game', GameSchema, 'games');
