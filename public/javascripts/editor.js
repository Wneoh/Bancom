$( document ).ready(function() {

 $("textarea").trumbowyg(
  {
      btns: [
        ['undo'],['redo'],['strong'],['unorderedList'],['orderedList'],['fontsize']
            ],
  },
  {
    tagsToRemove: ['script', 'link']
  });

})
