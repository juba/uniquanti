// Kde functions. Source : https://bl.ocks.org/mbostock/4341954
function compute_kde_data(data, settings, scales) {
    if (settings.graph_type != "kde") return[];

    function kernelDensityEstimator(kernel, x) {
	return function(sample) {
	    return x.map(function(x) {
		return [x, d3.mean(sample, function(v) { return kernel(x - v); })];
	    });
	};
    }
    
    function epanechnikovKernel(scale) {
	return function(u) {
	    return Math.abs(u /= scale) <= 1 ? .75 * (1 - u * u) / scale : 0;
	};
    }

    var kde = kernelDensityEstimator(epanechnikovKernel(settings.kde_scale), scales.x.ticks(100));
    var kde_data = kde(data.map(function(d) {return d.x;}));
    return kde_data;
}

function add_kde_extremes(kde_data, scales) {
    var domain = scales.x.domain();
    kde_data.push([domain[1],0]);
    kde_data.unshift([domain[0],0]);
    return kde_data;
}

// Compute histogram y scale
function compute_kde_scales(scales, kde_data, settings, dragging) {

    if (settings.y_manual) {
	var min_y = parseFloat(settings.y_min);
	var max_y = parseFloat(settings.y_max);
	scales.y_graph = d3.scaleLinear()
	    .range([400, 0])
	    .domain([min_y, max_y]);
    } else {
	var y_max = d3.max(kde_data.map(function(d) {return d[1];}));
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

    scales.y_graph_orig = scales.y_graph;
    scales.yAxis_graph = d3.axisLeft(scales.y_graph)
        .tickSize(5);

    return scales;
}

// Initial path attributes
function kde_init(selection, scales) {
    selection
	.style("stroke", "#900")
	.style("stroke-linejoin", "round")
	.style("fill", "#FFF5F5")
	.attr("d", d3.line()
	      .curve(d3.curveBasis)
	      .x(function(d) { return scales.x(d[0]); })
	      .y(function(d) { return scales.y_graph(d[1]); }));
    return selection;
}

// Apply format to path
function kde_formatting(selection, scales) {
    selection
    	.attr("d", d3.line()
	      .curve(d3.curveBasis)
	      .x(function(d) { return scales.x(d[0]); })
	      .y(function(d) { return scales.y_graph(d[1]); }));
}
