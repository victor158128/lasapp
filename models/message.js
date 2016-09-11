var mongoose = require('mongoose');
// User Schema
var MessageSchema = mongoose.Schema({
    postid: {
      type: String,
      index: true,
      required: true
    },
    replyid: {
      type: String,
      required: true

    },
    owner: {
        type: String,
        required: true
    },
    message:{
      type:String,
      required: true

    },
    class:{
      type:String,
      required: true
    },
    room: {
      type:String
    },
    options:{
      type: Object
    },
    likes:{
      type:String,
      required: true
    },
    key:{
      type: String,
      required: true
    }

},
{
  timestamps: true
});
var Message = module.exports = mongoose.model('messages', MessageSchema);
