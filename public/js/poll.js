
/* $('select[name="answertype"]').change(function(event){
    var selected = $(this).find('option:selected');
    var value ="list";
    //var value = selected.attr("value");
    var name=  $(this).attr("name");
    var selector = '[for-field="'+name+'"]';
    $('.accordion-body'+selector).addClass('collapse');
    var selectorForValue = selector+'[for-value="'+value+'"]';
    var selectedPanel = $('.accordion-body'+ selectorForValue  );
    selectedPanel.removeClass('collapse');
})
*/

$(function () {

  $('#create_poll').click(function(event) {
    /* Act on the event */
  //  var selected =  $('select[name="answertype"]').find('option:selected');

  var value = "list";
  var name  = "answertype";
  var selector = '[for-field="'+name+'"]';
  $('.accordion-body'+selector).addClass('collapse');
  var selectorForValue = selector+'[for-value="'+value+'"]';
  var selectedPanel = $('.accordion-body'+ selectorForValue  );
  selectedPanel.removeClass('collapse');
  });


    $('#btnAdd').click(function () {
        var num     = $('.clonedInput').length, // how many "duplicatable" input fields we currently have
            newNum  = new Number(num + 1),      // the numeric ID of the new input field being added
            newElem = $('#entry' + num).clone().attr('id', 'entry' + newNum).fadeIn('slow'); // create the new element via clone(), and manipulate it's ID using newNum value
    // manipulate the name/id values of the input inside the new element
        // H2 - section
        newElem.find('.heading-reference').attr('id', 'ID' + newNum + '_reference').attr('name', 'answerTitle' + newNum + '_reference').html('Option ' + newNum);

        // First name - text
        newElem.find('.label_answeroption').attr('for', 'ID' + newNum + '_option');
        newElem.find('.input_answeroption').attr('id', 'ID' + newNum + '_option').attr('name', 'answer' + newNum + '_option').val('');

    // insert the new element after the last "duplicatable" input field
        $('#entry' + num).after(newElem);
        $('#ID' + newNum + '_title').focus();

    // enable the "remove" button
        $('#btnDel').attr('disabled', false);

    // right now you can only add 5 sections. change '5' below to the max number of times the form can be duplicated
        if (newNum == 15)
        $('#btnAdd').attr('disabled', true).prop('value', "You've reached the limit");
    });

    $('#btnDel').click(function () {
    // confirmation
        if (confirm("Are you sure you wish to remove this section? This cannot be undone."))
            {
                var num = $('.clonedInput').length;
                // how many "duplicatable" input fields we currently have
                $('#entry' + num).slideUp('slow', function () {$(this).remove();
                // if only one element remains, disable the "remove" button
                    if (num -1 === 1)
                $('#btnDel').attr('disabled', true);
                // enable the "add" button
                $('#btnAdd').attr('disabled', false).prop('value', "add section");});
            }
        return false;
             // remove the last element

    // enable the "add" button
        $('#btnAdd').attr('disabled', false);
    });

    $('#btnDel').attr('disabled', true);

});
