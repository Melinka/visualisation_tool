var _, initSVG, appendCircle, buildForce, hightlightGroup, p;
_ = require("prelude-ls");
initSVG = function(){
  var f;
  f = {};
  f.margin = {
    top: 100,
    left: 50,
    right: 50,
    bottom: 100
  };
  f.w = 800 - f.margin.left - f.margin.right;
  f.h = 800 - f.margin.top - f.margin.bottom;
  return d3.select(".svgContainer").append("svg").attr({
    "width": f.w + f.margin.left + f.margin.right,
    "height": f.h + f.margin.top + f.margin.bottom
  }).append("g").attr({
    "transform": "translate(" + f.margin.left + "," + f.margin.top + ")"
  });
};
appendCircle = function(){
  var f, build, i$;
  f = {};
  f.svg = null;
  f.selector = "cdots";
  f.data = [];
  f.updateModel = function(){};
  f.dtsr = 5;
  f.lightload = false;
  f.textload = false;
  f.textModel = function(){};
  build = function(){
    var c;
    c = f.svg.selectAll("." + f.selector).data(f.data);
    c.attr({
      "r": f.dtsr
    }).call(f.updateModel);
    c.enter().append("circle").attr({
      "class": function(it, i){
        return f.selector;
      },
      "r": 0
    }).style({
      "fill": function(){
        return colorbrewer["Reds"][9][~~(Math.random() * 5 + 2)];
      }
    }).attr({
      "r": f.dtsr
    }).call(f.updateModel);
    c.exit().transition().attr({
      "r": 0
    }).remove();
    if (f.textload) {
      return c.enter().append("text").attr({
        "class": "clrnm"
      }).style({
        "opacity": 0
      }).transition().style({
        "opacity": 1
      }).text(function(it){
        return it.name;
      }).call(f.textModel);
    }
  };
  for (i$ in f) {
    (fn$.call(this, i$));
  }
  return build;
  function fn$(it){
    build[it] = function(v){
      f[it] = v;
      return build;
    };
  }
};
buildForce = function(){
  var f, ifNaN, node, collide, build, i$;
  f = {};
  f.dtsr = 5;
  f.data = [];
  f.size = 800;
  f.margin = 1.5;
  f.svg = d3.select("svg").select("g");
  f.groupBy = null;
  f.grpLength = null;
  f.grpColLimit = 6;
  f.grpColLength = null;
  f.grpEntry = null;
  f.getEntryOrder = function(type){
    var v;
    v = null;
    f.grpEntry.map(function(it, i){
      if (it.key === type) {
        return v = i;
      }
    });
    return v;
  };
  f.BuildTargetFunc = function(){
    var grpEd;
    grpEd = _.groupBy(function(it){
      return it[f.groupBy];
    })(
    f.data);
    f.grpEntry = _.reverse(
    _.sortBy(function(it){
      return it.value.length;
    })(
    d3.entries(
    grpEd)));
    return f.grpLength = f.grpEntry.length;
  };
  f.targetFunc = function(it, i){
    it.target = {};
    it.target.x = f.posX(
    it[f.groupBy]);
    it.target.y = f.posY(
    it[f.groupBy]);
    return true;
  };
  f.posX = function(groupByValue){
    var r, s;
    f.grpColLength = d3.min([f.grpLength, f.grpColLimit]);
    r = function(it){
      return it % f.grpColLength;
    };
    s = d3.scale.ordinal().domain((function(){
      var i$, to$, results$ = [];
      for (i$ = 0, to$ = f.grpColLength - 1; i$ <= to$; ++i$) {
        results$.push(i$);
      }
      return results$;
    }())).rangeBands([0, f.size], 0.5, 0.5);
    return s(
    r(
    f.getEntryOrder(
    groupByValue)));
  };
  f.posY = function(groupByValue){
    var r, s;
    f.grpRowLength = ~~(f.grpLength / f.grpColLength);
    r = function(it){
      return ~~(it / f.grpColLength);
    };
    s = d3.scale.ordinal().domain((function(){
      var i$, to$, results$ = [];
      for (i$ = 0, to$ = f.grpRowLength - 1; i$ <= to$; ++i$) {
        results$.push(i$);
      }
      return results$;
    }())).rangeBands([0, f.size], 0.5, 0.5);
    return s(
    r(
    f.getEntryOrder(
    groupByValue)));
  };
  f.force = null;
  ifNaN = function(it){
    if (isNaN(it)) {
      return 0;
    } else {
      return it;
    }
  };
  node = [];
  function tick(it){
    var k, q, i, n;
    k = 0.5 * it.alpha;
    f.data.forEach(function(o, i){
      o.y += (o.target.y - o.y) * k;
      return o.x += (o.target.x - o.x) * k;
    });
    q = d3.geom.quadtree(f.data);
    i = 0;
    n = f.data.length;
    while (++i < n) {
      q.visit(collide(f.data[i]));
    }
    return node.attr({
      "cx": function(it){
        return ifNaN(it.x);
      },
      "cy": function(it){
        return ifNaN(it.y);
      }
    });
  }
  collide = function(it){
    var r, nx1, nx2, ny1, ny2;
    r = f.dtsr;
    nx1 = it.x - r;
    nx2 = it.x + r;
    ny1 = it.y - r;
    ny2 = it.y + r;
    return function(quad, x1, y1, x2, y2){
      var x, y, l, r;
      if (quad.point && quad.point !== it) {
        x = it.x - quad.point.x;
        y = it.y - quad.point.y;
        l = Math.sqrt(x * x + y * y);
        r = 2 * f.dtsr + f.margin;
        if (l < r) {
          l = (l - r) / l * 0.5;
          it.x -= x *= l;
          it.y -= y *= l;
          quad.point.x += x;
          quad.point.y += y;
        }
      }
      return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    };
  };
  build = function(it){
    var d, ts;
    if (_.unique(
    it[0])[0] === undefined || _.unique(
    it[0])[0] === null) {
      return;
    }
    f.data = _.map(function(it){
      return it["__data__"];
    })(
    it[0]);
    f.BuildTargetFunc(f.data);
    f.data = f.data.filter(f.targetFunc);
    f.force = d3.layout.force().nodes(f.data).links([]).gravity(0).charge(0).size([f.size, f.size]).on("tick", tick);
    node = it.data(f.data).call(f.force.drag);
    d = f.svg.selectAll(".grp" + f.selector).data(_.map(function(it){
      return it.key;
    })(
    f.grpEntry), function(it){
      return it;
    });
    d.exit().remove();
    ts = d3.scale.linear().domain([1, f.grpRowLength]).range([70, 25]);
    d.enter().append("text").attr({
      "x": function(it, i){
        return f.posX(it);
      },
      "y": function(it, i){
        return f.posY(it) + ts(f.grpRowLength);
      },
      "class": function(it){
        return "grp" + f.selector + " grp" + it;
      }
    }).style({
      "text-anchor": "middle",
      "fill": "rgb(137, 137, 137)"
    }).text(function(it){
      return it;
    });
    f.force.start();
    return f.force.alpha(0.02);
  };
  for (i$ in f) {
    (fn$.call(this, i$));
  }
  return build;
  function fn$(it){
    build[it] = function(v){
      f[it] = v;
      return build;
    };
  }
};
hightlightGroup = function(name, selector){
  selector = selector || ".cdots";
  if (isType("String", name)) {
    d3.selectAll("." + selector + ":not(.prm" + name + "), .grp" + selector + ":not(.grp" + name + ")").style({
      "opacity": 0.2
    });
    return d3.selectAll(".prm" + name + ", .grp" + name).style({
      "opacity": 1
    });
  } else if (isType("Array", name)) {
    d3.selectAll(("." + selector + _.join("", name.map(function(it){
      return ":not(.prm" + it + ")";
    }))) + (",.grp" + selector + _.join("", name.map(function(it){
      return ":not(.grp" + it + ")";
    })))).style({
      "opacity": 0.2
    });
    return d3.selectAll(_.join(",", name.map(function(it){
      return ".prm" + it;
    })) + ", " + _.join(",", name.map(function(it){
      return ".grp" + it;
    }))).style({
      "opacity": 1
    });
  }
};
p = null;
d3.tsv("dumpdata.tsv", function(err, tsvData){
  var s, grouping, lsExplain;
  s = initSVG();
  grouping = function(it){
    return appendCircle().svg(s).data(tsvData).updateModel(buildForce().groupBy(it));
  };
  lsExplain = [
    {
      "enter": grouping("Place"),
      "text": "There are a lot of people"
    }, {
      "enter": grouping("Area"),
      "text": "The Majority of people comes from Europe."
    }, {
      "enter": grouping("Occupation"),
      "text": "Some other explanation."
    }, {
      "enter": grouping("Place"),
      "text": "Country Breakdown."
    }
  ];
  return buildSlider(
  lsExplain);
});