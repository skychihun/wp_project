$(function(){
  $('.thumb-viewer img').each(function(idx){
    if(idx != 0){
      $(this).addClass('hidden');
    }
    $(this).click(function(){
      $(this).addClass('hidden');
      if($(this).next().hasClass('hidden')){
        $(this).next().removeClass('hidden');
      }
      else{
        $('.thumb-viewer img:eq(0)').removeClass('hidden');
      }
    })
  })
})
