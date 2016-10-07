var mongoose = require('mongoose');
// User Schema
var KeysSchema = mongoose.Schema({

  type: {
    type: String,
    index: true
  },
  used: {
    type: String
  }


});
var Keys = module.exports = mongoose.model('keys', KeysSchema);
