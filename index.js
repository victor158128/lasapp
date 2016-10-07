
var express = require('express')
  , app = express()
  , http = require('http').Server(app)
  , io = require('socket.io')(http);
  var exphbs = require('express-handlebars');
  var session = require('express-session');
  var expressValidator = require('express-validator');
  var path = require('path');
  var favicon = require('serve-favicon');
  var logger = require('morgan');
  var cookieParser = require('cookie-parser');
  var bodyParser = require('body-parser');
  var mongoose = require('mongoose');
  var MongoStore = require('connect-mongo/es5')(session);
  var mongo = require('mongodb').MongoClient;
  var passport = require('passport');
  var LocalStrategy = require('passport-local').Strategy;

  var routes = require('./routes/start');
  var users = require('./routes/users');
  var fserver = require('./routes/fserver');
  var mongoimage = require('./routes/mongoimage');
var databaseloader = require('./routes/databaseloader');

//mongoose.Promise = global.Promise;

//mongoose.connect('mongodb://localhost:27017/lasapp');

mongoose.connect('mongodb://simon:123456@ds145325.mlab.com:45325/chatapp');

var class_ = require('./models/class');
var file_ = require('./models/file');
var message_ = require('./models/message');
var user_ = require('./models/user');
var keys_ = require('./models/keys');

var port = process.env.PORT || 4000;
http.listen(port, function() {
    console.log('Server running on port ' + port);
});


var usernames = {};
var rooms = [];
var counter = 0;

//var selects = [];

class_.find({}, function(err, classes) {
  console.log(classes);
  for(var i = 0; i <classes.length; i++) {
    console.log(classes[i].classname);
    rooms.push(classes[i].classname);
    //selects.push('<option value="'+topics[i].topic+'">'+topics[i].topic+'</option>');
  }

  });






io.on('connection', function(socket)
{

console.log('connected');
  // when the client emits 'adduser', this listens and executes
  socket.on('adduser', function(username){
    // store the username in the socket session for this client
    socket.username = username;
    // store the room name in the socket session for this client
  //  socket.room = 'room1';
    // add the client's username to the global list
    usernames[username] = username;

    counter = counter + 1;
    // send client to room 1
  //  socket.join('room1');
    // echo to client they've connected
    //socket.emit('updatechat', 'SERVER', 'you have connected to room1');
    // echo to room 1 that a person has connected to their room
  //  socket.broadcast.to('room1').emit('updatechat', 'SERVER', username + ' has connected to this room');
    //socket.emit('updaterooms', rooms, 'room1');
  });

  socket.on('change_user', function (username,old) {
    // we tell the client to execute 'updatechat' with 2 parameters
    socket.username = username;

    usernames[old] = username;
  });

  function generateUUID() {
  	var d = new Date().getTime();
  	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
  			var r = (d + Math.random()*16)%16 | 0;
  			d = Math.floor(d/16);
  			return (c=='x' ? r : (r&0x3|0x8)).toString(16);
  	});
  	return uuid;
  }
  // when the client emits 'sendchat', this listens and executes
  socket.on('sendchat', function (data,sent_class,ops, key_in) {
    // we tell the client to execute 'updatechat' with 2 parameters

    user_.findOne({username:socket.username}, function(err,user) {
        //console.log(">>>"+socket.username);
    //  console.log("<<<"+user);
    //  console.log("NAME: "+user.fname+" "+user.lname);
      var post_id =generateUUID();
      var comment_id = generateUUID();
      //console.log("HHH"+key_in);
      var newMessage = new message_({
          postid: post_id,
          replyid: comment_id,
          owner:  user.fname+" "+user.lname,
          message: data,
          class: sent_class,
          options:ops,
          room: socket.room,
          likes:"0",
          key: key_in+','+user.fname+" "+user.lname,
          type: user.type

      });

      newMessage.save(function (err) {
        if (err) {
          return err;
        }
        else {
          console.log("Post saved");
        }
      });

         var d_button = '<button class="delete_button">delete</button>';

        io.sockets.in(socket.room).emit('updatechat', user.fname+" "+user.lname,sent_class, data,counter,post_id,comment_id, user.type);

      });
});

