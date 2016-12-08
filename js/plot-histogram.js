

// Initial bar attributes
function bar_init (selection, scales, settings) {
    selection
	.style("fill", "steelblue")
	.attr("x", 1);
    return selection;
}

// Apply format to bar
function bar_formatting(selection, scales, settings) {
    selection
      	.attr("width", scales.x(scales.bins[0].x1) - scales.x(scales.bins[0].x0) - 1)
	.attr("height", function(d) { return height - scales.y_hist(d.length); })
	.attr("transform", function(d) { return "translate(" + scales.x(d.x0) + "," + scales.y_hist(d.length) + ")"; });
}


// Apply format to bar label
function bar_label_formatting(selection, scales, settings) {
    selection
	.append("text")
	.attr("dy", ".75em")
	.attr("y", 6)
	.attr("x", (scales.x(scales.bins[0].x1) - scales.x(scales.bins[0].x0)) / 2)
	.style("font-size", "10px")
	.style("fill", "#fff")
	.attr("text-anchor", "middle")
	.text(function(d) { return d.length; });
    return selection;
}


