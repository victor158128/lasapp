var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var Key = require('../models/keys');
var fs = require('fs');
var multer = require('multer');
var upload = multer({
    dest: './public/uploads/',
});
var checkEmail = require('legit');

var lin = '<li role="presentation"><a id="login" href="/users/login">Login</a></li>';
var lout = '<li role="presentation"><a id="logout" href="/users/Logout">Logout</a></li>';

var anon_users = 0;
var selects = [];
selects.push('<option value="Physics">'+'Physics'+'</option>');

var User_ = require('../models/user');
var class_ = require('../models/class');
var message_ = require('../models/message');
var keys_ = require('../models/keys');


router.post('/findentry', function(req, res) {
  //console.log("FINDENTRY:"+req.body.kw);
  message_.find({"key":{ "$regex": req.body.kw, "$options": "i" }}, function(err, messages) {
    //console.log("KW:"+req.body.kw);
    //console.log("KEY::"+messages);
    var arr = [];

    for (var i = 0;i<messages.length;i++){
      //arr.push( '<div style="display: none;" id="'+messages[i].postid+'">'+messages[i].key.substring(0,20)+ '</div>');
      var isolated_key = messages[i].key.split(',')[0];
      //console.log("ISO KEY:"+isolated_key);
      arr.push ('{"pid":"'+messages[i].postid+'","key":"'+isolated_key.substring(0,20)+'"}');

    }

    var json_entries = '{"ent":['+arr.toString()+']}';
    //console.log(arr.toString());
    //var html = parseHTML(arr);
    //console.log(html);
    console.log(json_entries.toString());
    res.json(json_entries);

  }).limit(10);
});

// Register
router.get('/register', function (req, res) {
    var cookie = req.cookies.userid;
  if (req.user || typeof cookie !== 'undefined' ) {
      res.render('register', { logout: lout,profile:'<li role="presentation"><a id="profile" href="/users/profile">'+req.cookies.username+'</a></li>', layout: 'layout2'});

  }
  else {
      res.render('register', { login: lin, layout:'layout2'});
  }

});


router.get('/updatepollfront', function (req, res) {


});


router.get('/findchat', function (req, res) {


  var cookie = req.cookies.userid;

  if (req.user || typeof cookie !== 'undefined' ) {
      res.render('find', { logout: lout,profile:'<li role="presentation"><a id="profile" href="/users/profile">'+req.cookies.username+'</a></li>',select:selects});

  }
  else {
      res.render('find', { login: lin,select:selects });
  }
});

router.post('/setandgo', function (req, res) {
//console.log(req.body.topics);
//User.setRoomByUsername(req.cookies.username,req.body.topics);
User.getUserById(req.cookies.userid, function(err, user) {
//console.log(user.aname);
res.render('multichat',{anon_input:'<input type="hidden" id="anon" value="'+user.aname+'">',user_input:'<input type="hidden" id="fname" value="'+user.fname+'">',class:'Physics', logout: lout,profile:'<li role="presentation"><a id="profile" href="/users/profile">'+req.cookies.username+'</a></li>'});
});

});


router.post('/setDescription', function (req, res) {
  console.log(req.body.ClassName);
  var query = {'classname':req.body.ClassName};
  var new_data = {'description': req.body.description_d}
  class_.findOneAndUpdate(query, new_data, {upsert:true}, function(err, doc){
      if (err) return res.send(500, { error: err });
      return res.send("succesfully saved");
  });
});

router.post('/getDescription', function (req, res) {
  class_.findOne({"classname": req.body.ClassName}, function(err, clas) {
    if (clas == null) {
      res.send("");
    }
    else {
        res.send(clas.description);
      }

    });

});

router.post('/getOverwrite', function (req, res) {
  var cookie = req.cookies.userid;
    if( typeof cookie !== 'undefined'){
    User.getUserById(cookie, function(err, user) {
  var getOver = user.htmlmod;
  res.json(getOver)

      });
  }

});


// Login
router.get('/login', function (req, res) {
  var cookie = req.cookies.userid;
  console.log(cookie);
  if(  typeof cookie == 'undefined')  {
    res.render('login', { login: lin , layout: 'layout2' });
  }
  else {
    res.redirect('PHYS1800');
    //alert("Log out first");
  }
});