socket.on('deletepost',  function(pid) {
  message_.find({postid:pid}).remove().exec();
  io.sockets.in(socket.room).emit('deletepost', pid);
});

  socket.on('senddescription', function (des) {
    io.sockets.in(socket.room).emit('updatedescription', des);
  });

  socket.on('sendcomment', function (comment,comment_id,post_uid, key_in) {

    user_.findOne({username:socket.username}, function(err,user) {
      var c_id = generateUUID();
      var newMessage = new message_({
          postid: post_uid,
          replyid: comment_id,
          owner: user.fname+" "+user.lname,
          message: comment,
          class: "whole_comment",
          room: socket.room,
          options:c_id,
          likes:"0",
          key: key_in+','+user.fname+" "+user.lname,
          type: user.type

      });
      newMessage.save(function (err) {
        if (err) {
          return err;
        }
        else {
          console.log("Post saved");
        }
      });

         io.sockets.in(socket.room).emit('updatecomment', user.fname+" "+user.lname,comment, comment_id, c_id,user.type);

      });

  });


socket.on ('updatelike', function(post_uid,operator,post_class){

if(operator ==1 || operator == -1){



if(post_class=="comment_box"){

  message_.findOne({options: post_uid}, function(err,obj) {

      var iterate = parseInt(obj.likes)+operator;
    message_.findOneAndUpdate({options: post_uid},{"likes": iterate } ,{new: true},function(err,obj) {
        console.log('EMIT TO CLIENT COMMENT');
        var user_stored = '"type":"comment","post":"'+post_uid+'"'
      storeUserModedHtml(socket.username,"{"+user_stored+',"replacer":"checked"}','comment',post_uid,operator,function(fini){


        io.sockets.in(socket.room).emit('updatelike', post_uid, iterate ,post_class,operator);
      });

    });
  });
}

  else{

    message_.findOne({postid: post_uid}, function(err,obj) {


      console.log('EMIT TO CLIENT POST');
var iterate = parseInt(obj.likes)+operator;
      var user_stored = '"type":"thread","post":"'+post_uid+'"'
message_.findOneAndUpdate({postid: post_uid},{"likes":iterate} ,{new: true},function(err,obj) {
  //console.log(obj);

  //socket.emit('updatelike', post_uid,interate ,post_class);
    storeUserModedHtml(socket.username,"{"+user_stored+',"replacer":"checked"}','thread',post_uid,operator,function(finish){

      io.sockets.in(socket.room).emit('updatelike', post_uid,iterate ,post_class,operator);
    });

});

    });
  }
}

  });

