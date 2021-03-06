_ = require "prelude-ls"


focusMonth = (->)
focusWeekDays = (->)
focusMonthYear = (->)

f = ->
	d3.selectAll '#map'
		.style {
			"position": "fixed"
		}


initCrossMap = (csvUrl)->
	### TODO remove map style
	### use canvas instead of SVG
	colorYellow = "rgb(255, 204, 0)"
		# '#cc3333'
		# "rgb(255, 204, 0)"
	lngDim = null
	latDim = null
	projection = null

	overlay = null
	padding = 5
	mapOffset  = 4000
	weekDayTable = ["Sun.", "Mon.", "Tue.", "Wed.", "Thu.", "Fri.", "Sat."]
	gPrints = null

	monthDim = null
	weekdayDim = null
	hourDim = null
	map = null
	# barAcciHour = null

	monthLs = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."]
	monthTbl = _.lists-to-obj [1 to 12], monthLs
	toYearMonth = (y, m)->
		monthTbl[m] + " '" + (y + "" |> _.Str.drop 2)

	

	err, mapStyle <- d3.json "./mapstyle/dark2.json"
	styledMap = new google.maps.StyledMapType( mapStyle, {name: "Styled Map"})

	initMap = -> 
		map := new google.maps.Map(d3.select "\#map" .node!, {
			zoom: 6,
			center: new google.maps.LatLng(-29.50049956558744, 28.1287285456758131),
			scrollwheel: false,
			mapTypeControlOptions:{
				mapTypeId: [google.maps.MapTypeId.ROADMAP, 'map_style']
				
			}
		})

		google.maps.event.addListener(map, "bounds_changed", -> 
			bounds = @getBounds!
			northEast = bounds.getNorthEast!
			southWest = bounds.getSouthWest!

			console.log [(southWest.lng! + northEast.lng!) / 2, (southWest.lat! + northEast.lat!) / 2]

			lngDim.filterRange([southWest.lng!, northEast.lng!])
			latDim.filterRange([southWest.lat!, northEast.lat!])

			dc.redrawAll!
		)

		map.mapTypes.set('map_style', styledMap)
		map.setMapTypeId('map_style')

		overlay.setMap(map)



	transform = (d)->

		d = new google.maps.LatLng(d.GoogleLat, d.GoogleLng)
		d = projection.fromLatLngToDivPixel(d)

		return d3.select(this)
			.style("left", (d.x - padding) + "px")
			.style("top", (d.y - padding) + "px")

	ifdead = (it, iftrue, iffalse)-> if (it.dead > 0) then iftrue else iffalse

	setCircle = ->
		it.attr {
			"cx": -> it.coorx
			"cy": -> it.coory
			"r": -> "5px"
			# ifdead it, "5px", "2.5px"
		}
		.style {
			"fill": -> colorYellow
			"position": "absolute"
			"opacity": 0.3
			# -> 0.3
		}

	initCircle = ->
		it.attr {
			"r": 0
		}
		# it.style {
		# 	"opacity": 0
		# }

	tranCircle = ->
		it.attr {
			"r": 20
		}

	finalCircle = ->
		it.attr {
			"r": "5px"
		}



	updateGraph = ->

		dt = gPrints.selectAll "circle"
			.data monthDim.top(Infinity)

		dt
			.call setCircle
			.transition!
			.call tranCircle
			.transition!
			.call finalCircle
			
		
		dt
			.enter!
			.append "circle"
			.call setCircle
			.transition!
			.call tranCircle
			.transition!
			.call finalCircle

		dt
			.exit!
			.remove!



	err, tsvBody <- d3.csv csvUrl
	# "./Sorted_Protest_Data_South_Africa.csv"


	# # deadData = []
	tsvBody.filter ->
		c = it.Coordinates
		s = c.split ","
		it.GoogleLng = +s[1]
		it.GoogleLat = +s[0]
		it.date = new Date(it.Start_Date)
		it.month = it.date.getMonth! + 1
		it.hour = it.date.getHours!
		it.year = it.date.getFullYear!

		it.monthyear = toYearMonth it.year, it.month
		
		it.week = weekDayTable[it.date.getDay!]
		true

	####map
	overlay := new google.maps.OverlayView!

	overlay.onAdd = ->

		layer = d3.select(@getPanes().overlayLayer).append("div")
			.attr("class", "stationOverlay")

		svg = layer.append "svg"

		gPrints := svg.append "g"
			.attr {
				"class" "gPrints"
			}

		svg
			.attr {
				"width": mapOffset * 2
				"height": mapOffset * 2
			}
			.style {
				"position": "absolute"
				"top": -1 * mapOffset + "px"
				"left": -1 * mapOffset + "px"
			}


		overlay.draw = ->

			projection := @getProjection()
			
			googleMapProjection = (coordinates)->

				googleCoordinates = new google.maps.LatLng(coordinates[0], coordinates[1])
				pixelCoordinates = projection.fromLatLngToDivPixel googleCoordinates
				[pixelCoordinates.x + mapOffset, pixelCoordinates.y + mapOffset]


			tsvBody.filter ->
				coor = googleMapProjection [it.GoogleLat, it.GoogleLng]
				it.coorx = coor[0]
				it.coory = coor[1]
				true


			dt = gPrints.selectAll "circle"
				.data tsvBody

			dt
				.enter!
				.append "circle"
				.call setCircle

			dt
				.call setCircle

			dt
				.exit!
				.remove!


	#dc.js

	barAcciMonth = dc.barChart("\#AcciMonth")
	barAcciWeekDay = dc.barChart("\#AcciWeekDay")
	barAcciHour = dc.barChart("\#AcciHour")


	ndx = crossfilter(tsvBody)
	all = ndx.groupAll!

	monthDim := ndx.dimension( ->	it.month)
	weekdayDim := ndx.dimension( -> it.week )
	hourDim := ndx.dimension(-> it.monthyear)
	# ( -> it.year + "_" + it.month)
		# it.hour )

	lngDim := ndx.dimension( -> it.GoogleLng )
	latDim := ndx.dimension( -> it.GoogleLat )

	acciMonth = monthDim.group!.reduceCount!
	acciWeekDay = weekdayDim.group!.reduceCount!
	acciHour = hourDim.group!.reduceCount!


	barMt = 350
	barWk = 270
	barHr = 450

	marginMt = {
		"top": 10,
		"right": 10,
		"left": 30,
		"bottom": 20
	}

	marginWk = marginMt
	marginHr = marginMt


	barAcciMonth.width(barMt)
		.height(100)
		.margins(marginMt)
		.dimension(monthDim)
		.group(acciMonth)
		.x(d3.scale.ordinal!.domain(d3.range(1,13)))
		.xUnits(dc.units.ordinal)
		.elasticY(true)
		.colors(colorYellow)
		.on("filtered", (c, f)-> updateGraph!)
		.yAxis!
		.ticks(4)

	barAcciWeekDay.width(barWk)
		.height(100)
		.margins(marginWk)
		.dimension(weekdayDim)
		.group(acciWeekDay)
		.x(d3.scale.ordinal!.domain(weekDayTable))
		.xUnits(dc.units.ordinal)
		.elasticY(true)
		# .gap(4)
		.colors(colorYellow)
		.on("filtered", (c, f)-> updateGraph!)
		.yAxis!
		.ticks(4)

	# dm = ([2012 to 2014].map (y)-> [1 to 12].map (m)-> (y + "_" + m) ) |> _.flatten |> _.drop 18 |> _.take 8
	dm = ([2012 to 2014].map (y)-> [1 to 12].map (m)-> toYearMonth y, m ) |> _.flatten |> _.drop 18 |> _.take 8

	b = barAcciHour.width(barHr)
		.height(100)
		.margins(marginHr)
		.dimension(hourDim)
		.group(acciHour)
		.elasticY(true)
		.colors(colorYellow)
		.on("filtered", (c, f)-> updateGraph!)

	b
		.x(d3.scale.ordinal!.domain(dm))
		.xUnits(dc.units.ordinal)
		.xAxis!
		# .tickFormat -> 
		# 	s = it.split "_"
		# 	monthTbl[s[1]] + "'" + (s[0] |> _.drop 2 )
		# 	"hi"

	b
		.yAxis!
		.ticks(4)

	
	focusMonth := ->
		barAcciMonth.filter it
		dc.redrawAll!

	focusWeekDays := ->
		barAcciWeekDay.filter it
		dc.redrawAll!

	adaptYearMonth = (a)->
		s = a.split "_"
		toYearMonth s[0], s[1]

	focusMonthYear := ->
		if _.is-type 'Array', it 
			barAcciHour.filterAll!
			it |> _.map (a)-> 
				(barAcciHour.filter adaptYearMonth a)
		else 
			it |> barAcciHour.filter
		dc.redrawAll!
	dc.renderAll!
	initMap!


buildNarrative = ->
	err, csvData <- d3.tsv it
	csvData |> buildSlider
	
	 
Parse.initialize("0GI98IoEbwAmZb8zHw2hUj6TgA1M3af5rRKX6eUU", "CJV6NXQXXjCFQsO0vQnZMhGQ1J4I8anfLd7X9iNW")

getURLParameter = (name)->
	(window.location.href |> _.split "id=")[1]
	# decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&]+?)(&|#||$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null

objectId = getURLParameter("id")

Story = Parse.Object.extend("Story")
query = new Parse.Query(Story)	
query.equalTo("objectId", objectId)
query.find({
	success: ( (results)->
		dataURL = results[0].get("Data")
		storyURL = results[0].get("Story")
		dataURL |> initCrossMap 
		storyURL |> buildNarrative

		),
	error: (error)->
		alert("Error: " + error.code + " " + error.message)
})

# setTimeout(f, 1000)
