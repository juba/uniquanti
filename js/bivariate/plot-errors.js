// Regression errors line and points

var draw_error_line = d3.line()
    .x(function(d) {return d.x;})
    .y(function(d) {return d.y;});

function error_init(selection) {
    selection
	.attr("class", "line");
    return selection;
}

function error_formatting(selection, dims, scales) {
    selection
	.attr("d", function(d) {
	    return draw_error_line([{x: scales.x(d.x), y: scales.y(d.ystart)},
			      {x: scales.x(d.x), y: scales.y(d.yend)}]);
	})
	.style("stroke-width", "1px")
	.style("stroke", function(d) {
	    return d.stroke !== undefined && d.stroke !== null ? d.stroke : "#000000";
	})
	.style("stroke-dasharray", function(d) {
	    return [2,3];
	});

    return selection;
}

function error_dot_init (selection, scales, settings) {
    selection
	.style("stroke", function(d) { return d.col;})
	.style("opacity", settings.points_opacity)
    	.style("fill", "none")
        .attr("d", d3.symbol().size(settings.points_size * 0.4));
}

// Apply format to dot
function error_dot_formatting(selection, scales, settings) {
    var sel = selection
        .attr("transform", function(d) { return translation(d, scales); });
    return sel;
}
