



$(document).ready(function() {

    // process the form
    var form = document.getElementById('form');
    var data = document.getElementById('comment');

    var url = form.action;
    // console.log(form.action);
    $('#form').submit(function(event) {

        // get the form data
        // there are many ways to get this data using jQuery (you can use the class or id also)
        var formData = {
            'comment' : data.value

          };
          // console.log(formData)
        var userId = document.getElementById('userId');
        var postId = document.getElementById('postId');

        // process the form
        $.ajax({
            type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
             url         : url, //`/comment/ ${userId} / ${postId}`, // the url where we want to POST
            data        : {comment:formData.comment}, // our data object
            dataType    : 'json', // what type of data do we expect back from the server
                        encode          : true
        })
            // using the done promise callback
            .done(function(data) {

                // log data to the console so we can see
                // console.log(data.comment);

                renderComment(data)

                // here we will handle errors and validation messages
            });

        // stop the form from submitting the normal way and refreshing the page
        event.preventDefault();
    });

});

//Render Comment
function renderComment(post) {
  var comment = post[1].comment;
  var commenterName = post[0].firstname;
  // console.log(post[1])
  var div = document.getElementById('comment-section');
  var html="";


          html +=   '<div class="media mb-4">';
             html +=   '<img class="d-flex mr-3 rounded-circle" src="http://placehold.it/50x50" alt="">';
             html +=   '<div class="media-body comment-section">';
               html +=   '<h5 class="mt-0">';
                html +=   commenterName;
                html +=   '</h5>';

                html += comment;

             html +=   '</div>';
           html +=   '</div>';



// div.prepend(html)
  $('#comment-section').prepend(html)
}