// Register User
router.post('/register', function (req, res) {
  //console.log(req.body);

    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;
    var email = req.body.email;
    var keys = req.body.registration_key;

    keys_.findOne({"_id":keys}, function (err, key){
//      for (var i = 0; i < keys_.length; i++) {
//        console.log("HAS PROPER:"+key._id+"   "+key);
//          if (keys == key._id && key.hasOwnProperties("type")) {
//            res.render('register',{reregister:'<b>This key has been activated.</b>',layout:'layout2'});
//          }
//      }
  console.log("USED BEFORE:"+key.used);

    if (key.used == "yes") {
      res.render('register',{reregister:'<b>This key is used already.</b>',layout:'layout2'});
    }
    else if (key == null){
        //console.log("HELLO:"+key);
        res.render('register',{reregister:'<b>This key is not valid.</b>',layout:'layout2'});
      }
      else {
          User.findOne({"username":username}, function (err, user) {
            //console.log("USER:"+user);
             checkEmail(email, function(validation, addresses, err) {

            if (password != password2 ) {
              res.render('register',{reregister:'<b>Passwords don\'t match. Try again.</b>',layout:'layout2'});
            }
            else if (validation != true){
              res.render('register',{reregister:'<b>Email is not valid.</b>',layout:'layout2'});
            }
            else if (user == null) {
              var fname = req.body.firstname;
              var lname = req.body.lastname;
              var newUser = new User({
                  _id: key._id,
                  type: key.type,
                  fname: fname,
                  lname: lname,
                  aname: "anon"+anon_users,
                  email: email,
                  username: username,
                  password: password,
                  htmlmod:'{"modded":[]}',
                  used: "yes",
              });
              anon_users = anon_users+1;
              keys_.findOneAndUpdate({"_id":keys}, {$set:{used:"yes"}}, {new:true}, function(err, doc) {
                if (err) {
                  console.log("something is wrong with updating data");
                }
                console.log(doc);
              });


              User.createUser(newUser, function (err, user) {
                  if (err) throw err;
                  console.log(user);
              });

              res.redirect('/users/login');
            }
            else {
              res.render('register', {reregister:'<b>Username has been taken. Try another.</b>',layout:'layout2'});
            }
          });

        });
    }
});

});
router.get('/failurelogin', function (req, res) {
  var cookie = req.cookies.userid;
  console.log(cookie);
  if(  typeof cookie == 'undefined')  {
    res.render('login', { login: lin , layout: 'layout2', failurelogin:'<b style="color:red;">Username or password incorrect.</b>'});
  }
  else {
    res.redirect('PHYS1800');
    //alert("Log out first");
  }
});

router.post('/login',
  passport.authenticate('local', {
    failureRedirect: 'failurelogin',
    failureFlash:false
}),
  function (req, res) {

    var cookie = req.cookies.userid;
  if (cookie === undefined)
  {
    res.cookie('userid',  req.user.id, { maxAge: 2592000000 });  // Expires in one month
    res.cookie('username',  req.user.username, { maxAge: 2592000000 });  // Expires in one month
  }
  else
 {
   // yes, cookie was already present
   console.log('cookie exists', cookie);
 }


    console.log('GOING IN');
    res.redirect('/users/PHYS1800');
});


router.get('/logout', function (req, res) {
    req.logout();
    res.clearCookie('userid');
    res.clearCookie('username');
    res.redirect('/users/login');
});



router.get('/chat', isLoggedIn, function (req, res) {

      res.render('multichat', { logout: lout,profile:'<li role="presentation"><a id="profile" href="/users/profile">'+req.cookies.username+'</a></li>' });
});


router.get('/profile', isLoggedIn, function (req, res) {
    //console.log(req.session);
    res.render('profile', { logout: lout,profile:'<li role="presentation"><a id="profile" href="/users/profile">'+req.cookies.username+'</a></li>'});
});
/*
router.get('/homepage', isLoggedIn, function (req, res) {

  User.getUserById(req.cookies.userid, function(err, user) {
    //console.log(getPosts());
getPosts("homepage",function(stuff){
console.log(stuff);
  res.render('homepage', {messages:stuff,pname:req.cookies.username,profile_input:'<input type="hidden" id="profile" value="'+user.username+'">',anon_input:'<input type="hidden" id="anon" value="'+user.aname+'">',user_input:'<input type="hidden" id="fname" value="'+user.fname+'">'});
});

})

  //res.render('homepage2', { logout: lout,profile:'<li role="presentation"><a id="profile" href="/users/profile">'+req.cookies.username+'</a></li>' });
});
*/

function getPosts(room,callback){

  message_.find({"class": { $ne: "whole_comment" },"room":room})
       .sort({'updatedAt': 'desc'})

       .exec(function(err,messages) {
          var acc = '';
         var i =0;
           if(messages ==""){
             callback("");
           }
           else{
             console.log("OWNER TYPE:"+messages[i].owner);
           (function getmessages(i) {
          createPost(messages[i].owner,messages[i].class, messages[i].message,messages[i].postid, messages[i].replyid,messages[i].likes,messages[i].type,function(post){
            acc=acc+post;
            console.log("trying "+i);


              if(i==messages.length-1){
                console.log("done");
                callback(acc);
              }
              else{
                i = i+1;
                getmessages(i)
              }
          });


        })(i);
      }
       });
}

