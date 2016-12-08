

// Compute bins
function compute_bins(data, settings) {

    if (!settings.hist_show) return [];
    
    var breaks = [];
    var min_x = d3.min(data, function(d) { return(d.x);} );
    var max_x = d3.max(data, function(d) { return(d.x);} );
    var len = (max_x - min_x) / parseInt(settings.hist_classes);
    for (var i = min_x; i < max_x; i += len) {
	breaks.push(i);
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
function compute_hist_scales(scales, bins) {
    scales.y_hist = d3.scaleLinear()
	.domain([0, d3.max(bins, function(d) { return d.length; })])
	.nice()
        .range([400, 0]);
    scales.y_hist_orig = scales.y_hist;
    scales.yAxis_hist = d3.axisLeft(scales.y_hist)
        .tickSize(5);

    return scales;
}

// Initial bar attributes
function bar_init(selection, scales) {
    selection
	.style("fill", "#FF386D")
    	.attr("height", function(d) { return 400 - scales.y_hist(d.length); })
	.attr("transform", function(d) { return "translate(" + scales.x(d.x0) + "," + scales.y_hist(d.length) + ")"; })
	.attr("x", 1);
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
	    return 400 - scales.y_hist(d.length); })
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


