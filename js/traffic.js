var _, focusMonth, focusWeekDays, focusMonthYear, f, initCrossMap, buildNarrative, getURLParameter, objectId, Story, query;
_ = require("prelude-ls");
focusMonth = function(){};
focusWeekDays = function(){};
focusMonthYear = function(){};
f = function(){
  return d3.selectAll('#map').style({
    "position": "fixed"
  });
};
initCrossMap = function(csvUrl){
  var colorYellow, lngDim, latDim, projection, overlay, padding, mapOffset, weekDayTable, gPrints, monthDim, weekdayDim, hourDim, map, monthLs, monthTbl, toYearMonth;
  colorYellow = "rgb(255, 204, 0)";
  lngDim = null;
  latDim = null;
  projection = null;
  overlay = null;
  padding = 5;
  mapOffset = 4000;
  weekDayTable = ["Sun.", "Mon.", "Tue.", "Wed.", "Thu.", "Fri.", "Sat."];
  gPrints = null;
  monthDim = null;
  weekdayDim = null;
  hourDim = null;
  map = null;
  monthLs = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];
  monthTbl = _.listsToObj([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], monthLs);
  toYearMonth = function(y, m){
    return monthTbl[m] + " '" + _.Str.drop(2)(
    y + "");
  };
  return d3.json("./mapstyle/dark2.json", function(err, mapStyle){
    var styledMap, initMap, transform, ifdead, setCircle, initCircle, tranCircle, finalCircle, updateGraph;
    styledMap = new google.maps.StyledMapType(mapStyle, {
      name: "Styled Map"
    });
    initMap = function(){
      map = new google.maps.Map(d3.select("#map").node(), {
        zoom: 6,
        center: new google.maps.LatLng(-29.50049956558744, 28.1287285456758131),
        scrollwheel: false,
        mapTypeControlOptions: {
          mapTypeId: [google.maps.MapTypeId.ROADMAP, 'map_style']
        }
      });
      google.maps.event.addListener(map, "bounds_changed", function(){
        var bounds, northEast, southWest;
        bounds = this.getBounds();
        northEast = bounds.getNorthEast();
        southWest = bounds.getSouthWest();
        console.log([(southWest.lng() + northEast.lng()) / 2, (southWest.lat() + northEast.lat()) / 2]);
        lngDim.filterRange([southWest.lng(), northEast.lng()]);
        latDim.filterRange([southWest.lat(), northEast.lat()]);
        return dc.redrawAll();
      });
      map.mapTypes.set('map_style', styledMap);
      map.setMapTypeId('map_style');
      return overlay.setMap(map);
    };
    transform = function(d){
      d = new google.maps.LatLng(d.GoogleLat, d.GoogleLng);
      d = projection.fromLatLngToDivPixel(d);
      return d3.select(this).style("left", (d.x - padding) + "px").style("top", (d.y - padding) + "px");
    };
    ifdead = function(it, iftrue, iffalse){
      if (it.dead > 0) {
        return iftrue;
      } else {
        return iffalse;
      }
    };
    setCircle = function(it){
      return it.attr({
        "cx": function(it){
          return it.coorx;
        },
        "cy": function(it){
          return it.coory;
        },
        "r": function(){
          return "5px";
        }
      }).style({
        "fill": function(){
          return colorYellow;
        },
        "position": "absolute",
        "opacity": 0.3
      });
    };
    initCircle = function(it){
      return it.attr({
        "r": 0
      });
    };
    tranCircle = function(it){
      return it.attr({
        "r": 20
      });
    };
    finalCircle = function(it){
      return it.attr({
        "r": "5px"
      });
    };
    updateGraph = function(){
      var dt;
      dt = gPrints.selectAll("circle").data(monthDim.top(Infinity));
      dt.call(setCircle).transition().call(tranCircle).transition().call(finalCircle);
      dt.enter().append("circle").call(setCircle).transition().call(tranCircle).transition().call(finalCircle);
      return dt.exit().remove();
    };
    return d3.csv(csvUrl, function(err, tsvBody){
      var barAcciMonth, barAcciWeekDay, barAcciHour, ndx, all, acciMonth, acciWeekDay, acciHour, barMt, barWk, barHr, marginMt, marginWk, marginHr, dm, b, adaptYearMonth;
      tsvBody.filter(function(it){
        var c, s;
        c = it.Coordinates;
        s = c.split(",");
        it.GoogleLng = +s[1];
        it.GoogleLat = +s[0];
        it.date = new Date(it.Start_Date);
        it.month = it.date.getMonth() + 1;
        it.hour = it.date.getHours();
        it.year = it.date.getFullYear();
        it.monthyear = toYearMonth(it.year, it.month);
        it.week = weekDayTable[it.date.getDay()];
        return true;
      });
      overlay = new google.maps.OverlayView();
      overlay.onAdd = function(){
        var layer, svg;
        layer = d3.select(this.getPanes().overlayLayer).append("div").attr("class", "stationOverlay");
        svg = layer.append("svg");
        gPrints = svg.append("g").attr({
          "class": "class",
          "gPrints": "gPrints"
        });
        svg.attr({
          "width": mapOffset * 2,
          "height": mapOffset * 2
        }).style({
          "position": "absolute",
          "top": -1 * mapOffset + "px",
          "left": -1 * mapOffset + "px"
        });
        return overlay.draw = function(){
          var googleMapProjection, dt;
          projection = this.getProjection();
          googleMapProjection = function(coordinates){
            var googleCoordinates, pixelCoordinates;
            googleCoordinates = new google.maps.LatLng(coordinates[0], coordinates[1]);
            pixelCoordinates = projection.fromLatLngToDivPixel(googleCoordinates);
            return [pixelCoordinates.x + mapOffset, pixelCoordinates.y + mapOffset];
          };
          tsvBody.filter(function(it){
            var coor;
            coor = googleMapProjection([it.GoogleLat, it.GoogleLng]);
            it.coorx = coor[0];
            it.coory = coor[1];
            return true;
          });
          dt = gPrints.selectAll("circle").data(tsvBody);
          dt.enter().append("circle").call(setCircle);
          dt.call(setCircle);
          return dt.exit().remove();
        };
      };
      barAcciMonth = dc.barChart("#AcciMonth");
      barAcciWeekDay = dc.barChart("#AcciWeekDay");
      barAcciHour = dc.barChart("#AcciHour");
      ndx = crossfilter(tsvBody);
      all = ndx.groupAll();
      monthDim = ndx.dimension(function(it){
        return it.month;
      });
      weekdayDim = ndx.dimension(function(it){
        return it.week;
      });
      hourDim = ndx.dimension(function(it){
        return it.monthyear;
      });
      lngDim = ndx.dimension(function(it){
        return it.GoogleLng;
      });
      latDim = ndx.dimension(function(it){
        return it.GoogleLat;
      });
      acciMonth = monthDim.group().reduceCount();
      acciWeekDay = weekdayDim.group().reduceCount();
      acciHour = hourDim.group().reduceCount();
      barMt = 350;
      barWk = 270;
      barHr = 450;
      marginMt = {
        "top": 10,
        "right": 10,
        "left": 30,
        "bottom": 20
      };
      marginWk = marginMt;
      marginHr = marginMt;
      barAcciMonth.width(barMt).height(100).margins(marginMt).dimension(monthDim).group(acciMonth).x(d3.scale.ordinal().domain(d3.range(1, 13))).xUnits(dc.units.ordinal).elasticY(true).colors(colorYellow).on("filtered", function(c, f){
        return updateGraph();
      }).yAxis().ticks(4);
      barAcciWeekDay.width(barWk).height(100).margins(marginWk).dimension(weekdayDim).group(acciWeekDay).x(d3.scale.ordinal().domain(weekDayTable)).xUnits(dc.units.ordinal).elasticY(true).colors(colorYellow).on("filtered", function(c, f){
        return updateGraph();
      }).yAxis().ticks(4);
      dm = _.take(8)(
      _.drop(18)(
      _.flatten(
      [2012, 2013, 2014].map(function(y){
        return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(function(m){
          return toYearMonth(y, m);
        });
      }))));
      b = barAcciHour.width(barHr).height(100).margins(marginHr).dimension(hourDim).group(acciHour).elasticY(true).colors(colorYellow).on("filtered", function(c, f){
        return updateGraph();
      });
      b.x(d3.scale.ordinal().domain(dm)).xUnits(dc.units.ordinal).xAxis();
      b.yAxis().ticks(4);
      focusMonth = function(it){
        barAcciMonth.filter(it);
        return dc.redrawAll();
      };
      focusWeekDays = function(it){
        barAcciWeekDay.filter(it);
        return dc.redrawAll();
      };
      adaptYearMonth = function(a){
        var s;
        s = a.split("_");
        return toYearMonth(s[0], s[1]);
      };
      focusMonthYear = function(it){
        if (_.isType('Array', it)) {
          barAcciHour.filterAll();
          _.map(function(a){
            return barAcciHour.filter(adaptYearMonth(a));
          })(
          it);
        } else {
          barAcciHour.filter(
          it);
        }
        return dc.redrawAll();
      };
      dc.renderAll();
      return initMap();
    });
  });
};
buildNarrative = function(it){
  return d3.tsv(it, function(err, csvData){
    return buildSlider(
    csvData);
  });
};
Parse.initialize("0GI98IoEbwAmZb8zHw2hUj6TgA1M3af5rRKX6eUU", "CJV6NXQXXjCFQsO0vQnZMhGQ1J4I8anfLd7X9iNW");
getURLParameter = function(name){
  return _.split("id=")(
  window.location.href)[1];
};
objectId = getURLParameter("id");
Story = Parse.Object.extend("Story");
query = new Parse.Query(Story);
query.equalTo("objectId", objectId);
query.find({
  success: function(results){
    var dataURL, storyURL;
    dataURL = results[0].get("Data");
    storyURL = results[0].get("Story");
    initCrossMap(
    dataURL);
    return buildNarrative(
    storyURL);
  },
  error: function(error){
    return alert("Error: " + error.code + " " + error.message);
  }
});