function getOnePost(pid,room,callback){

  //console.log("room "+room);
  //console.log("pid " +pid);
  message_.findOne({"class": { $ne: "whole_comment" },"room":room,"postid":pid},function(err,message) {
      //console.log("OWNER:"+message.owner);
            if(message ==""){
             callback("");
           }
           else{
            createPost(message.owner,message.class, message.message,message.postid, message.replyid,message.likes,message.type,function(post){
              //console.log(post);
                 callback(post);
           });

       }

       });
}

function searchPosts(keyword, room,callback){

  message_.find({"class": { $ne: "whole_comment" },"room":room, "key":{ "$regex": keyword, "$options": "i" }})
       .sort({'updatedAt': 'desc'})
       .exec(function(err,messages) {
         var acc = '';
         var i =0;
           //for(var i = 0; i <messages.length; i++) {
           //console.log(messages[i]);
           if(messages ==""){
             callback("");
           }
           else{
           (function getmessages(i) {
          createPost(messages[i].owner,messages[i].class, messages[i].message,messages[i].postid, messages[i].replyid,messages[i].likes,messages[i].type,function(post){
            acc=acc+post;
            console.log("trying "+i);


              if(i==messages.length-1){
                console.log("done");
                callback(acc);
              }
              else{
                i = i+1;
                getmessages(i)
              }
          });


        })(i);
      }

          // }

       });
}

function createPost(username,class_tag, data, post_id, comment_id,likes, user_type, callback){
  //console.log("USER: "+username);

      message_.find({"class":  "whole_comment","replyid":comment_id})
           .sort({'updatedAt': 'desc'})
           .exec(function(err,messages) {

              if(messages =="") {
                if (user_type == 'prof' || user_type == 'developer') {
                  var post = '\
                      <div id="'+post_id+'" class="'+class_tag+'"><div class="user_post"><p style="color:red;">'+username+':</p></div><div class=message_body>'+ data + '<div class="like_area" style="float:right;" ><a class="btn btn-sm btn-primary"><span class="glyphicon glyphicon-thumbs-up"></span></a><span class="counter_post">'+likes+'</span></div>  </div>\
                       <div id="'+comment_id+'" class="comment_box">\
                        <div class="comment_output" >\
                         </div> <input class="comment_input" type="text" placeholder="comment here...">\
                         <button class=comment_button>Comment</button><br></div></div>\
                        ';
                }

                else {
                  var post = '\
                      <div id="'+post_id+'" class="'+class_tag+'"><div class="user_post">'+username+':</div><div class=message_body>'+ data + '<div class="like_area" style="float:right;" ><a class="btn btn-sm btn-primary"><span class="glyphicon glyphicon-thumbs-up"></span></a><span class="counter_post">'+likes+'</span></div>  </div>\
                       <div id="'+comment_id+'" class="comment_box">\
                        <div class="comment_output" >\
                         </div> <input class="comment_input" type="text" placeholder="comment here...">\
                         <button class=comment_button>Comment</button><br></div></div>\
                        ';
                }
                callback(post);
            }

            else{
              var comments = '';
              console.log("THIS:"+username);
              if (user_type == 'prof' || user_type == 'developer') {
                var post = '\
                    <div id="'+post_id+'" class="'+class_tag+'"><div class="user_post"><p style="color:red;">'+username+':</p></div><div class=message_body>'+ data + '<div class="like_area" style="float:right;" ><a class="btn btn-sm btn-primary"><span class="glyphicon glyphicon-thumbs-up"></span></a><span class="counter_post">'+likes+'</span></div>  </div>\
                     <div id="'+comment_id+'" class="comment_box">\
                      <div class="comment_output" >';
              }
              else {
                var post = '\
                    <div id="'+post_id+'" class="'+class_tag+'"><div class="user_post">'+username+':</div><div class=message_body>'+ data + '<div class="like_area" style="float:right;" ><a class="btn btn-sm btn-primary"><span class="glyphicon glyphicon-thumbs-up"></span></a><span class="counter_post">'+likes+'</span></div>  </div>\
                     <div id="'+comment_id+'" class="comment_box">\
                      <div class="comment_output" >';
              }

              for(var i = 0; i <messages.length; i++)
              {
                if (messages[i].type == 'prof' || messages[i].type == 'developer') {
                comments= comments+'<div class="whole_comment" id="'+messages[i].options+'"><span class="user_comment" style="color:red;">'+ messages[i].owner + '</span>: <span class="just_comment">' + messages[i].message + '<span class="like_area" style="float:right;"><a class="btn btn-xs btn-primary"><span class="glyphicon glyphicon-thumbs-up"></span></a><span class="counter_post">'+messages[i].likes+'</span></span></span></div>';
                }
                else {
                  comments= comments+'<div class="whole_comment" id="'+messages[i].options+'"><span class="user_comment">'+ messages[i].owner + '</span>: <span class="just_comment">' + messages[i].message + '<span class="like_area" style="float:right;"><a class="btn btn-xs btn-primary"><span class="glyphicon glyphicon-thumbs-up"></span></a><span class="counter_post">'+messages[i].likes+'</span></span></span></div>';
                }
              }

               post = post+comments+'</div> <input class="comment_input" type="text" placeholder="comment here..."><button class=comment_button>Comment</button><br></div></div>';

               callback(post);
            }
           });
}

