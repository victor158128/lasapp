$(function(){
  var socket = io();
  var current_name = $("#profile").val();

//loadMessages(2);

  function set_body_height() { // set body height = window height
     $('body').height($(window).height());
   }

     $(window).bind('resize', set_body_height);
     set_body_height();

//function loadMessages(num_of_entries){

//}



$('#username_name').click(function(){

socket.emit('change_user',$("#anon").val(),current_name);
current_name = $("#anon").val();
////alert($("#class").html());

});

$('.slider').click(function(event) {
if(current_name ==$("#anon").val()){
socket.emit('change_user',$("#fname").val(),current_name);
current_name = $("#fname").val();
}
else{
socket.emit('change_user',$("#anon").val(),current_name);
current_name = $("#anon").val();
}
});

$('#anon_name').click(function(){
////alert("change2");
socket.emit('change_user',$("#anon").val(),current_name);
current_name = $("#anon").val();
////alert($("#class").html());

});


socket.on('connect', function(){
  // call the server-side function 'adduser' and send one parameter (value of prompt)
  ////alert($("#class").html());
  socket.emit('adduser', current_name);
  switchRoom(window.location.pathname.split('/').pop());
});

$('#main').on('click', '#change_page', function () {
  //  $(this).attr('class');
  switchRoom($(this).attr('class'));

});

socket.on('updatecomment', function (username, comment, comment_id,c_id,user_type) {
  if  (user_type == 'prof' || user_type == 'developer') {
    $('#'+comment_id).children(".comment_output").prepend('<div id="'+c_id+'" class="whole_comment"><span class="user_comment" style="color:red;">'+ username + '</span>: <span class="just_comment">' + comment +
    '<span class="like_area" style="float:right;"><a class="btn btn-xs btn-primary"><span class="glyphicon glyphicon-thumbs-up"></span></a><span class="counter_post">0</span></span></div></span></div>');
  }
  else {
    $('#'+comment_id).children(".comment_output").prepend('<div id="'+c_id+'" class="whole_comment"><span class="user_comment">'+ username + '</span>: <span class="just_comment">' + comment +
    '<span class="like_area" style="float:right;"><a class="btn btn-xs btn-primary"><span class="glyphicon glyphicon-thumbs-up"></span></a><span class="counter_post">0</span></span></div></span></div>');
  }
});


// listener, whenever the server emits 'updatechat', this updates the chat body
socket.on('updatechat', function (username,class_tag, data,counter, post_id, comment_id, user_type) {
  if (user_type == 'prof' || user_type == 'developer') {
    $('#conversation').prepend('\
    <div id="'+post_id+'" class="'+class_tag+'"><div class="user_post"><p style="color:red;">'+username+':</p></div><div class=message_body>'+ data + '<div class="like_area" style="float:right;" ><a class="btn btn-sm btn-primary"><span class="glyphicon glyphicon-thumbs-up"></span></a><span class="counter_post">0</span></div>  </div>\
     <div id="'+comment_id+'" class="comment_box">\
          <div class="comment_output" ></div>\
          <input class="comment_input" type="text" placeholder="comment here...">\
           <button class=comment_button>Comment</button> <br>\
        </div>\
      </div>' );
  }
  else {
    $('#conversation').prepend('\
    <div id="'+post_id+'" class="'+class_tag+'"><div class="user_post">'+ username + ':</div><div class=message_body>'+ data + '<div class="like_area" style="float:right;" ><a class="btn btn-sm btn-primary"><span class="glyphicon glyphicon-thumbs-up"></span></a><span class="counter_post">0</span></div>  </div>\
     <div id="'+comment_id+'" class="comment_box">\
          <div class="comment_output" ></div>\
          <input class="comment_input" type="text" placeholder="comment here...">\
           <button class=comment_button>Comment</button> <br>\
        </div>\
      </div>' );
  }
});

$('#main').on('click', '.delete_button', function () {

  var pid = $(this).parent().parent().attr("id");

  socket.emit('deletepost', pid);
});

socket.on ('deletepost', function(pid) {
  $('#'+pid).remove();
});

/*
socket.on('updatechat', function (username,class_tag, data,counter, post_id, comment_id) {
$('#conversation').prepend('\
<div id="'+post_id+'" class="'+class_tag+'"><div class="user_post">'+ username + ':</div><div class=message_body>'+ data + '<div class="like_area" style="float:right;" ><a class="btn btn-sm btn-primary"><span class="glyphicon glyphicon-thumbs-up"></span></a><span class="counter_post">0</span></div>  </div>\
 <div id="'+comment_id+'" class="comment_box">\
      <div class="comment_output" ></div>\
      <input class="comment_input" type="text" placeholder="comment here...">\
       <button class=comment_button>Comment</button><br>\
    </div>\
  </div>' );
});
*/

socket.on('updatedescription', function (des) {
  $('.description_output').append('<b>'+ des + '<br>');
});

// listener, whenever the server emits 'updaterooms', this updates the room the client is in
socket.on('updaterooms', function(rooms, current_room,counter) {
  //$('#count').html('Users Online: '+counter);
  /*
  $('#rooms').empty();
  $.each(rooms, function(key, value) {
    if(value == current_room){
      $('#rooms').append('<div>' + value + '</div>');
    }
    else {
      $('#rooms').append('<div><a href="#" onclick="switchRoom(\''+value+'\')">' + value + '</a></div>');
    }
  });
  */
});


socket.on('updatelike', function( post_uid,iterate,post_class,operator) {
 //var output = $('#'+post_uid).get(".like_area").html();
//var output = $('#'+post_uid).find(".like_area").html();
//alert("--> "+post_class);

if(post_class =="comment_box"){
  ////alert('COMMENT BOX');
//iterate = iterate+1;
$('#'+post_uid).find(".like_area").find(".counter_post").html(iterate);

}
else{
  ////alert('POST');
  //iterate = iterate+1;
var out = $('#'+post_uid).children(".message_body").find(".counter_post").html(iterate);
////alert(out);
}
if(operator==-1){
  hashchanged(true);
}
else{
    hashchanged(false);
}
//////alert(output);

});

$('#main').on('click', '.glyphicon-thumbs-up', function () {
    ////alert($(this).attr("class"));
      //alert("going");
    $(this).attr("class","glyphicon glyphicon-ok");
    //alert("passed");
    var post_uid = $(this).closest("div").parent().parent().attr("id");
    var post_class = $(this).closest("div").parent().parent().attr("class");
    var quest = "";
    var chose = "";
   ////alert(post_uid)
  ////alert(post_class);




if(post_class == "comment_box"){
var comment_uid = $(this).closest("div").attr("id");

socket.emit('updatelike', comment_uid , 1,post_class);
}
else{
socket.emit('updatelike', post_uid, 1,post_class);
}

});



$('#main').on('click', '.glyphicon-ok', function () {

  ////alert($(this).attr("class"));
  //alert("going thumbs");
    $(this).attr("class","glyphicon glyphicon-thumbs-up");
  //alert("passed");
  var post_uid = $(this).closest("div").parent().parent().attr("id");
    var post_class = $(this).closest("div").parent().parent().attr("class");
  var quest = "";
  var chose = "";
  ////alert(post_uid)
 ////alert(post_class);

if(post_class == "comment_box"){
  var comment_uid = $(this).closest("div").attr("id");
//  //alert(comment_uid);
socket.emit('updatelike', comment_uid , -1,post_class);
}
else{
socket.emit('updatelike', post_uid, -1,post_class);
}


});



function switchRoom(room){
  current_room = room;
  socket.emit('switchRoom', room);
  ////alert(room);
}

  // when the client clicks SEND
  $('.post_button').click( function() {
    var message = $('#message_data').val();
//+ '<br><br><div class="like_area" style="float:right;"><a class="btn btn-sm btn-primary"><span class="glyphicon glyphicon-thumbs-up"></span></a><span class="counter_post">counter</span></div>'
    // tell server to execute 'sendchat' and send along one parameter
    if (message !== "") {
        socket.emit('sendchat',message ,'post_message', 0, message);
    }
    $('#message_data').val('');
    ////alert(window.location.pathname.split('/').pop());
  });

  // when the client hits ENTER on their keyboard
  $('#message_data').keypress(function(e) {
  /*    var reg =/<(.|\n)*?>/g;
    if (reg.test($('#message_data').val()) == true) {
        var ErrorText ='do not allow HTMLTAGS';
        //alert(ErrorText);
      }
*/
    if((e.which == 13 || e.keyCode == 10) && !(e.ctrlKey || e.metaKey) ) {
      $(this).blur();
      $('.post_button').focus().click();
    }
    if ((e.ctrlKey || e.metaKey) && (e.keyCode == 13 || e.keyCode == 10)) {
      //if ( e.keyCode == 13)
          $(this).val(  $(this).val() + "\n");
          //var content = $('#message_data').val();
          //var contentArray = content.split(/\n/);
          //$.each(contentArray, function(){
            //  $('#message_data').append('<p>' + this + '</p>');
            //  $('#message_data').val($('#message_data').val() + "'<p>'+ this + '</p>'");
              //$('#message_data').val($('#message_data').val() + "'<p>'+ this + '</p>'");
              ////alert($('#message_data').val());
            //});
    }
  });

  $('.save_button').click(function () {
    var description = $('.description_input').val();
    $('.description_input').val('');
    if (description !== "") {
      socket.emit('senddescription', description,window.location.pathname.split('/').pop());
    }
  });

  // when the client hits ENTER on their keyboard
  $('.description_input').keypress(function(e) {
    if ((e.ctrlKey || e.metaKey) && (e.which == 13 || e.which == 10)) {
      $(this).val(  $(this).val() + "\n");
    }
  });

  $('#main').on('click', '.comment_button', function () {

    var post_uid = $(this).closest("div").parent().attr("id");
    var reply_uid = $(this).closest("div").attr("id");

    var comment_element = $(this).parent().children(".comment_input");

    var comment = comment_element.val();

    comment_element.val('');
//+'<span class="like_area" style="float:right;"><a class="btn btn-xs btn-primary"><span class="glyphicon glyphicon-thumbs-up"></span></a><span class="counter_post">counter</span></span>
    //$('.comment_input').val('');
    if (comment !== "") {
      socket.emit('sendcomment', comment, reply_uid,post_uid,comment);
    }
  });


  $('#main').on("keypress",'.comment_input', function(e) {
       if (e.which == 13) {
         $(this).blur();
         //$('.comment_button').focus().click();
         $('.comment_button').click();
     }
});


  $("#pathf").val('Lobby');

//  $("#pathf").val('what');

/*
$('#pic_sub').click(function(event) {

  var f = $("#pathf").val();
  if (f == '') {

    //  //alert('Empty Buffer');
  }
  else {
      $('#fo').submit();
  }

});
*/
$("#pic_sub").click(function () {

    var f = $("#fileUploaded").val().toString();
    ////alert('hui2: '+f.indexOf("."));


    if (f.indexOf(".") >= 0 ) {

      var fss = document.getElementById('fileUploaded').files[0];
      //  //alert(fss.size);

        if (fss.size > 2088576) {
          alert('File Exceeds 2mb. Please resize and upload again.');
         $("#fileUploaded").val('');
        }
        else {
            //$("#fileUploaded").val('pl');
            ////alert('File Ready');
            $('#data').submit();
        }
    }
    else {
        //alert('Invalid Input');
        //$("#fileUploaded").val('');
    }

    $("#pic_close").click();
});




$("form#data").submit(function(event){

  //disable the default form submission
  event.preventDefault();

  //grab all form data
  var formData = new FormData($(this)[0]);

  $.ajax({
    url: '/fserver/upload',
    type: 'POST',
    data: formData,
    async: true,
    cache: false,
    contentType: false,
    processData: false,
    success: function (file_path) {
      ////alert(file_path);
      appendPicture(file_path);
    }
  });

  return false;
});

//$('#main').on('click', '.pic_desc', function(e) {
//});

$('#main').on('keypress', '.pic_desc', function(e) {

  if ((e.ctrlKey || e.metaKey) && (e.which == 13 || e.which == 10)) {
    $(this).val(  $(this).val() + "\n");
  }
});


function appendPicture(data){
  var fname = data.split('/').pop();
  var description = $(".pic_desc").val();

//document.getElementsByClassName("post_picture").style.marginBottom = "30px";
//<h4 class="modal-title" id="myLargeModalLabel-1">Mixer Board</h4>\
//<div class="modal-header">\
//</div>\

socket.emit('sendchat',
'\
<div class="pic_output" ><span>'+description+'</span></div>\
<a href="#" data-toggle="modal" data-target="#'+fname.split('.')[0]+'">\
<img  style="margin-bottom:10px;" src="'+data+'" width="150" class="img-responsive img-rounded center-block" alt="">\
</a>\
<!--  Modal content for the mixer image example -->\
    <div class="modal fade pop-up-1" id="'+fname.split('.')[0]+'" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel-1" aria-hidden="true">\
    <div class="modal-dialog modal-lg">\
      <div class="modal-content">\
          <button class="close" data-dismiss="modal"; style="font-size:30px; padding:10px;" aria-hidden="true">×</button>\
        <div class="modal-body">\
        <img src="'+data+'" class="img-responsive img-rounded center-block center fit" alt="">\
        </div>\
      </div><!-- /.modal-content -->\
    </div><!-- /.modal-dialog -->\
  </div><!-- /.modal mixer image -->',
  'post_picture', 0, description);

}

$('#main').on('keypress', '#question', function(e) {
  if ((e.ctrlKey || e.metaKey) && (e.which == 13 || e.which == 10)) {
    $(this).val(  $(this).val() + "\n");
   }
});

socket.on('updatepoll', function (postid,percentages,accumulator) {
    //alert('change');
	  for(var x=0;x<percentages.percents.length;x++){
			//parseInt(data3.choses[x][ Object.keys(data3.choses[x])[0] ])
			var ind_per = parseInt(percentages.percents[x][ Object.keys(percentages.percents[x])[0] ]);
			var pb = $('#'+postid).find('div[value="'+Object.keys(percentages.percents[x])[0]+'"]').find('.progress-bar');
      pb.html(Math.round(accumulator*ind_per/100)+" ("+ind_per+"%"+")");
			pb.attr("style","width:"+ind_per+"%")
		}
    hashchanged(true);
    ////alert($('#'+postid).children('.message_body').html());
//$.post( "/users/updatepollfront", { 'pid':postid,'' } );

});

$('#main').on('change', '.checkbox_class', function() {
    var post_uid = $(this).closest("div").parent().parent().attr("id");
    ////alert(post_uid);
    var quest = $(this).parent().parent().parent().children(".question").html();
    var chose = $(this).val();
    ////alert($(this).val());

    if ($(this).is(':checked')) {
        socket.emit('updatepoll', post_uid, chose, 1,quest);
    }
    else {
      socket.emit('updatepoll', post_uid, chose, -1,quest);
    }

    });


$("#submit_poll").click(function(event){

	var checkbox_strings = '';
	var question = $("#question").val();

var arr = [];
var questions = [];
questions.push(question);

var ops = '';
	$(".input_answeroption").each(function() {
	  ////alert($(this).val());
		if($(this).val() !==""){
		arr.push('{"'+$(this).val()+'":"0"}');
    questions.push($(this).val());
	  checkbox_strings = checkbox_strings + '<div class="checkbox" value="'+$(this).val()+'">\
	    <label><input type="checkbox" class="checkbox_class" value="'+$(this).val()+'">'+$(this).val()+'</label>\
				<div class="progress">\
          <div class="progress-bar" role="progressbar" aria-valuenow="70"\
            aria-valuemin="0" aria-valuemax="100" style="width:0%">\
            0%\
          </div>\
        </div>\
	    </div> ';
	}
	});

ops='{"poll_info":[{"votes":['+arr.toString()+']},{"percents":""}]}';

////alert(jArray.toString());
socket.emit('sendchat',	'\
   <span class="question">'+ question +'<hr></span>\
   '+checkbox_strings,"poll",ops, questions.toString());

  $('#close_poll').click();
});



function hashchanged(uncheck){
 var hash = window.location.href.split('/').pop().replace(/\?/g,'');
 var find_convo = $('#conversation').length;

 if(find_convo == 1){
////alert(hash.replace(/\?/g,''));
$.post( "/users/getOverwrite", function( data ) {
  //$( ".result" ).html( data );
  ////alert(data);
  //alert(data);
  var JParse = JSON.parse(data);
  var modded = JParse.modded;

  $('input[type=checkbox]').prop('checked', false);
  console.log("before##$#$#$#$#$");
 $("span.glyphicon.glyphicon-ok").attr("class","glyphicon glyphicon-thumbs-up");
// $("*").find("span[class=glyphicon glyphicon-ok]").toggleClass('glyphicon glyphicon-ok').toggleClass('glyphicon glyphicon-thumbs-up');
console.log("AFTER");

  ////alert(modded.length);
  if(modded.length>=1)
  {
  //  //alert("here: "+ modded[0].type);
for (var i = 0; i < modded.length; i++) {
  ////alert(modded[i].post);
    //////alert("TYPPPE: "+modded[i].type);
  if(modded[i].type =="poll"){
var rplacer_s = modded[i].replacer.toString();
////alert("poll: ");
if (rplacer_s.indexOf(',') != -1) {
  var splitter = rplacer_s.split(',');
  for (var x = 0; x < splitter.length; x++) {

    $("#"+modded[i].post).find('input[type=checkbox][value='+splitter[x]+']').prop('checked', true);
  }
//$("#"+modded[i].post).find('input[type=checkbox][value='+modded[i].replacer+']').prop('checked', true);
}
else {
  $("#"+modded[i].post).find('input[type=checkbox][value='+modded[i].replacer+']').prop('checked', true);
}


  }
  else if (modded[i].type =="comment") {
    ////alert("comment: ");
$("#"+modded[i].post).find(".like_area").find(".glyphicon").attr("class","glyphicon glyphicon-ok");
  }
  else if (modded[i].type =="thread") {
    //  //alert("thread: ");
$("#"+modded[i].post).children(".message_body").find(".glyphicon").attr("class","glyphicon glyphicon-ok");
  }

}
  }

});

 }
 ////alert($('#conversation').length);
 ////alert(hash);
}

});
