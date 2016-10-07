var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// User Schema
var UserSchema = mongoose.Schema({
    username: {
        type: String,
        index: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    fname: {
      type: String,
      required: true
    },
    lname: {
      type: String,
      required: true
    },
    aname: {
      type: String
    },
    degree: {
      type: String
    },
    type: {
      type:String
    },
    htmlmod: {
      type: String
    },
    used: {
      type: String
    }
});

var User = module.exports = mongoose.model('users', UserSchema);

/*
module.exports.setRoomByUsername = function (username,room,callback) {
  var query = {'Class':username};
User.findOneAndUpdate(query, {'room':room}, {upsert:false}, function(err, doc){


});


}
*/

module.exports.createUser = function (newUser, callback) {
    console.log('here');
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(newUser.password, salt, function (err, hash) {
            newUser.password = hash;
            newUser.save(callback);
        });
    });
}

module.exports.getUserByUsername = function (username, callback) {
    var query = { username: username };
    User.findOne(query, callback);
}

module.exports.getUserByAnoname = function (username, callback) {
    var query = { username: username };
    User.findOne(query, callback);
}

module.exports.getUserById = function (id, callback) {
    User.findById(id, callback);
}

module.exports.comparePassword = function (candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
        if (err) throw err;
        callback(null, isMatch);
    });
}