socket.on('updatepoll', function (post_uid,chose,operator,quest) {

  if(operator ==1 || operator == -1){

    message_.findOne({postid: post_uid}, function(err,obj) {
  var poll_data = JSON.parse(obj.options);
  //console.log(Object.keys(poll_data.poll_info[0].votes[0]));
  //console.log(poll_data.poll_info[0].votes.length);


  for(var i=0;i<poll_data.poll_info[0].votes.length;i++){
    if(Object.keys(poll_data.poll_info[0].votes[i])[0] ==chose){
      if(poll_data.poll_info[0].votes[i][chose]>0 || (poll_data.poll_info[0].votes[i][chose]==0&&operator==1) ){
      var chosed_check = parseInt(poll_data.poll_info[0].votes[i][chose])+operator;
      poll_data.poll_info[0].votes[i][chose] = chosed_check;
  message_.findOneAndUpdate({postid: post_uid}, {"options":JSON.stringify(poll_data)},{new: true}, function (err, message) {
   var data3 = JSON.parse(message.options);
   var accumulator = 0;
   var names = [];
   //console.log(data3);

  for(var x=0;x<data3.poll_info[0].votes.length;x++){
  accumulator = accumulator+parseInt(data3.poll_info[0].votes[x][ Object.keys(data3.poll_info[0].votes[x])[0] ]);
  }
  //console.log(accumulator);

  var poll_front = '<span class="question">'+quest+'</span>';
  var checkbox_strings = '';
  var user_stored = '"type":"poll","post":"'+post_uid+'"'
  var html_resovoir='';
  for(var x=0;x<data3.poll_info[0].votes.length;x++){
  var per = (parseInt(data3.poll_info[0].votes[x][ Object.keys(data3.poll_info[0].votes[x])[0] ])/accumulator)*100;
  var vari = Object.keys(data3.poll_info[0].votes[x])[0];
  names.push('{"'+vari+'":"'+per+'"}');
  var number = Math.round(accumulator*per/100);
  if(vari ==chose){
    //console.log("pushing:"+vari);
      html_resovoir = vari;
  checkbox_strings = checkbox_strings + '<div class="checkbox" value="'+vari+'">\
    <label><input type="checkbox" class="checkbox_class" value="'+vari+'">'+vari+'</label>\
      <div class="progress">\
        <div class="progress-bar" role="progressbar" aria-valuenow="70"\
          aria-valuemin="0" aria-valuemax="100" style="width:'+Math.floor(per)+'%">\
          '+number+' ('+Math.floor(per)+'%)\
        </div>\
      </div>\
    </div> ';
  }
  else{
    checkbox_strings = checkbox_strings + '<div class="checkbox" value="'+vari+'">\
      <label><input type="checkbox" class="checkbox_class" value="'+vari+'">'+vari+'</label>\
        <div class="progress">\
          <div class="progress-bar" role="progressbar" aria-valuenow="70"\
            aria-valuemin="0" aria-valuemax="100" style="width:'+Math.floor(per)+'%">\
            '+number+' ('+Math.floor(per)+'%)\
          </div>\
        </div>\
      </div>';
  }
}
  storeUserModedHtml(socket.username,"{"+user_stored+',"replacer":"'+html_resovoir +'"}','poll',post_uid,operator,function(finish){
    var packaged_percentages ='{"percents":['+names+']}'
    //console.log("finished: "+packaged_percentages);
    io.sockets.in(socket.room).emit('updatepoll',post_uid,JSON.parse(packaged_percentages), accumulator);

    var packaged ='{"poll_info":['+JSON.stringify(data3.poll_info[0])+',{"percents":['+names+']}]}';
    //console.log( packaged );
    message_.findOneAndUpdate({postid: post_uid}, {"options":packaged,message:poll_front+checkbox_strings},{new: true}, function (err, message) {

      });
  });



    });
    }

    }


  }

    });

  }

});



