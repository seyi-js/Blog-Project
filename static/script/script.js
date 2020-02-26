

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
      
      console.log(response.length)
      
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


//Render Post
function renderPost(post) {
  if(post.length > 0) {

    
    var html = "";
   
    for(var a = 0; a < post.length; a++) {
      html +=  ' <div class="post-element">';
      html +=  '<h1 class="post-title" id="">';
      html +=  '<a href="/users/queryPost?id='+ post[a]._id +'">';
        html += post[a].title;
        html +=  '</a>';
        html +=  '</h1>';
       
        html +=  '</div>';
       }
    $('#posts').html(html)
  }
  if(post.length >= limit){
    var html = "";
   var next = null
    html += '<button style="float: right;" onClick="getNext()">next</button>'
    $('.next').html(html)
    // $('.next').html(next)
  } else{
    var html = "";
   
    html = null
    $('.next').html(html)
  }
}