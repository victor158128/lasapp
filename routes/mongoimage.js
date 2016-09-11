var express = require('express');
var router = express.Router();
 var fs = require('fs');
var mongoose = require('mongoose');

 var Schema = mongoose.Schema;


 // img path
 var imgPath = 'C:/Users/jamie/Pictures/Logitech Webcam/Picture 8.jpg';




router.post('/imagesubmit', function (req, res, next) {

    console.log(req.user);
    var newpic = new Picture();
    newpic.name = 'jamie';
    newpic.img.data = fs.readFileSync(imgPath);
    newpic.img.contentType = 'image/jpg';

    newpic.save(function (err, a) {
             if (err) throw err;
             console.log('saved img to mongo');
    });
    res.send(newpic);
    //res.contentType(newpic.img.contentType);
    //console.log(newpic.img.data);
   //res.send(newpic.img.data);



});

module.exports = router;
