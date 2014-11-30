var _, ggl, tree, diagonal, svgC, svg, go, appearance, buildTree, cleanNumber, getDigitLength, thousandsComma, chineseFormat, augmentedTsv;
_ = require("prelude-ls");
ggl = {};
ggl.margin = 50;
ggl.diameter = 800;
ggl.bck_color = "#272727";
ggl.fileName = "All participants";
tree = d3.layout.tree().size([360, ggl.diameter / 2 - 100]).separation(function(a, b){
  return (a.parent === b.parent ? 1 : 5) / a.depth;
}).children(function(it){
  return it.values;
}).sort(function(a, b){
  if (b.values === undefined || b.values === undefined) {
    return b.value - a.value;
  } else {
    return b.values.length - a.values.length;
  }
});
diagonal = d3.svg.diagonal.radial().projection(function(it){
  return [it.y, it.x / 180 * Math.PI];
});
svgC = d3.select("body").append("svg").attr({
  "width": ggl.diameter + ggl.margin,
  "height": ggl.diameter
});
svg = svgC.append("g").attr({
  "transform": "translate(" + (ggl.diameter / 2 + ggl.margin / 2) + "," + ggl.diameter / 2 + ")"
});
go = function(){
  return d3.selectAll(".node").transition().duration(1000).style({
    "opacity": function(it, i){
      if (Math.random() < 0.8) {
        return 0.1;
      } else {
        return 1;
      }
    }
  });
};
appearance = function(it, delaying, newopacity){
  if (newopacity === undefined) {
    newopacity = 1;
  }
  return it.style({
    "opacity": 0
  }).transition().delay(function(it, i){
    return delaying + i * 10;
  }).duration(1000).style({
    "opacity": newopacity
  });
};
buildTree = function(tsvData){
  var nest, jsonData, c, dftype, builColorScl, pathStyle, textStyle, colorScl, link, node, getTotalValue;
  nest = d3.nest().key(function(it){
    return it.Area;
  }).key(function(it){
    return it.Gender;
  }).entries(tsvData);
  jsonData = {
    "key": ggl.fileName,
    "values": nest
  };
  c = _.reverse(
  _.take(5)(
  colorbrewer[ggl.colorscheme]["9"]));
  dftype = _.unique(
  _.map(function(it){
    return it.type;
  })(
  tsvData));
  builColorScl = function(tsvData){
    return d3.scale.ordinal().domain(dftype).range(c);
  };
  pathStyle = function(it){
    return it.style({
      "fill": "none",
      "stroke-width": 2
    });
  };
  textStyle = function(it){
    return it.style({
      "fill": "white",
      "font-family": "monospace"
    });
  };
  colorScl = builColorScl(
  tsvData);
  ggl.nodes = tree.nodes(jsonData);
  ggl.links = tree.links(ggl.nodes);
  link = svg.selectAll(".link").data(ggl.links).enter().append("path").attr({
    "class": function(it){
      var r;
      r = "link";
      if (it.target.key !== undefined) {
        r += " l" + it.target.key;
      }
      if (it.source.key !== undefined) {
        r += " l" + it.source.key;
      }
      console.log(
      getAllParent(
      it));
      return r;
    },
    "d": diagonal
  }).call(pathStyle).style({
    "stroke": function(it, i){
      return colorScl(
      it.target.type);
    }
  }).call(function(it){
    return appearance(it, 1000);
  });
  node = svg.selectAll(".node").data(ggl.nodes).enter().append("g").attr({
    "class": function(it, i){
      return "node " + (it.values === undefined ? " leaf" : "");
    },
    "transform": function(it){
      return "rotate(" + (it.x - 90) + ")translate(" + it.y + ")";
    }
  });
  getTotalValue = function(node){
    if (node.value !== undefined) {
      return 1;
    } else {
      return _.fold1(curry$(function(x$, y$){
        return x$ + y$;
      }))(
      _.map(getTotalValue)(
      node.values));
    }
  };
  return node.append("text").attr({
    "dy": ".31em",
    "text-anchor": function(it){
      if (it.x < 180) {
        return "start";
      } else {
        return "end";
      }
    },
    "transform": function(it){
      if (it.depth >= 2) {
        if (it.x < 180) {
          return "translate(120)";
        } else {
          return "rotate(180)translate(-120)";
        }
      } else {
        if (it.x < 180) {
          return "translate(30)";
        } else {
          return "rotate(180)translate(-30)";
        }
      }
    }
  }).text(function(it){
    return it.key;
  }).call(textStyle).style({
    "fill": "white"
  }).call(function(it){
    return appearance(it, 3000, 0.8);
  });
};
ggl.colorscheme = "Oranges";
cleanNumber = function(num){
  if (num === "" || num === undefined || num === null || num === "null") {
    return null;
  } else {
    return +num.replace(/,/g, "").split(".")[0];
  }
};
getDigitLength = function(num){
  return num.toString().length;
};
thousandsComma = d3.format("0,000");
chineseFormat = function(num){
  return thousandsComma(~~(num / 1000)) + " 千";
};
augmentedTsv = function(tsvData){
  tsvData.filter(function(it, i){
    var l;
    it.id = i;
    it.type = it.type.trim();
    it.area = it.area.trim();
    l = it.type.length;
    it.type = _.take(l - 1, it.type);
    it.value = 1;
    it.key = it.subtype;
    return true;
  });
  return tsvData;
};
d3.tsv("./dumpdata.tsv", function(err, tsvData){
  return buildTree(
  tsvData);
});
function curry$(f, bound){
  var context,
  _curry = function(args) {
    return f.length > 1 ? function(){
      var params = args ? args.concat() : [];
      context = bound ? context || this : this;
      return params.push.apply(params, arguments) <
          f.length && arguments.length ?
        _curry.call(context, params) : f.apply(context, params);
    } : f;
  };
  return _curry();
}