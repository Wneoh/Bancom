$( document ).ready(function() {
    
    var dots = $('.dot');
    $(dots[0]).click(function(){
        $('#slideshow-content').css({'transform': 'translateX(0)','animation':'none'});
        setTimeout(function(){
            console.log('run');
            $('#slideshow-content').css({'animation':'slide 25s infinite'})
        }, 12000);
    })
    $(dots[1]).click(function(){
        $('#slideshow-content').css({'transform': 'translateX(-1600px)','animation':'none'});
        setTimeout(function(){
            $('#slideshow-content').css({'animation':'slide 25s infinite'})
        }, 12000);
    })
    $(dots[2]).click(function(){
        $('#slideshow-content').css({'transform': 'translateX(-3200px)','animation':'none'});
        setTimeout(function(){
            $('#slideshow-content').css({'animation':'slide 25s infinite'})
        }, 12000);
    })
    $(dots[3]).click(function(){
        $('#slideshow-content').css({'transform': 'translateX(-4800px)','animation':'none'});
        setTimeout(function(){
            $('#slideshow-content').css({'animation':'slide 25s infinite'})
        }, 12000);
    })

    $(".btn-delete").click(function(e){
        if (confirm("Admin, are you sure you want to delete?") == true) {
            $(".form-delete").submit();
        }else{
            e.preventDefault();
        }
    }) 
    function myFunction() {
        $("#menu-profile").toggleClass("makeWhite");
        $(".profile-dropdown").toggle(function(){
            $(".profile-dropdown").animate({height: "auto"});
        })
    }
    $(document).click(function(e){
        $(".profile-dropdown").css("display","none"); 
        $("#menu-profile").removeClass("makeWhite");
        });
    
    $("#menu-profile").click(function(e){
        e.stopPropagation(); 
         myFunction();
      });
     
    })






