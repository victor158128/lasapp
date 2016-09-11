$(document).ready(function() {
  var ids = [];
  var keys = [];

  $(".search_input").autocomplete({
  source : function(request, response) {
                   $.ajax({
                       url : "findentry",
                       data: 'kw='+$( ".search_input" ).val(),
                       method: "POST",
                       dataType : "json",
                       success : function(data) {
                         ids = [];
                         keys = [];
                         if (data != "") {
                         var dummey = JSON.parse(data);
                         var entries = dummey.ent;
                          for (var i = 0; i < entries.length; i++) {
                            ids.push(entries[i].pid);
                            keys.push(entries[i].key);
                          }
                          response(keys);
                        }

                       } //success
                   });
               },
    select: function (event, ui) {
      //console.log(($.inArray(ui.item.value, keys)));
      var ind = $.inArray(ui.item.value, keys);

      $.post( "singlem",{"pid":ids[ind],"location":window.location.pathname.split('/').pop()},function(data) {
      $("#conversation").html(data);
        hashchanged();
      });
    }
  });

  $('#main').on("click",'.search_button', function(e) {

    $.post( "multiplem",{"kw":$(".search_input").val(),"location":window.location.pathname.split('/').pop()},function(data) {
    $("#conversation").html(data);

      hashchanged();
    });

  });


  function hashchanged(){
   var hash = window.location.href.split('/').pop().replace(/\?/g,'');
   var find_convo = $('#conversation').length;
   if(find_convo == 1){
  //alert(hash.replace(/\?/g,''));
  $.post( "/users/getOverwrite", function( data ) {
    //$( ".result" ).html( data );
    //alert(data);
    var JParse = JSON.parse(data);
    var modded = JParse.modded;
    $('input[type=checkbox]').prop('checked', false);

    //alert(modded.length);
    if(modded.length>=1)
    {
    //  alert("here: "+ modded[0].type);
  for (var i = 0; i < modded.length; i++) {
    //alert(modded[i].post);
      //alert("TYPPPE: "+modded[i].type);
    if(modded[i].type =="poll"){
  var rplacer_s = modded[i].replacer.toString();
  //alert("poll: ");

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
      //alert("comment: ");
  $("#"+modded[i].post).find(".like_area").find(".glyphicon").attr("class","glyphicon glyphicon-ok");
    }
    else if (modded[i].type =="thread") {
      //  alert("thread: ");
  $("#"+modded[i].post).children(".message_body").find(".glyphicon").attr("class","glyphicon glyphicon-ok");
    }

  }
    }

  });

   }
   //alert($('#conversation').length);
   //alert(hash);
  }
});
