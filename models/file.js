
var mongoose = require('mongoose');
var FileSchema = mongoose.Schema({

    name: {
        type: String,
          index: true
    },
    type: {
        type:String
    },
    location: {
        type:String
    },
    owner: {
        type:String
    }
});
var File = module.exports = mongoose.model('files', FileSchema);
