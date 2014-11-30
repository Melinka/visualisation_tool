_ = require "prelude-ls"

## period transformation
## color heat map
## group of line 

ggl = {}

ggl.margin = {top: 100, left: 50, right: 50, bottom: 100}
ggl.w = 800 - ggl.margin.left - ggl.margin.right
ggl.h = 750 - ggl.margin.top - ggl.margin.bottom
ggl.colorscheme = "YlOrBr"
	# "Reds"

ggl.pathClass = "dataPath"

svg = d3.select ".svgContainer"
	.append "svg"
	.attr {
		"width": ggl.w + ggl.margin.left + ggl.margin.right
		"height": ggl.h + ggl.margin.top + ggl.margin.bottom
	}
	.append "g"
	.attr {
		"transform": "translate(" + ggl.margin.left + "," + ggl.margin.top + ")"
	}

svg
	.append "g"
	.attr {
		"class": "yAxis axis"
		"transform": "translate(" + (ggl.w) + ",0)"
	}

svg
	.append "g"
	.attr {
		"class": "xAxis axis"
		"transform": "translate(0," + (ggl.h) + ")"
	}

# svg
# 	.append "g"
# 	.attr {
# 		"class": "xGrid"
# 	}



# {
	# "name": 
	# "data":  [
	## {
	## 	"value": 1
	## 	"time": 1
	## }
# ]	
# }


buildRange = (rangeObj, ggl)->
	## if not specified domain setup default range
	loc = {}
	useRangeObj = (attr)->
		if rangeObj is not undefined and (rangeObj[attr] is not undefined)
			loc[attr] := rangeObj[attr]
		else 
			loc[attr] := ggl[attr]	
	["w", "h"] |> _.map useRangeObj
	loc

pathStyle = ->
	it.style {
		"fill": "none"
		"stroke": -> colorbrewer[ggl.colorscheme]["9"][~~(Math.random! * 5) + 3]
		# ["5"]
		"stroke-width": "4px"
	}

appendPath = ->
	it
		.on "mouseover", (it, i)->
			d3.selectAll "." + ggl.pathClass + ":not(.p" + it.name + ")"
				.transition!
				.delay (it, i)-> i * 50
				.style {
					"opacity": 0.05
				}

			d3.selectAll ".p" + it.name
				.transition!
				.style {
					"opacity": 1
				}
		.on "mouseout", (it, i)->
			d3.selectAll "." + ggl.pathClass
				.transition!
				.delay (it, i)-> i * 50
				.style {
					"opacity": 1
				}
		.style {
			"stroke-dasharray": -> 
				l = (d3.select @ ).node!.getTotalLength!
				l + " " + l
			"stroke-dashoffset": -> (d3.select @ ).node!.getTotalLength!
		}
		.transition!
		.duration 2000
		.style {
			"stroke-dashoffset": 0
		}


flag = true

initHeatHis = (data, rangeObj)->
	loc = buildRange rangeObj, ggl
	allData = data |> _.map (.data ) |> _.flatten

	# xScale = d3.scale.linear!
	# 	.domain d3.extent(allData, -> it.time)
	# 	.range [0, loc.w]

	cScale = d3.scale.quantile!
		.domain d3.extent(allData, -> it.value)
		.range colorbrewer[ggl.colorscheme]["9"]

	loc.rectW = 20
	loc.rectH = 10
	loc.rectMW = 5
	loc.rectMH = 5

	svg
		.selectAll "blank"
		.data data
		.enter!
		.append "g"
		.attr {
			"transform": (it, i)-> "translate(0," + (i * (loc.rectH + loc.rectMH) ) + ")"
		}
		.selectAll "rect"
		.data -> it.data
		.enter!
		.append "rect"
		.attr {
			"x": (it, i)-> i * (loc.rectW + loc.rectMW)
			"y": (it, i)-> 0
			"width": loc.rectW
			"height": loc.rectH
		}
		.style {
			"fill": -> cScale it.value
		}

initIndPath = (data, rangeObj)->
	loc = buildRange rangeObj, ggl

	allData = data |> _.map (.data ) |> _.flatten

	xScale = d3.scale.linear!
		.domain d3.extent(allData, -> it.time)
		.range [0, loc.w]

	l = data.length
	loc.indH = loc.h / l
