_ = require "prelude-ls"


initSVG = ->
	f = {}
	f.margin = {top: 100, left: 50, right: 50, bottom: 100}
	f.w = 800 - f.margin.left - f.margin.right
	f.h = 800 - f.margin.top - f.margin.bottom

	d3.select ".svgContainer"
		.append "svg"
		.attr {
			"width": f.w + f.margin.left + f.margin.right
			"height": f.h + f.margin.top + f.margin.bottom
		}
		.append "g"
		.attr {
			"transform": "translate(" + f.margin.left + "," + f.margin.top + ")"
		}

appendCircle = ->
	f = {}
	f.svg = null
	f.selector = "cdots"
	f.data = []
	f.updateModel = (->)
	f.dtsr = 5
	f.lightload = false

	f.textload = false
	f.textModel = (->)


	build = ->
		# console.log f.data
		c = f.svg
			.selectAll "." + f.selector
			.data f.data		
		c
## use the transition on the call side; so that it will send data instead of transition
			## .transition!
			## .duration 1200
			.attr {
				"r": f.dtsr
			}
			.call f.updateModel

		c
			.enter!
			.append "circle"
			.attr {
				# "fill": (it, i)-> it.color
				"class": (it, i)-> f.selector
					# "calldots"
				"r": 0
			}
			.style {
				"fill": ->colorbrewer["Oranges"][9][~~(Math.random! * 7 + 2)]
				# "white"
			}
## use the transition on the call side; so that it will send data instead of transition
			## .transition!
			## .duration 1200
			.attr {
				"r": f.dtsr	
			}
			.call f.updateModel

		c
			.exit!
			.transition!
			.attr {
				"r": 0
			}
			.remove!

		if f.textload
			c
				.enter!
				.append "text"
				.attr {
					"class": "clrnm"
				}
				.style {
					"opacity": 0
				}
				.transition!
				.style {
					"opacity": 1
				}
				.text -> it.name
				.call f.textModel


	for let it of f
		build[it] = (v)-> 
			f[it] := v
			build

	build




