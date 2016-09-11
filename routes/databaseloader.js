var express = require('express');
var router = express.Router();
var message_ = require('../models/message');

router.post('/loadmessages', function (req, res) {



});

function getPosts(){
  message_.find({"class": { $ne: "whole_comment" }})
       .sort({'updatedAt': 'desc'})
       .exec(function(err,messages) {
           for(var i = 0; i <messages.length; i++) {
           console.log(messages[i]);
           createPost(messages[i].owner,messages[i].class, messages[i].message,messages[i].postid, messages[i].replyid);
           }
       });
}


function createPost(username,class_tag, data, post_id, comment_id){

      message_.find({"class":  "whole_comment","replyid":comment_id})
           .sort({'updatedAt': 'desc'})
           .exec(function(err,messages) {
             var comments = '';
             var post = '\
                 <div id="'+post_id+'" class="'+class_tag+'"><div class="user_post">'+ username + ':</div><div class=message_body>'+ data + '</div>\
                  <div id="'+comment_id+'">\
                   <div class="comment_output" >';
               for(var i = 0; i <messages.length; i++)
               {
                 comments= comments+'<div class="whole_comment"><span class="user_comment">'+ messages[i].owner + '</span>: <span class="just_comment">' + messages[i].message + '</span></div>';
               }
               post = post+comments+'</div> <input class="comment_input" type="text" placeholder="comment here..."><button class=comment_button>Comment</button><br></div></div>';


           });

}




module.exports = router;
