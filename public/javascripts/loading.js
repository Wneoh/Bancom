$(document).ready(function(){

/* Loading function*/
    function loadingForm(formattr,buttonattr){
        $(buttonattr).click(function(e){
            async function submitForm(){
                $(formattr).submit();
                return;
            };
            async function showLoading(){
                await submitForm();
                $('.after-submit').css("display","block");

            };

            showLoading();
        })
    }
    loadingForm(".loading-form",".submit");
    loadingForm(".loading-form",".delete-submit");
});