### break this into force and position	
buildForce = ->
	f = {}
	f.dtsr = 5
	f.data = []
	f.size = 800
	f.margin = 1.5
	f.svg = d3.select "svg" .select "g"
	f.groupBy = null
	f.grpLength = null
	f.grpColLimit = 6
	f.grpColLength = null
	f.grpEntry = null

	f.getEntryOrder = (type)->
		v = null
		f.grpEntry.map (it, i)->
			if it.key is type
				v := i
		v

	f.BuildTargetFunc = ->
		grpEd = f.data |> _.group-by (-> it[f.groupBy])
		f.grpEntry := grpEd |> d3.entries |> _.sort-by (-> it.value.length) |> _.reverse
		f.grpLength := f.grpEntry.length

	f.targetFunc = (it, i)->
		it.target = {}
		it.target.x = it[f.groupBy] |> f.posX
		it.target.y = it[f.groupBy] |> f.posY
		true

	# ### This should be augmented to other func
	f.posX = (groupByValue)-> 
		f.grpColLength := d3.min [f.grpLength, f.grpColLimit]
		r = -> it % f.grpColLength
		s = d3.scale.ordinal!.domain [0 to (f.grpColLength - 1) ] .rangeBands([0, f.size], 0.5, 0.5)
		groupByValue |> f.getEntryOrder |> r |> s

	f.posY = (groupByValue)-> 
		f.grpRowLength := ~~(f.grpLength / f.grpColLength)
		r = -> ~~(it / f.grpColLength)
		s = d3.scale.ordinal!.domain [0 to (f.grpRowLength - 1) ] .rangeBands([0, f.size], 0.5, 0.5)
		groupByValue |> f.getEntryOrder |> r |> s 

	f.force = null

	ifNaN = -> if isNaN it then 0 else it

	node = []
	function tick (it)
		k = 1 * it.alpha
		f.data.forEach (o, i)->
			o.y += (o.target.y - o.y) * k
			o.x += (o.target.x - o.x) * k

		q = d3.geom.quadtree f.data
		i = 0
		n = f.data.length

		while ++i < n
			q.visit collide f.data[i]

		node
			.attr {
				"cx": -> ifNaN it.x
				"cy": -> ifNaN it.y
			}


	collide = ->
		r = f.dtsr
		nx1 = it.x - r
		nx2 = it.x + r
		ny1 = it.y - r
		ny2 = it.y + r

		(quad, x1, y1, x2, y2)->
			if quad.point && (quad.point is not it)
				x = it.x - quad.point.x
				y = it.y - quad.point.y
				l = Math.sqrt(x * x + y * y) 

				r = 2 * f.dtsr + f.margin

				if l < r
					l = (l - r) / l * 0.5
					it.x -= x *= l
					it.y -= y *= l
					quad.point.x += x
					quad.point.y += y

			x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1

	build = ->
		if ((it[0] |> _.unique)[0] is undefined) or (	(it[0] |> _.unique)[0] is null) then return ##because enter will call this with undefined value
		# it[0][0] |> console.log 
		f.data := it[0] |> _.map (-> it["__data__"] )
		f.BuildTargetFunc f.data
		f.data := f.data.filter f.targetFunc

		f.force := d3.layout.force!
			.nodes f.data
			.links []
			.gravity 0
			.charge 0
			.size [f.size, f.size]
			.on "tick", tick

		node := it
			.data f.data
			.call f.force.drag

		
		d = f.svg.selectAll ".grp" + f.selector
			.data (f.grpEntry |> _.map -> it.key), -> it

		d
			.exit!
			.remove!

		ts = d3.scale.linear!.domain [1, f.grpRowLength] .range [70, 25]

		d
			.enter!
			.append "text"
			.attr {
				"x": (it, i)-> f.posX it
				"y": (it, i)-> (f.posY it) + (ts f.grpRowLength)
				"class": -> "grp" + f.selector + " grp" + it
			}	
			.style {
				"text-anchor": "middle"
				"fill": "rgb(137, 137, 137)"
			}
			.text -> it

		f.force.start!
		# f.force.stop!
		f.force.alpha 0.02
		# f.force.alpha 0.02 #use a much slower alpha


	for let it of f
		build[it] = (v)->  
			f[it] := v
			build

	build

### selector without class dots
hightlightGroup = (name, selector)->
	selector = selector or ".cdots"
	if is-type "String" name
		d3.selectAll "." + selector + ":not(.prm" + name + "), .grp" + selector +  ":not(.grp" + name + ")"
			.style {
				"opacity": 0.2
			}

		d3.selectAll ".prm" + name + ", .grp" + name
			.style {
				"opacity": 1
			}

	else if is-type "Array" name
		d3.selectAll ("." + selector + _.join "" (name.map -> ":not(.prm" + it + ")")) + (",.grp" + selector + (_.join "" (name.map -> ":not(.grp" + it + ")")))
			.style {
				"opacity": 0.2
			}

		d3.selectAll (_.join "," (name.map -> ".prm" + it)) + ", " + (_.join "," (name.map -> ".grp" + it))
			.style {
				"opacity": 1
			}


## {
## 	"labelA": "a"
## 	"labelB": "b"
## 	"labelC": "c"
## }

p = null

err, tsvData <- d3.tsv "dumpdata.tsv"

s = initSVG!
grouping = ->
	appendCircle!
		.svg s
		.data tsvData 
		.updateModel buildForce!.groupBy it

lsExplain = [
	{
		"enter": grouping "Place"
		"text": "There are a lot of people"
	}
	{
		"enter": grouping "Area"
		"text": "The Majority of people comes from Europe."
	}
	{
		"enter": grouping "Occupation"
		"text": "Some other explanation."
	}
	{
		"enter": grouping "Place"
		"text": "Country Breakdown."
	}
]

lsExplain |> buildSlider