$(document).ready(function(){
  var description = $("#description");
  var spec = $("#spec");

  if(spec.height()>description.height() || spec.height()>>400){
  }else{
    $("#spec").css("height",description.height())
  }

  if(spec.width()>1200){
    spec.css("overflow-x","scroll");
  }
  if(description.width()>1200){
    description.css("overflow-x","scroll");
  }

  if(spec.height()>500){
    spec.css("overflow-y","scroll");
  }
  if(description.height()>500){
    description.css("overflow-y","scroll");
  }

$("#description").css("display","block");
    var tablinks =$(".tablinks"); 
    console.log(tablinks)
    $(tablinks[0]).addClass("active");
    $("#spec").css("display","none");
    
})
    function openTab(evt, tabName) {
        var i, tabcontent, tablinks;

        tablinks = $(".tablinks");
        tabcontent = $(".tabcontent");

        for (i = 0; i < tabcontent.length; i++) {
          $(tabcontent[i]).css("display","none");
        }
        for (i = 0; i < tablinks.length; i++) {
          $(tablinks[i]).removeClass("active");
        }
      
        // Show the current tab, and add an "active" class to the button that opened the tab
        $('#'+tabName).css("display","block");
        evt.currentTarget.className += " active";
      } 

