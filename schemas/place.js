var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var PlaceSchema = new Schema({
    gameId: Schema.Types.ObjectId,
    isBeginning: Boolean,
    content: String
});

module.exports = mongoose.model('Place', PlaceSchema, 'places');
