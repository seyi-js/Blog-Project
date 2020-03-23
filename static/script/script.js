

// $(document).ready(function(){
//   $("button.remove").click(function(event){
//     var element=$(event.currentTarget);
//     var parent=$(element.parent());
//     var first_parent=$(parent).eq(0);
//     first_parent.hide(1000);
//   });
// });

//Get Next
var start = 0;
var data = document.getElementById('postLimit');
var limit = Number(data.value);

  function getNext() {

  start = Number(start) + Number(limit);

  // console.log(start)
  // console.log(limit)
  $.ajax({


    url:`/users/get-posts/ ${start}  /  ${limit}`,
    method:'GET',

    success: function(response){

      console.log(response)

        renderPost(response);

      }





  });
}

//Get Previous Post
function getPrevious() {
  start = Number(start) - Number(limit);
  $.ajax({


    url:`/users/get-posts/ ${start}  /  ${limit}`,
    method:'GET',

    success: function(response){

      console.log(response);

      renderPost(response);
    }
  });
}

//Submit Comment
function submitComment() {

      console.log(url)
  var userId = document.getElementById('userId');
  var postId = document.getElementById('postId');
  $.ajax({
    url: url,
    method:'POST',
     contentType: "application/x-www-form-urlencoded",
    success: function(response){
      renderComment(response)
      console.log(response)
    }
  })
}







//Render Post
function renderPost(post) {
  if(post.length > 0) {


    var html = "";

    for(var a = 0; a < post.length; a++) {
      // posts.forEach(function(post){


          html += '<a href="/users/queryPost?id=' + post[a]._id +' ">';
            html += '<h2 class="post-title" id="">';

              html += post[a].title;

            html += '</h2>';

            // html += '<h3 class="post-subtitle">';
            //   html += 'Many say exploration is part of our destiny, but it’s actually our duty to future generations.';
            // html += '</h3>';
            html += '<h3 class="post-subtitle">';
              if(post[a].subtitle != undefined){
                 html += post[a].subtitle;
                } else{
              html += '<button class="btn btn-primary">';
                html += 'READMORE';
                html += '</button>';
            }
              html += '</h3>';
          html += '</a>';
          html += '<p class="post-meta">';
            html += 'Posted by';
            html += '<a href="#">';
              html += 'Start Bootstrap</a>';
          html += 'on July 8, 2019</p>';


       }
    $('.post-preview').html(html)
  }

}
