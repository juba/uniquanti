// Initial dot attributes
function dot_init (selection, scales, settings) {
    selection
	.style("fill", "rgb(31, 119, 180)")
    // fill color
	.style("opacity", settings.points_opacity)
    // symbol and size
        .attr("d", d3.symbol().size(settings.points_size));
    // tooltips when hovering points
    var tooltip = d3.select(".tooltip");
    selection.on("mouseover", function(d, i){
        d3.select(this)
            .transition().duration(150)
            .attr("d", d3.symbol().size(600));
	tooltip.style("visibility", "visible")
	    .html(tooltip_content(d));
    });
    selection.on("mousemove", function(){
	    tooltip.style("top", (d3.event.pageY+15)+"px").style("left",(d3.event.pageX+15)+"px");
    });
    selection.on("mouseout", function(){
        d3.select(this)
            .transition().duration(150)
            .attr("d", d3.symbol().size(settings.points_size));
        tooltip.style("visibility", "hidden");
    });
}

// Apply format to dot
function dot_formatting(selection, scales, settings) {
    var sel = selection
        .attr("transform", function(d) { return translation(d, scales); });
    return sel;
}


function label_init (selection, scales, settings) {
    selection
	.style("fill", "rgb(31, 119, 180)")
	.style("font-size", "10px")
    	.style("font-weight", "normal")
	.style("text-anchor", "end")
	.attr("dy", 10)
    	.attr("dx", -10)
	.text(function(d) {return d.lab;});
}

function label_formatting (selection, scales, settings) {
    selection
        .attr("transform", function(d) { return translation(d, scales) + "rotate(-45)"; });
}
