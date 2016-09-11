$(document).ready(function() {
//alert("hello");
  $("#pathf").val('Lobby');
$('#pic_sub').click(function(event) {

  var f = $("#pathf").val();
  if (f == '') {

      alert('Empty Buffer');
  }
  else {
      $('#fo').submit();
  }

});

$("#fileUploaded").change(function () {
    //$("#dfile").html($("#fileUploaded").val());

    // $("#fileUploaded").hide();

    var f = $("#fileUploaded").val().toString();

    //$("#fileUploaded").val('hi');

    alert('hui2: '+f.indexOf("."));
    if (f.indexOf(".") >= 0 ) {

  var fss = this.files[0];
        alert(fss.size);

        if (fss.size > 8388608) {


            alert('File Exceeds 8 mb');
         $("#fileUploaded").val('');
        }
        else {
            //$("#fileUploaded").val('pl');
            alert('File Ready');
            $('#data').submit();
/*
            var formData = new FormData();
            jQuery.each(jQuery('#fileUploaded')[0].files, function(i, file) {
              formData.append('file-'+i, file);
            });

$.ajax({
       url : '/fserver/upload',
       type : 'POST',
       data : formData,
       processData: false,  // tell jQuery not to process the data
       contentType: false,  // tell jQuery not to set contentType
       success : function(data) {
           console.log(data);
           alert(data);
       }
});
            $("#fileUploaded").val('');
            */

        }

    }
    else {
        alert('Invalid Input');
        //$("#fileUploaded").val('');
    }
});




$("form#data").submit(function(event){

  //disable the default form submission
  event.preventDefault();
alert("here");
  //grab all form data
  var formData = new FormData($(this)[0]);

  $.ajax({
    url: '/fserver/upload',
    type: 'POST',
    data: formData,
    async: false,
    cache: false,
    contentType: false,
    processData: false,
    success: function (file_path) {
      alert(file_path);
      appendPicture(file_path);
    }
  });

  return false;
});


function appendPicture(data){
  var fname = data.split('/').pop();

socket.emit('sendchat',
'\
<a href="#" data-toggle="modal" data-target="#'+fname.split('.')[0]+'">\
<img src="'+data+'" width="150" class="img-responsive img-rounded center-block" alt="">\
</a>\
<!--  Modal content for the mixer image example -->\
  <div class="modal fade pop-up-1" id="'+fname.split('.')[0]+'" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel-1" aria-hidden="true">\
    <div class="modal-dialog modal-lg">\
      <div class="modal-content">\
        <div class="modal-header">\
          <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>\
          <h4 class="modal-title" id="myLargeModalLabel-1">Mixer Board</h4>\
        </div>\
        <div class="modal-body">\
        <img src="'+data+'" class="img-responsive img-rounded center-block" alt="">\
        </div>\
      </div><!-- /.modal-content -->\
    </div><!-- /.modal-dialog -->\
  </div><!-- /.modal mixer image -->'

);

}


});
