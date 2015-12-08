var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ActionSchema = new Schema({
    gameId: Schema.Types.ObjectId,
    source: Schema.Types.ObjectId,
    target: Schema.Types.ObjectId,
    content: String
});

module.exports = mongoose.model('Action', ActionSchema, 'actions');
