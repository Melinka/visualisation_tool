_ = require "prelude-ls"



buildSlider = (lsExplain)->
	sld = {}
	sld.screenh = $ window .height!
	sld.hghidx = -1


	ticking = (i)->	
		updtBlackIdxDots = ->	
			d3.selectAll ".idx"
				.style {
					"background-color": (it, i)-> if i is sld.hghidx then "white" else '#272727'
				}
		if i is not sld.hghidx
			# d = if sld.hghidx < i then "d" else "u"
			# if sld.hghidx is not -1
			# 	if d is "d" then lsExplain[sld.hghidx].exit2down! else lsExplain[sld.hghidx].exit2up!
			# 	lsExplain[sld.hghidx].exit!

			sld.hghidx := i
			updtBlackIdxDots!
			# if d is "d" then lsExplain[sld.hghidx].enter2down! else lsExplain[sld.hghidx].enter2up!
			lsExplain[sld.hghidx].enter!

	scrollingTo = (i)-> $("body").scrollTop($ sld.dscrpts[i] .position!.top)

	initSlider = ->
		txt = d3.selectAll ".txtholder"
			.selectAll ".description"
			.data lsExplain
			.enter!

		txt
			.append "div"
			.attr {
				"class": "description"	
			}
			.append "h4"
			.attr {
				"class": "descriptionH4"
			}
			.html -> it.text

		d3.selectAll ".idxholder"
			.selectAll ".idx"
			.data lsExplain
			.enter!
			.append "div"
			.attr {
				"class": "idx"
			}
			.style {
				"cursor": "pointer"
			}
			.on "mousedown" (d,i)-> scrollingTo i

		sld.dscrpts := [].slice.call document.getElementsByClassName("description") # HTMLcollection to list

	scrolling = -> 
		sld.dscrpts.map (it, i)->
			b = it.getBoundingClientRect()
			m = b.top
			lm = sld.screenh / 2

			d3.select it .style "opacity", -> 
				if m < lm
					if m > 0 then ticking i
					m / 100
				else
					1

	initSlider!
	# scrolling!
	$ window .scroll -> scrolling!
	
