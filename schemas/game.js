var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var GameSchema = new Schema({
    name: String,
    slug: String,
    theBeginning: Schema.Types.ObjectId
})

module.exports = mongoose.model('Game', GameSchema, 'games');
