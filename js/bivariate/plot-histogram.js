

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
	d.val = d.length;
	if (settings.hist_percent) {
	    d.val = d.val / data.length * 100;
	}
	return d;
    });

    return bins;
}

// Compute histogram y scale
function compute_hist_scales(scales, bins, settings, dragging) {

    if (settings.y_manual) {
	var min_y = parseFloat(settings.y_min);
	var max_y = parseFloat(settings.y_max);
	scales.y_graph = d3.scaleLinear()
	    .range([400, 0])
	    .domain([min_y, max_y]);
    } else {
	var y_max = d3.max(bins, function(d) { return d.val; });
	var domain_max = y_max * 1.2;
	if (dragging) {
	    var current_max = scales.y_graph.domain()[1];
	    if (y_max <= current_max) domain_max = current_max;
	} 
	scales.y_graph = d3.scaleLinear()
	    .range([400, 0])
	    .domain([0, domain_max])
	    .nice();
    }

    scales.y_graph_orig = scales.y_graph.copy();
    scales.yAxis_graph = d3.axisLeft(scales.y_graph)
        .tickSize(5);
    
    return scales;
}

// Initial bar attributes
function bar_init(selection, scales) {
    selection
	.style("fill", "#fd9f00")
    	.attr("height", function(d) { return 400 - scales.y_graph(d.val); })
	.attr("transform", function(d) { return "translate(" + scales.x(d.x0) + "," + scales.y_graph(d.val) + ")"; });
    return selection;
}

// Apply format to bar
function bar_formatting(selection, scales, bins) {
    var w = 0;
    if (bins !== undefined && bins[1] !== undefined) {
	w = scales.x(bins[1].x1) - scales.x(bins[1].x0) - 1;
    }
    selection
      	.attr("width", function(d,i) {
	    if (i == 0) {
		return scales.x(d.x1) - scales.x(d.x0) - 1;
	    } else {
		return w;
	    }
	})
	.attr("height", function(d) {
	    return 400 - scales.y_graph(d.val); })
	.attr("transform", function(d) { return "translate(" + scales.x(d.x0) + "," + scales.y_graph(d.val) + ")"; });
}

// Initial bar label attributes
function bar_label_init(selection, scales) {
    selection
	.style("fill", "#fff")
    	.style("font-size", "10px")
    	.attr("text-anchor", "middle")
	.attr("dy", "1.5em")
    	.attr("x", function(d) {
	    return scales.x(d.x0) + (scales.x(d.x1) - scales.x(d.x0)) / 2;
	})
    	.attr("y", function(d) {
	    return scales.y_graph(d.val);
	});
    return selection;
}

// Apply format to bar label
function bar_label_formatting(selection, scales, settings) {
    selection
	.attr("x", function(d) {
	    return scales.x(d.x0) + (scales.x(d.x1) - scales.x(d.x0)) / 2;
	})
    	.attr("y", function(d) {
	    return scales.y_graph(d.val);
	})
	.text(function(d) {
	    if (settings.hist_percent) {
		return d.val.toFixed(1) + "%";
	    }
	    return d.val;
	})
	.style("opacity", function(d) {
	    return d.val == 0 ? 0 : 1;
	});
    return selection;
}