function storeUserModedHtml(username_in,replacer,type,post_id,operator,callback){

user_.findOne({username:username_in}, function(err, user) {



  if(user.htmlmod ==''|| JSON.parse(user.htmlmod).modded ==''){
    //console.log("IN IF ");
    var modded = '{"modded":['+replacer+']}'
    //console.log(modded);
    user_.findOneAndUpdate({username:username_in}, {"htmlmod":modded},{new: true}, function (err, message) {

      });
  }
  else{

//console.log(user.htmlmod);


  //console.log("1");
    var mod = JSON.parse(user.htmlmod);
      //console.log("2: ");
    var new_replace = JSON.parse(replacer);
    //  console.log("3 " );

    var arr = JSON.parse(user.htmlmod).modded;
    //console.log(arr);
    var found = false;

    //console.log("arr size: "+arr.length);


var i =0;
    (function checkExisting(i) {

//console.log("type "+arr[i].type);
//console.log("type "+type);

//console.log("post "+arr[i].post);
//console.log("post "+ post_id );
      if(type == arr[i].type && post_id ==arr[i].post){
      //if(post_id ==arr[i].post){
      //console.log("EQUAL");
        var old_replace = arr[i].replacer;
        found = true;
      //  console.log("old replace: "+old_replace.toString());
        //console.log("DOES , exist: "+old_replace.toString().indexOf(','));
        if (old_replace.toString().indexOf(',') != -1) {
          //console.log("splitting: "+old_replace);

        var ora = old_replace.toString().replace(/[" ]+/g, " ").trim().split(',');
  //console.log("NOW: "+ora);
        //console.log("ora length: "+ora.length);
        var x =0;
        var found_r = false;

        (function checkExisting(x) {
          //console.log("--->x: "+x);
          if(x==ora.length){
            //console.log("************found: "+found_r+" operator: "+operator);
            if(found_r == false && operator ==1){

              ora.push(new_replace.replacer);
              //console.log("pushed: "+ora);
            arr[i].replacer = ora;

            }
            else if(found_r == true && operator ==-1 ){

              var c = ora.indexOf(new_replace.replacer);
                //console.log("Not FOund: "+c);
              if(c != -1) {
                //arr[i]

              	ora.splice(c, 1);
                //console.log("updated: "+ora);
                  arr[i].replacer = ora;
               //arr[i].replacer = ora.toString();

              //  console.log("updated: "+ora);
              }

            }

          }
          else{

            if(ora[x]==new_replace.replacer){
                found_r = true;
            }
            x = x+1;
            checkExisting(x);
          }

        })(x);


        }
        else{
          //console.log("old: "+arr[i].replacer+" new: "+new_replace.replacer);
          if(new_replace.replacer != arr[i].replacer && operator==1){
            //console.log("Adding selected option: "+arr[i].replacer +","+new_replace.replacer);
            arr[i].replacer =arr[i].replacer +","+new_replace.replacer;

            //console.log("--> "+arr[i].replacer);
            /*
            user_.findOneAndUpdate({username:username_in},{"htmlmod":JSON.stringify(mod)}, function(err, user) {
              console.log("replaced existing found");
              });
              */
          }
          else if(new_replace.replacer == arr[i].replacer && operator==-1){
            arr.splice(i, 1);
            i = i-1;
            //console.log("arr: "+arr);
          }


        }


      }
  //else{
  //console.log("i: "+i+" arr: "+arr.length);
       if(i>=arr.length-1){
         //console.log(">>>>***********found: "+found+" operator: "+operator);
         if(found == false && operator ==1){
           arr.push(new_replace)

            //console.log("done");
//'{"modded":['+replacer+']}'
           user_.findOneAndUpdate({username:username_in},{"htmlmod":'{"modded":'+JSON.stringify(arr)+'}'}, function(err, user) {
             callback("finished");
             });

         }

         else{
           //console.log("Updateing changes "+user.htmlmod);
           user_.findOneAndUpdate({username:username_in},{"htmlmod":'{"modded":'+JSON.stringify(arr)+'}'}, function(err, user) {
             callback("finished");
             });
         }

       }


       else{
         //console.log("checking i: "+i);
         i = i+1;
         checkExisting(i)
       }



 })(i);



  }


  });

}





  socket.on('switchRoom', function(newroom){
    // leave the current room (stored in session)
    socket.leave(socket.room);
    // join new room, received as function parameter
    socket.join(newroom);

    //socket.emit('updatechat', 'SERVER', 'you have connected to '+ newroom,counter);
    // sent message to OLD room
    //socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room',counter);
    // update socket session room title
    socket.room = newroom;
  //  socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined this room',counter);
    //get users and put in here
    socket.emit('updaterooms', rooms, newroom,counter);

  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function(){
    // remove the username from global usernames list
    delete usernames[socket.username];
    // update list of users in chat, client-side
    io.sockets.emit('updateusers', usernames);
    // echo globally that this client has left
    counter = counter - 1;
    //socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected',counter);
    socket.leave(socket.room);

  });


});

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({ defaultLayout: 'layout3' }));
app.set('view engine', 'handlebars');

// BodyParser Middleware
app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(express.bodyParser({ uploadDir: 'D:/developer stuff/uploads' }));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));


app.use(session({
    secret: 'y7y37dy2387y873ydyui7',
    //store: new MongoStore({ mongooseConnection: mongoose.connection }),
    saveUninitialized: true,
    resave: true
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
      , root = namespace.shift()
      , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param : formParam,
            msg   : msg,
            value : value
        };
    }
}));



app.use('/', routes);
app.use('/users', users);
app.use('/fserver', fserver);
app.use('/mongoimage', mongoimage);
app.use('/dbl', databaseloader);

module.exports = app;
