

$(document).ready(function(){
  $("button.remove").click(function(event){
    var element=$(event.currentTarget);
    var parent=$(element.parent());
    var first_parent=$(parent).eq(0);
    first_parent.hide(1000);
  });
});
