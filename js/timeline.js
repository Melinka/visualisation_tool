var _, ggl, svg, buildRange, pathStyle, appendPath, flag, initHeatHis, initIndPath, initPath, initCell, initData, initSingleData, d;
_ = require("prelude-ls");
ggl = {};
ggl.margin = {
  top: 100,
  left: 50,
  right: 50,
  bottom: 100
};
ggl.w = 800 - ggl.margin.left - ggl.margin.right;
ggl.h = 750 - ggl.margin.top - ggl.margin.bottom;
ggl.colorscheme = "YlOrBr";
ggl.pathClass = "dataPath";
svg = d3.select(".svgContainer").append("svg").attr({
  "width": ggl.w + ggl.margin.left + ggl.margin.right,
  "height": ggl.h + ggl.margin.top + ggl.margin.bottom
}).append("g").attr({
  "transform": "translate(" + ggl.margin.left + "," + ggl.margin.top + ")"
});
svg.append("g").attr({
  "class": "yAxis axis",
  "transform": "translate(" + ggl.w + ",0)"
});
svg.append("g").attr({
  "class": "xAxis axis",
  "transform": "translate(0," + ggl.h + ")"
});
buildRange = function(rangeObj, ggl){
  var loc, useRangeObj;
  loc = {};
  useRangeObj = function(attr){
    if (rangeObj !== undefined && rangeObj[attr] !== undefined) {
      return loc[attr] = rangeObj[attr];
    } else {
      return loc[attr] = ggl[attr];
    }
  };
  _.map(useRangeObj)(
  ["w", "h"]);
  return loc;
};
pathStyle = function(it){
  return it.style({
    "fill": "none",
    "stroke": function(){
      return colorbrewer[ggl.colorscheme]["9"][~~(Math.random() * 5) + 3];
    },
    "stroke-width": "4px"
  });
};
appendPath = function(it){
  return it.on("mouseover", function(it, i){
    d3.selectAll("." + ggl.pathClass + ":not(.p" + it.name + ")").transition().delay(function(it, i){
      return i * 50;
    }).style({
      "opacity": 0.05
    });
    return d3.selectAll(".p" + it.name).transition().style({
      "opacity": 1
    });
  }).on("mouseout", function(it, i){
    return d3.selectAll("." + ggl.pathClass).transition().delay(function(it, i){
      return i * 50;
    }).style({
      "opacity": 1
    });
  }).style({
    "stroke-dasharray": function(){
      var l;
      l = d3.select(this).node().getTotalLength();
      return l + " " + l;
    },
    "stroke-dashoffset": function(){
      return d3.select(this).node().getTotalLength();
    }
  }).transition().duration(2000).style({
    "stroke-dashoffset": 0
  });
};
flag = true;
initHeatHis = function(data, rangeObj){
  var loc, allData, cScale;
  loc = buildRange(rangeObj, ggl);
  allData = _.flatten(
  _.map(function(it){
    return it.data;
  })(
  data));
  cScale = d3.scale.quantile().domain(d3.extent(allData, function(it){
    return it.value;
  })).range(colorbrewer[ggl.colorscheme]["9"]);
  loc.rectW = 20;
  loc.rectH = 10;
  loc.rectMW = 5;
  loc.rectMH = 5;
  return svg.selectAll("blank").data(data).enter().append("g").attr({
    "transform": function(it, i){
      return "translate(0," + i * (loc.rectH + loc.rectMH) + ")";
    }
  }).selectAll("rect").data(function(it){
    return it.data;
  }).enter().append("rect").attr({
    "x": function(it, i){
      return i * (loc.rectW + loc.rectMW);
    },
    "y": function(it, i){
      return 0;
    },
    "width": loc.rectW,
    "height": loc.rectH
  }).style({
    "fill": function(it){
      return cScale(it.value);
    }
  });
};
initIndPath = function(data, rangeObj){
  var loc, allData, xScale, l, yScale, initYScale, pathFunc, initPathFunc, pathAll, p;
  loc = buildRange(rangeObj, ggl);
  allData = _.flatten(
  _.map(function(it){
    return it.data;
  })(
  data));
  xScale = d3.scale.linear().domain(d3.extent(allData, function(it){
    return it.time;
  })).range([0, loc.w]);
  l = data.length;
  loc.indH = loc.h / l;
  yScale = {};
  initYScale = function(row){
    return d3.scale.linear().domain(d3.extent(row.data, function(it){
      return it.value;
    })).range([loc.indH, 0]);
  };
  _.map(function(it){
    return yScale[it.name] = initYScale(it);
  })(
  data);
  pathFunc = {};
  initPathFunc = function(row){
    return d3.svg.line().interpolate("monotone").x(function(it){
      return xScale(it.time);
    }).y(function(it){
      return yScale[row.name](it.value);
    });
  };
  _.map(function(it){
    return pathFunc[it.name] = initPathFunc(it);
  })(
  data);
  pathAll = function(it){
    return it.attr({
      "class": ggl.pathClass,
      "d": function(it){
        return pathFunc[it.name](
        it.data);
      },
      "transform": function(it, i){
        return "translate(0," + i * loc.indH + ")";
      }
    }).call(pathStyle);
  };
  p = svg.selectAll("." + ggl.pathClass).data(data);
  p.transition().duration(3000).delay(function(it, i){
    return i * 100;
  }).call(pathAll);
  return p.enter().append("path").call(pathAll);
};
initPath = function(data, rangeObj){
  var loc, allData, xScale, yScale, xAxisFunc, yAxisFunc, pathFunc, pathAll, p, xAxis, yAxis;
  loc = buildRange(rangeObj, ggl);
  allData = _.flatten(
  _.map(function(it){
    return it.data;
  })(
  data));
  xScale = d3.scale.linear().domain(d3.extent(allData, function(it){
    return it.time;
  })).range([0, loc.w]);
  yScale = d3.scale.linear().domain(d3.extent(allData, function(it){
    return it.value;
  })).range([loc.h, 0]);
  xAxisFunc = d3.svg.axis().scale(xScale).orient("bottom").ticks(6);
  yAxisFunc = d3.svg.axis().scale(yScale).orient("right").ticks(4);
  pathFunc = d3.svg.line().interpolate("monotone").x(function(it){
    return xScale(it.time);
  }).y(function(it){
    return yScale(it.value);
  });
  pathAll = function(it){
    return it.attr({
      "d": function(it){
        return pathFunc(it.data);
      },
      "class": function(it, i){
        return ggl.pathClass + " p" + it.name;
      }
    }).call(pathStyle);
  };
  svg.selectAll(".horizonGrid").data(yScale.ticks(4)).enter().append("line").attr({
    "class": "horizonGrid",
    "x1": ggl.margin.right,
    "x2": ggl.w,
    "y1": yScale,
    "y2": yScale,
    "fill": "none",
    "shape-rendering": "crispEdges",
    "stroke": "grey",
    "stroke-width": "1px"
  });
  svg.selectAll(".verticalGrid").data(xScale.ticks(6)).enter().append("line").attr({
    "class": "verticalGrid",
    "x1": xScale,
    "x2": xScale,
    "y1": 0,
    "y2": ggl.h,
    "fill": "none",
    "shape-rendering": "crispEdges",
    "stroke": "grey",
    "stroke-width": "1px"
  });
  p = svg.selectAll("." + ggl.pathClass).data(data);
  p.transition().call(pathAll);
  p.enter().append("path").call(pathAll).call(appendPath);
  xAxis = svg.selectAll(".xAxis");
  xAxis.transition().call(xAxisFunc);
  yAxis = svg.selectAll(".yAxis");
  return yAxis.transition().call(yAxisFunc);
};
initCell = function(row){
  return {
    "name": row,
    "data": _.map(function(cell){
      return {
        "value": row < 3
          ? Math.random()
          : Math.random() * 10,
        "time": cell
      };
    })(
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20])
  };
};
initData = function(){
  return _.map(initCell)(
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
};
initSingleData = function(){
  return _.map(initCell)(
  [1]);
};
d = initData();
initPath(
d);