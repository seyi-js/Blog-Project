 // let stat ='';
//  $(document).ready(function(){


//Using Jquery
    // $("button.edit").click(function(event){
    //     var element=$(event.currentTarget);
    //     var post_id=element.val();
    //     console.log(event)
    //     console.log(element.val())
    //     $.ajax({
    //         url: `/admin/edit?post=${post_id} `,
    //         method:'GET',
    //         success: (response)=>{
    //             console.log(response.post)
    //             renderEdit(response)
    //         }
    //     })

    //   });
   

//Get Next
 var start = 0;
 var data = document.getElementById('postLimit');
 var limit = Number(data.value);

   function getNext() {

   start = Number(start) + Number(limit);
   
   
   console.log(limit)
   $.ajax({
     
    
     url:`/admin/get-posts/ ${start}  /  ${limit}`,
     method:'GET',
    
     success: function(response){
       
    //    console.log(response.length)
       
         renderPost(response);
         
       }
       
        
       
      
     
   });
 }

 
//Get Previous Post
 function getPrevious() {
   start = Number(start) - Number(limit);
   $.ajax({
     
    
     url:`/admin/get-posts/ ${start}  /  ${limit}`,
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
        html +=  '<div class="post-element">';
           html +=  ' <h1 class="post-title" id="'+ post[a]._id +'">';
             html += post[a].title;
           html +=  '</h1>';
           html +=  ' <article id=" '+ post[a]._id +' ">';
           html +=  post[a].post 
           html +=  '</article>';
           html +=  '</button>'
           
           html +=  '<button class="remove" onClick="return confirm("Are you sure you want to delete this post?")" id="remove">';
        html +=  '<a href="/admin/delete?post=' + post[a]._id +' ">';
         html +=  'Delete ';
         html +=  '</a>';
         html +=  '</button>'
         html +=  '<button  class="edit" onClick="edit(event)" value="'+ post[a]._id +' ">';
           html +=  'Edit'
           html +=  '</button>';
        
         html +=  ' </div>';
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
 function cancel(){
     var editing = document.getElementById('form-section')

    var element = event.currentTarget;
    // console.log(editing.type)
    editing.hidden = true
    console.log()
   //  var ger
}

 //Render Edit
 function edit(){
    var element = event.currentTarget;
    var post_id=element.value;
    console.log(element)
    $.ajax({
        url: `/admin/edit?post=${post_id} `,
        method:'GET',
        success: (response)=>{
            // console.log(response.post)
            renderEdit(response)
        }
    })

}

 function renderEdit(edit){
    var html = '';

    html += '<section class="form-section" id="form-section">';
    html += '<form action="/admin/update?id=' + edit._id + '" method="POST">';
    html += '<label for="title">';
    html += 'Title';
    html += '</label>';
    html += '<input type="text" id="title" name="title" class="form-control" placeholder="Enter Title" value="' + edit.title + '" />';
                html += '<label for="">';
                html += 'Post';
                html += '</label>';
                html += '<textarea id="yourTextArea" name="post">'; 
                html += edit.post
                html += '</textarea>';
                html += '<button type="submit" class="button">';
                html += 'Update';
                html += '</button>'; 
                
                html += '</form>';
                html += '<button  onClick="cancel(event)">';
                html += 'Cancel';
                html += '</button>';
                html += '</section>';
    

    $('#editing').html(html)
 }

 
// });