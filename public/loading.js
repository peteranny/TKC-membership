var loading = {
  timer:null,
  text:"LOADING",
  num_dots:3,
  dt:100,
  run:function(isRun){
    var tgt = $("#loading");
    tgt.text(loading.text);
    if(isRun){
      tgt.show();
      timer = setInterval(function(){
        if(tgt.text().length<loading.text.length+loading.num_dots){
          tgt.text(tgt.text()+".")
        }
        else{
          tgt.text(loading.text);
        }
      }, loading.dt);
    }
    else{
      tgt.hide();
      tgt.text("");
      timer = clearInterval(loading.timer);
    }
  }
};

