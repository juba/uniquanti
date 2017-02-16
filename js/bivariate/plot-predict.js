// Regression prediction line and points

var draw_predict_line = d3.line()
    .x(function(d) {return d.x;})
    .y(function(d) {return d.y;});

var predict_items_colors = "#0AAFF1";

function predict_line_init(selection) {
    selection
	.attr("class", "line")
    	.style("stroke-width", "1px")
	.style("stroke", predict_items_colors)
	.style("stroke-dasharray", function(d) {
	    return [2,2];
	});
    return selection;
}

function predict_line_formatting(selection, scales) {
    selection
	.filter(function(d) {return d.type == "base";})
	.attr("d", function(d) {
	    return draw_predict_line([{x: scales.x(d.x), y: scales.y(scales.y.domain()[0])},
			      {x: scales.x(d.x), y: scales.y(d.y)}]);
	});
    selection
	.filter(function(d) {return d.type == "h_line";})
	.attr("d", function(d) {
	    return draw_predict_line([{x: scales.x(d.x), y: scales.y(d.y)},
				      {x: scales.x(scales.x.domain()[0]) + 35, y: scales.y(d.y)}]);
	});
    return selection;
}

function predict_dot_init (selection) {
    selection
    	.filter(function(d) {return d.type == "base";})
	.style("stroke", predict_items_colors)
	.style("opacity", 1)
    	.style("fill", "none")
        .attr("d", d3.symbol(d3.symbolCircle).size(64));
}

// Apply format to dot
function predict_dot_formatting(selection, scales) {
    var sel = selection
	.filter(function(d) {return d.type == "base";})
        .attr("transform", function(d) { return translation(d, scales); });
    return sel;
}

function predict_label_init (selection) {
    selection
    	.filter(function(d) {return d.type == "base";})
	.style("stroke", predict_items_colors)
	.style("opacity", 1)
    	.style("fill", "none")
        .attr("d", d3.symbol(d3.symbolCircle).size(64));
}

function predict_label_formatting(selection, scales) {
    var sel = selection
	.filter(function(d) {return d.type == "base";})
	.style("font-size", "12px")
	.style("fill", predict_items_colors)
    	.attr("text-anchor", "middle")
    	.text(function(d) { return ":predicted:".toLocaleString() + ": " + d.y.toFixed(2);})
	.attr("transform", function(d) {
	    return( "translate(" + scales.x(scales.x.domain()[0]) + "," + scales.y(d.y) + ") rotate(-90)");
	})
    	.attr("dy", 26);
    return sel;
}
