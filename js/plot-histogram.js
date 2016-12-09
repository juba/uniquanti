

// Compute bins
function compute_bins(data, settings) {

    if (settings.graph_type != "hist") return [];

    var breaks = [];
    if (settings.hist_exact) {
	var min_x = d3.min(data, function(d) { return(d.x);} );
	var max_x = d3.max(data, function(d) { return(d.x);} );
	var len = (max_x - min_x) / (parseInt(settings.hist_classes)) * 1.01;
	for (var i = min_x + len; i <= max_x; i += len) {
	    breaks.push(i);
	}
    } else {
	breaks = settings.hist_classes;
    }

    var bins = d3.histogram()
	.thresholds(breaks)
    (data.map(function(d) {return d.x;}));

    bins.map(function(d, i) {
	d.key = i;
	return d;
    });

    return bins;
}

// Compute histogram y scale
function compute_hist_scales(scales, bins, settings) {
    scales.y_graph = d3.scaleLinear()
	.range([400, 0]);
    if (settings.y_manual) {
	var min_y = parseFloat(settings.y_min);
	var max_y = parseFloat(settings.y_max);
	scales.y_graph
	    .domain([min_y, max_y]);
    } else {
	scales.y_graph
	    .domain([0, d3.max(bins, function(d) { return d.length; })])
	    .nice();
    }
    scales.y_graph_orig = scales.y_graph;
    scales.yAxis_graph = d3.axisLeft(scales.y_graph)
        .tickSize(5);
    
    return scales;
}

// Initial bar attributes
function bar_init(selection, scales) {
    selection
	.style("fill", "#e0c879")
    	.attr("height", function(d) { return 400 - scales.y_graph(d.length); })
	.attr("transform", function(d) { return "translate(" + scales.x(d.x0) + "," + scales.y_graph(d.length) + ")"; });
    return selection;
}

// Apply format to bar
function bar_formatting(selection, scales, bins) {
    var w = 0;
    if (bins[0] !== undefined) {
	w = scales.x(bins[0].x1) - scales.x(bins[0].x0) - 1;
    }
    selection
      	.attr("width", w)
	.attr("height", function(d) {
	    return 400 - scales.y_graph(d.length); })
	.attr("transform", function(d) { return "translate(" + scales.x(d.x0) + "," + scales.y_graph(d.length) + ")"; });
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


