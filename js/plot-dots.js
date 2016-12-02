// Initial dot attributes
function dot_init (selection, scales) {
    // tooltips when hovering points
    var tooltip = d3.select(".tooltip");
    selection.on("mouseover", function(d, i){
        d3.select(this)
            .transition().duration(150)
            .attr("d", d3.symbol().size(450));
	tooltip.style("visibility", "visible")
	    .html(tooltip_content(d));
    });
    selection.on("mousemove", function(){
	    tooltip.style("top", (d3.event.pageY+15)+"px").style("left",(d3.event.pageX+15)+"px");
    });
    selection.on("mouseout", function(){
        d3.select(this)
            .transition().duration(150)
            .attr("d", d3.symbol().size(100));
        tooltip.style("visibility", "hidden");
    });
}

// Apply format to dot
function dot_formatting(selection, scales) {
    var sel = selection
        .attr("transform", function(d) { return translation(d, scales); })
    // fill color
        .style("fill", "rgb(31, 119, 180)")
	.style("opacity", "0.8")
    // symbol and size
        .attr("d", d3.symbol().size(100))
        .attr("class", function(d,i) {
	    return "dot"; 
        });
    return sel;
}
