// Initial dot attributes
function dot_init (selection, scales, settings, xlab, ylab) {
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
	    .html(tooltip_content(d, xlab, ylab));
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
	.style("text-anchor", "middle")
	.attr("dy", -10)
    	.attr("dx", 0)
	.text(function(d) {return d.lab;});
}

function label_formatting (selection, scales, settings) {
    selection
        .attr("transform", function(d) { return translation(d, scales); });
}

function x_rug_init (selection, scales, settings) {
    selection
	.style("stroke", "rgb(31, 119, 180)")
    	.style("stroke-width", "1")
	.attr("d", "M 0 0 L 0 -10");
}

function x_rug_formatting (selection, scales, settings) {
    selection
        .style("opacity", Math.min(1, settings.points_opacity + 0.2))
	.attr("transform", function(d) {
	    return "translate(" + scales.x(d.x) + "," + (scales.y(scales.y.domain()[0])) + ")";
	});
}

function y_rug_init (selection, scales, settings) {
    selection
	.style("stroke", "rgb(31, 119, 180)")
    	.style("opacity", settings.points_opacity)
	.attr("d", "M 0 0 L 10 0");
}

function y_rug_formatting (selection, scales, settings) {
    selection
        .style("opacity", Math.min(1, settings.points_opacity + 0.2))
	.attr("transform", function(d) {
	    return "translate(" + 0 + "," + scales.y(d.y) + ")";
	});
}
