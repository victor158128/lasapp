$(document).ready(function() {
   // Stuff to do as soon as the DOM is ready
   if ($(".description_input")[0]) {
    // $(".description_input").attr("id",window.location.pathname.split('/').pop());
     //alert($('.save_description').attr('id'));
      $.ajax({
         type: 'POST',
         // make sure you respect the same origin policy with this url:
         // http://en.wikipedia.org/wiki/Same_origin_policy
         url: '/users/getDescription',
         data: {
             'ClassName': window.location.pathname.split('/').pop()
         },

         success: function(msg){
           $('.description_input').val(msg);
           $('.description_input').attr("disabled", "disabled");

         }
     });
   }

   $('.save_description').click(function (event) {
        var class_name = this.id;


       $.post("/users/setDescription", {ClassName: class_name, description_d: $('.description_input').val()});

       $('.description_input').attr("disabled", "disabled");

       });

   $('.edit_button').click(function (event) {
      $('.description_input').removeAttr('disabled');
   });

});
