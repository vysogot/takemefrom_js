var mongoose = require('mongoose');
var util = require('util');

var Schema = mongoose.Schema;
var GameSchema = new Schema({
    name: String,
    slug: String,
    isPrivate: Boolean,
    userId: Schema.Types.ObjectId,
    theBeginning: Schema.Types.ObjectId
})

GameSchema.methods.isEditable = function(user) {
  if (!this.isPrivate) {
    return true;
  } else {
    if (user && (user._id.toString() === this.userId.toString())) {
      return true;
    } else {
      return false;
    }
  }
}

module.exports = mongoose.model('Game', GameSchema, 'games');
