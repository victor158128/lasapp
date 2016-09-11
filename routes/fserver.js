var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser'); //connects bodyParsing middleware
var formidable = require('formidable');
var path = require('path');     //used for file path
var fs = require('fs-extra');    //File System-needed for renaming file etc

var f_count = 0;


/* ==========================================================
 bodyParser() required to allow Express to see the uploaded files
============================================================ */


 router.post('/upload', function (req, res, next) {


    var form = new formidable.IncomingForm();

    //Formidable uploads to operating systems tmp dir by default
    var initpath = "./public/img_stores/uploads/";
    form.uploadDir = initpath;       //set upload directory
    form.keepExtensions = true;     //keep file extension

    form.parse(req, function (err, fields, files) {



       // res.writeHead(200, { 'content-type': 'text/plain' });
       // res.write('received upload:\n\n');
        console.log("form.bytesReceived");
        //TESTING
        console.log("file size: " + JSON.stringify(files.fileUploaded.size));
        console.log("file path: " + JSON.stringify(files.fileUploaded.path));
        console.log("file name: " + JSON.stringify(files.fileUploaded.name));
        console.log("file type: " + JSON.stringify(files.fileUploaded.type));
        console.log("astModifiedDate: " + JSON.stringify(files.fileUploaded.lastModifiedDate));

        //Formidable changes the name of the uploaded file
        //Rename the file to its original name

        // console.log('--- ' + fields.pathf + '/' + files.fileUploaded.name);
        // initpath
        var final_path = initpath+ fields.pathf+"/file"+f_count+"."+(files.fileUploaded.name).split('.').pop();


        console.log(final_path);
        fs.rename(files.fileUploaded.path, final_path , function (err) {
            if (err)
                throw err;
            console.log('renamed complete');
            res.send("http://localhost:4000/img_stores/uploads/Lobby/"+"file"+f_count+"."+(files.fileUploaded.name).split('.').pop());
  f_count = f_count + 1;
        });
        //res.end();
        //res.render("fshow", { logout: ' <li role="presentation"><a id="logout" href="/users/Logout">Logout</a></li>' });
    });
});



router.post('/upload_profile_picture', function (req, res, next) {


    var form = new formidable.IncomingForm();

    //Formidable uploads to operating systems tmp dir by default
    var initpath = "./public/img_stores/profile/";
    form.uploadDir = initpath;       //set upload directory
    form.keepExtensions = true;     //keep file extension

    form.parse(req, function (err, fields, files) {



        // res.writeHead(200, { 'content-type': 'text/plain' });
        // res.write('received upload:\n\n');
        console.log("form.bytesReceived");
        //TESTING
        console.log("file size: " + JSON.stringify(files.fileUploaded.size));
        console.log("file path: " + JSON.stringify(files.fileUploaded.path));
        console.log("file name: " + JSON.stringify(files.fileUploaded.name));
        console.log("file type: " + JSON.stringify(files.fileUploaded.type));
        console.log("astModifiedDate: " + JSON.stringify(files.fileUploaded.lastModifiedDate));



        // Retrieve
        var MongoClient = require('mongodb').MongoClient;
        MongoClient.connect("mongodb://localhost:27017/geofam", function (err, db) {
            db.collection('profile', function (error, collection) {
                if (err) { return console.dir(err); }
                //collection.save({ user: req.user._id, img_path: files.fileUploaded.path }, { w: 1 }, callback)
                /*
                collection.update(query, setData, { upsert: true }, function (err, nAffected, raw) {
                    if (err) throw err;
                    console.dir(raw);

                });
                */
                var p_file = '';
                //files.fileUploaded.name
                if (files.fileUploaded.name.indexOf('.') !== -1) {
                    p_file = req.user._id + '.' + files.fileUploaded.name.split(".")[1];
                    fs.rename(files.fileUploaded.path, initpath + p_file, function (err) {
                        if (err)
                            throw err;
                        console.log('renamed complete');
                    });
                }

                collection.update(
                    { '_id' : req.user._id},
                {
                        $set: {
                            'user': req.user._id,
                            'picture':'http://localhost:1337/img_stores/profile/'+ p_file
                        }
                    },
                { upsert: true },
                function (err, result) {
                        if (err) throw err;
                        console.log(result);
                    })



            });
        });
        //console.log(req.user._id);
        // Connect to the db
        /*
        MongoClient.connect("mongodb://localhost:27017/geofam", function (err, db) {
            if (err) { return console.dir(err); }

            db.collection('users', function (error, collection) {
                //collection.find({_id:justId}),function(err, docs) { // <== This will not work
                collection.findOne({ _id: req.user._id}, function (err, docs) {
                    console.log("Printing docs from Array. count " + JSON.stringify(docs));
                });
            });


        });
        */


    });
});


module.exports = router;
