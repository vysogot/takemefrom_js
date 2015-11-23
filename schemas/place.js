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

var GameSchema = new Schema({
    name: String,
    slug: String,
    places: [PlaceSchema]
})

//var Place = mongoose.model('places', PlaceSchema);

module.exports = mongoose.model( 'Place', PlaceSchema, 'places' );
