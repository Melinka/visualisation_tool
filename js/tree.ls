_ = require "prelude-ls"


ggl = {}

ggl.margin = 50
ggl.diameter = 800
ggl.bck_color = "#272727"

ggl.fileName = "All participants"



tree = d3.layout.tree!
	.size [360, ggl.diameter / 2 - 100]
	.separation (a, b)-> (if a.parent is b.parent then 1 else 5) / a.depth
	.children -> it.values
	.sort (a, b)-> 
		if (b.values is undefined) or (b.values is undefined)
			b.value - a.value
		else
			b.values.length - a.values.length

diagonal = d3.svg.diagonal.radial!
	.projection -> [it.y, it.x / 180 * Math.PI]


svgC = d3.select "body"
	.append "svg"
	.attr {
		"width": ggl.diameter + (ggl.margin)
		"height": ggl.diameter	
	}

svg = svgC
	.append "g"
	.attr {
		"transform": "translate(" + (ggl.diameter / 2 + (ggl.margin / 2)) + "," + (ggl.diameter / 2) + ")"
	}

go = ->
	d3.selectAll ".node"
		.transition!
		# .delay (it, i)-> i * 1
		.duration 1000
		.style {
			"opacity": (it, i)-> if Math.random! < 0.8 then 0.1 else 1
		}


appearance = (it, delaying, newopacity)->
	if newopacity is undefined then newopacity = 1
	it
		.style {
			"opacity": 0
		}
		.transition!
		.delay (it, i)-> delaying + i * 10 ##100
		.duration 1000
		.style {
			"opacity": newopacity
		}


buildTree = (tsvData)->
	nest = d3.nest!
		.key -> it.Area
		# .key -> it.Place
		# .key -> it.Occupation
		.key -> it.Gender
		.entries tsvData

	jsonData = {"key": ggl.fileName, "values": nest}

	c = colorbrewer[ggl.colorscheme]["9"] |> _.take 5 |> _.reverse
	dftype = (tsvData |> _.map (-> it.type) |> _.unique  )

	builColorScl = (tsvData)->
		d3.scale.ordinal!
			.domain dftype
			.range c

	pathStyle = ->
		it
			.style {
				"fill": "none"
				"stroke-width": 2px
			}

	textStyle = ->
		it.style {
			"fill": "white"
			"font-family": "monospace"
		}

	colorScl = tsvData |> builColorScl


	# c = svgC.selectAll "rect"
	# 	.data dftype

	# c
	# 	.enter!
	# 	.append "rect"
	# 	.attr {
	# 		"x": -> ggl.diameter - 100
	# 		"y": (it, i)-> ggl.diameter - 200 + i * 20
	# 		"width": 15
	# 		"height": 15
	# 	}
	# 	.style {
	# 		"fill": -> colorScl it
	# 	}

	# c
	# 	.enter!
	# 	.append "text"
	# 	.attr {
	# 		"x": -> ggl.diameter - 80
	# 		"y": (it, i)-> ggl.diameter - 200 + i * 20 + 14
	# 	}
	# 	.style {
	# 		"fill": "white"
	# 	}
	# 	.text -> it


	ggl.nodes = tree.nodes jsonData
	ggl.links = tree.links ggl.nodes

	# getAllParent = (node)->
	# 	# rlst = []
	# 	# if node.parent is not undefined
	# 	# 	rlst.push node.parent.key
	# 	# 	rlst.push (getAllParent node.parent)
	# 	# rlst


	link = svg.selectAll ".link"
		.data ggl.links
		.enter!
		.append "path"
		.attr {
			"class": -> 
				# it |> console.log 
				r = "link"
				if it.target.key is not undefined then r += " l" +  it.target.key
				if it.source.key is not undefined then r += " l" +  it.source.key
				it |> getAllParent |> console.log 
				r
			"d": diagonal
		}
		.call pathStyle
		.style {
			"stroke": (it, i)-> 
				it.target.type |> colorScl
				# cl = if it.target.value is undefined then c[it.target.values.length] else c[it.target.value]
				# if cl is undefined then c[0] else cl
		}
		.call -> appearance it, 1000

	node = svg.selectAll ".node"
		.data ggl.nodes
		.enter!
		.append "g"
		.attr {
			"class": (it, i)-> "node " + (if it.values is undefined then " leaf" else "")
			"transform": -> "rotate(" + (it.x - 90) + ")translate(" + it.y + ")"
		}

	getTotalValue = (node)->
		if node.value is not undefined then return 1 else return (node.values |> _.map getTotalValue |> _.fold1 (+))
		 

	node
		.append "text"
		.attr {
			"dy": ".31em"
			"text-anchor": -> if it.x < 180 then "start" else "end"
			"transform": -> 
				if it.depth >= 2
					if it.x < 180 then "translate(120)" else "rotate(180)translate(-120)"
				else 
					if it.x < 180 then "translate(30)" else "rotate(180)translate(-30)"
		}
		.text -> it.key
			# if it.depth > 2 
			# 	return 
			# if it.depth <= 1
			# 	it.key + "(" + ((getTotalValue it) |>  thousandsComma) + ")"
			# else
			# 	it.key
		.call textStyle
		.style {
			## need to consider nodes outside of leaf
			"fill": "white"
		}
		.call -> appearance it, 3000, 0.8
		# 0.6

ggl.colorscheme = "Oranges"
	# "BuGn"
	# "YlGn"
	# "Greens"
	# "BuGn"

cleanNumber = (num)->
	if ((num is "") or (num is undefined) or (num is null) or (num is "null") ) then return null
	else return +(((num.replace /,/g, "").split ".")[0])

getDigitLength = (num)->
	num.toString!.length

thousandsComma = d3.format "0,000"

chineseFormat = (num)->
	thousandsComma(~~(num / 1000) ) + " 千"
	 

# ggl.labelTbl = {
# 	"樹形": "type"
# 	"區域": "area"
# 	"名稱": "name"
# }

augmentedTsv = (tsvData)->

	tsvData.filter (it, i)->
		it.id = i

		# for attr of ggl.labelTbl
		# 	it[ggl.labelTbl[attr]] = it[attr]

		it.type = it.type.trim!
		it.area = it.area.trim!
		l = it.type.length ## leave last one
		it.type = _.take (l - 1), it.type

		it.value = 1
		it.key = it.subtype
		true

	tsvData


err, tsvData <- d3.tsv "./dumpdata.tsv"

tsvData |> buildTree
# console.log 
# = tsvData |> augmentedTsv |> buildTree
