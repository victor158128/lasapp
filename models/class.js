
var mongoose = require('mongoose');
// User Schema
var ClassSchema = mongoose.Schema({
    classname: {
        type: String,
        index: true,
        required: true
    },
    classcode: {
        type: String,
        required: true
    },
    prof: {
      type: String,
      required: true
    },

    description: {
      type: String,
      required: true

    }
});


var Class = module.exports = mongoose.model('classes', ClassSchema);

module.exports.getClassByName = function (name, callback) {
    var query = { class:name};
    Class.findOne(query, callback);
}



module.exports.getClassById = function (id, callback) {
    Class.findById(id, callback);
}
