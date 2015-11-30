var mongoose = require('mongoose');

// Places documents
var Schema = mongoose.Schema;

var ActionSchema = new Schema({
    _id: false,
    body: String,
    link: Schema.Types.ObjectId
});

var PlaceSchema = new Schema({
    content: String,
    actions: [ActionSchema]
});

module.exports = mongoose.model('Place', PlaceSchema, 'places');