## maybe should make the single yscale the same struct as well
	yScale = {}
	initYScale = (row)->
		d3.scale.linear!
			.domain d3.extent row.data, -> it.value
			.range [loc.indH, 0]
	data |> _.map (-> yScale[it.name] := (initYScale it))
	pathFunc = {}
	initPathFunc = (row)->
		d3.svg.line!
			.interpolate "monotone"
			.x -> xScale it.time
			.y -> yScale[row.name] it.value

	data |> _.map (-> pathFunc[it.name] := (initPathFunc it))

	pathAll = ->
		it
			.attr {
				"class": ggl.pathClass
				"d": -> it.data |> pathFunc[it.name]
				"transform":(it, i)-> "translate(0," + (i * loc.indH) + ")"
			}
			.call pathStyle

	p = svg
		.selectAll "." + ggl.pathClass
		.data data

	p
		.transition!
		.duration 3000
		.delay (it, i)-> i * 100
		.call pathAll

	p
		.enter!
		.append "path"
		.call pathAll


initPath = (data, rangeObj)->
	loc = buildRange rangeObj, ggl
	allData = data |> _.map (.data ) |> _.flatten
	
	# if flag
	# 	flag := false
	# 	yScale = d3.scale.linear!
	# 		.domain d3.extent(allData, -> it.value)
	# 		.range [loc.h, 0]
	# else
	# 	yScale = d3.scale.linear!
	# 		.domain d3.extent(allData, -> it.value)
	# 		.range [loc.h / 2, 0]

	xScale = d3.scale.linear!
		.domain d3.extent(allData, -> it.time)
		.range [0, loc.w]

	yScale = d3.scale.linear!
		.domain d3.extent(allData, -> it.value)
		.range [loc.h, 0]

	xAxisFunc = d3.svg.axis!
		.scale xScale
		.orient "bottom"
		.ticks 6

	yAxisFunc = d3.svg.axis!
		.scale yScale
		.orient "right"
		.ticks 4

	pathFunc = d3.svg.line!
		.interpolate "monotone"
		.x -> xScale it.time
		.y -> yScale it.value

	pathAll = ->
		it
			.attr {
				"d": -> pathFunc it.data
				"class": (it, i)-> ggl.pathClass + " p" + it.name
			}
			.call pathStyle

	svg
		.selectAll ".horizonGrid"	
		.data yScale.ticks 4
		.enter!
		.append "line"
		.attr {
			"class": "horizonGrid"
			"x1": ggl.margin.right
			"x2": ggl.w
			"y1": yScale
			"y2": yScale
			"fill": "none"
			"shape-rendering" : "crispEdges"
			"stroke" : "grey"
			"stroke-width" : "1px"
		}

	svg
		.selectAll ".verticalGrid"	
		.data xScale.ticks 6
		.enter!
		.append "line"
		.attr {
			"class": "verticalGrid"
			"x1": xScale
			"x2": xScale
			"y1": 0
			"y2": ggl.h
			"fill": "none"
			"shape-rendering" : "crispEdges"
			"stroke" : "grey"
			"stroke-width" : "1px"
		}

	p = svg
		.selectAll "." + ggl.pathClass
		.data data
	p
		.transition!
		.call pathAll
	p
		.enter!
		.append "path"
		.call pathAll
		.call appendPath

	xAxis = svg
		.selectAll ".xAxis"

	xAxis
		.transition!
		.call xAxisFunc

	yAxis = svg
		.selectAll ".yAxis"

	yAxis
		.transition!
		.call yAxisFunc


initCell = (row)->
	{
		"name": row
		"data": ([1 to 20] |> _.map (cell)-> {"value": (if row < 3 then Math.random! else Math.random! * 10) , "time": cell})
	}

initData = ->
	[1 to 10] |> _.map initCell
		
initSingleData = ->
	[1 to 1] |> _.map initCell



# initSingleData! |> initPath
d = initData!
d |> initPath

# # initIndPath
# # initPath
# # initHeatHis
# # initPath