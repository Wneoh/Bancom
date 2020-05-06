$( document ).ready(function() {

 $("textarea").trumbowyg(
  {
      btns: [
            ['undo', 'redo'],
            ['strong'],
            ['unorderedList', 'orderedList']
            ]
  },
  {
    tagsToRemove: ['script', 'link']
  });

})
