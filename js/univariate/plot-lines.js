// Zero horizontal and vertical lines
var draw_line = d3.line()
    .x(function(d) {return d.x;})
    .y(function(d) {return d.y;});

function line_init(selection) {
    selection
	.attr("class", "line");
    return selection;
}

function line_formatting(selection, dims, scales) {
    selection
	.attr("d", function(d) {
	    return draw_line([{x:0, y: scales.y_points(d.slope * scales.x.domain()[0] + d.intercept)},
			      {x:dims.width, y: scales.y_points(d.slope * scales.x.domain()[1] + d.intercept)}]);
	})
	.style("stroke-width", function(d) {
	    return d.stroke_width !== undefined && d.stroke_width !== null ? d.stroke_width : "1px";
	})
	.style("stroke", function(d) {
	    return d.stroke !== undefined && d.stroke !== null ? d.stroke : "#000000";
	})
	.style("stroke-dasharray", function(d) {
	    return d.stroke_dasharray !== undefined && d.stroke_dasharray !== null ? d.stroke_dasharray : null;
	});

    return selection;
}