router.get('/DEVELOPER', isLoggedIn, function (req, res) {

  User.getUserById(req.cookies.userid, function(err, user) {

    if (user == null) {
      res.clearCookie('userid');
      res.clearCookie('username');
        res.redirect('/users/login');
    }
    else {
      if (user.type == 'developer') {
        getPosts("DEVELOPER",function(stuff){

        //console.log("PRIVILEGE:"+ user.type);
         res.render('DEVELOPER', {desave:'<button class="edit_button" type="submit">Edit</button><button  class="save_description" id="DEVELOPER" type="submit">Save</button>',messages:stuff,pname:user.fname+' '+user.lname,profile_input:'<input type="hidden" id="profile" value="'+user.username+'">',anon_input:'<input type="hidden" id="anon" value="'+user.aname+'">',user_input:'<input type="hidden" id="fname" value="'+user.fname+'">'});
       });
      }
      else {
        //console.log(getPosts());
        getPosts("DEVELOPER",function(stuff){
        //console.log(stuff);
         res.render('DEVELOPER', {messages:stuff,pname:user.fname+' '+user.lname,profile_input:'<input type="hidden" id="profile" value="'+user.username+'">',anon_input:'<input type="hidden" id="anon" value="'+user.aname+'">',user_input:'<input type="hidden" id="fname" value="'+user.fname+'">'});

       });
     }
   }
 });
});


router.get('/PHYS1800', isLoggedIn, function (req, res) {

  User.getUserById(req.cookies.userid, function(err, user) {

    if (user == null) {
      res.clearCookie('userid');
      res.clearCookie('username');
        res.redirect('/users/login');
    }
    else {

    if (user.type == 'prof' || user.type == 'developer') {
      getPosts("PHYS1800",function(stuff){

      //console.log("PRIVILEGE:"+ user.type);
       res.render('PHYS1800', {desave:'<button class="edit_button" type="submit">Edit</button><button  class="save_description" id="PHYS1800" type="submit">Save</button>',messages:stuff,pname:user.fname+' '+user.lname,profile_input:'<input type="hidden" id="profile" value="'+user.username+'">',anon_input:'<input type="hidden" id="anon" value="'+user.aname+'">',user_input:'<input type="hidden" id="fname" value="'+user.fname+'">'});
     });
    }
    else if (user.type == 'student') {
      //console.log(getPosts());
      getPosts("PHYS1800",function(stuff){

       res.render('PHYS1800', {messages:stuff,pname:user.fname+' '+user.lname,profile_input:'<input type="hidden" id="profile" value="'+user.username+'">',anon_input:'<input type="hidden" id="anon" value="'+user.aname+'">',user_input:'<input type="hidden" id="fname" value="'+user.fname+'">'});

     });
   }
 }
  });
});


router.post('/singlem', isLoggedIn, function (req, res) {
  console.log(">>>"+req.body.location);
  getOnePost(req.body.pid, req.body.location, function(stuff){
    res.send(stuff);
    console.log("STUFF:"+stuff);
  });

});

router.post('/multiplem', isLoggedIn, function (req, res) {
  //console.log("");
  //console.log("<<<"+req.body.kw);
   searchPosts(req.body.kw,req.body.location, function(stuff){
    res.send(stuff);
  });

});


function isLoggedIn(req, res, next) {
    //console.log(req.isAuthenticated());
     var cookie = req.cookies.userid;
     /*
    if (req.isAuthenticated()==true) {
        return next();
    }
    else if(req.isAuthenticated()==false){
      res.render('login', { login: lin });
    }
    else if(cookie === undefined){
      res.render('login', { login: lin });
    }
    else {
        return next();
    }
    */

   if(cookie === undefined){
      res.render('login', { login: lin, layout: 'layout2'  });
    }
    else {
        return next();
    }
}


passport.use(new LocalStrategy(
    function (username, password, done) {
        User.getUserByUsername(username, function (err, user) {
            if (err) throw err;
            if (!user) {
                return done(null, false, { message: 'Unknown User' });
            }

            User.comparePassword(password, user.password, function (err, isMatch) {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Invalid password' });
                }
            });
        });
    }));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.getUserById(id, function (err, user) {
        done(err, user);
    });
});



module.exports = router;
