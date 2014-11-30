var _, buildSlider;
_ = require("prelude-ls");
buildSlider = function(lsExplain){
  var sld, ticking, scrollingTo, initSlider, scrolling;
  sld = {};
  sld.screenh = $(window).height();
  sld.hghidx = -1;
  ticking = function(i){
    var updtBlackIdxDots;
    updtBlackIdxDots = function(){
      return d3.selectAll(".idx").style({
        "background-color": function(it, i){
          if (i === sld.hghidx) {
            return "white";
          } else {
            return '#272727';
          }
        }
      });
    };
    if (i !== sld.hghidx) {
      sld.hghidx = i;
      updtBlackIdxDots();
      return lsExplain[sld.hghidx].enter();
    }
  };
  scrollingTo = function(i){
    return $("body").scrollTop($(sld.dscrpts[i]).position().top);
  };
  initSlider = function(){
    var txt;
    txt = d3.selectAll(".txtholder").selectAll(".description").data(lsExplain).enter();
    txt.append("div").attr({
      "class": "description"
    }).append("h4").attr({
      "class": "descriptionH4"
    }).html(function(it){
      return it.text;
    });
    d3.selectAll(".idxholder").selectAll(".idx").data(lsExplain).enter().append("div").attr({
      "class": "idx"
    }).style({
      "cursor": "pointer"
    }).on("mousedown", function(d, i){
      return scrollingTo(i);
    });
    return sld.dscrpts = [].slice.call(document.getElementsByClassName("description"));
  };
  scrolling = function(){
    return sld.dscrpts.map(function(it, i){
      var b, m, lm;
      b = it.getBoundingClientRect();
      m = b.top;
      lm = sld.screenh / 2;
      return d3.select(it).style("opacity", function(){
        if (m < lm) {
          if (m > 0) {
            ticking(i);
          }
          return m / 100;
        } else {
          return 1;
        }
      });
    });
  };
  initSlider();
  return $(window).scroll(function(){
    return scrolling();
  });
};