// Compute boxplot stats
function compute_boxplot_stats(data, settings) {
    var median = d3.median(data, function(d) {return d.x;});
    var sorted_data = data.map(function(d) {return d.x;}).sort(d3.ascending);
    var q1 = d3.quantile(sorted_data, 0.25);
    var q3 = d3.quantile(sorted_data, 0.75);
    var iq = 1.5 * (q3-q1);
    var outliers = data.filter(function(d) {return (d.x < q1 - iq || d.x > q3 + iq);});
    var data_ok = data.filter(function(d) {return (d.x >= q1 - iq && d.x <= q3 + iq);});
    var bmin = d3.min(data_ok.map(function(d) {return d.x;}));
    var bmax = d3.max(data_ok.map(function(d) {return d.x;}));

    return {median: median,
	    q1: q1,
	    q3: q3,
	    bmin: bmin,
	    bmax: bmax,
	    outliers: outliers
	   };
}

function compute_boxplot_median(stats, settings) {
    if (settings.graph_type != "boxplot") return[];
    return [{x: stats.median, key: 1}];
} 

function compute_boxplot_box(stats, settings) {
    if (settings.graph_type != "boxplot") return[];
    return [{x1: stats.q1, x2: stats.q3, key: 1}];
}

function compute_boxplot_whiskers(stats, settings) {
    if (settings.graph_type != "boxplot") return[];
    return [{x1: stats.bmin, x2: stats.q1, key: 1}, {x1: stats.bmax, x2: stats.q3, key: 2}];
}

function compute_boxplot_outliers(stats, settings) {
    if (settings.graph_type != "boxplot") return[];
    return stats.outliers;
}

// Compute boxplot scale
function compute_boxplot_scales(scales, data, settings) {
    scales.y_graph = d3.scaleLinear()
	.range([400, 0])
	.domain([-10, 10]);
    scales.y_graph_orig = scales.y_graph;
    scales.yAxis_graph = d3.axisLeft(scales.y_graph)
        .tickSize(5);
    
    return scales;
}

// Boxplot median line
function boxplot_median_init(selection, scales) {
    selection
	.attr("x1", function(d) {return scales.x(d.x);})
    	.attr("x2", function(d) {return scales.x(d.x);})
        .attr("y1", scales.y_graph(-2))
        .attr("y2", scales.y_graph(2))
	.style("stroke", "#000")
	.style("stroke-width", "2px");
    return selection;
}

function boxplot_median_formatting(selection, scales) {
    selection
    	.attr("x1", function(d) {return scales.x(d.x);})
    	.attr("x2", function(d) {return scales.x(d.x);});
}

// Boxplot box
function boxplot_box_init(selection, scales) {
    selection
	.attr("x", function(d) {return scales.x(d.x1);})
    	.attr("width", function(d) {return scales.x(d.x2) - scales.x(d.x1);})
        .attr("y", scales.y_graph(2))
        .attr("height", scales.y_graph(-2) - scales.y_graph(2))
	.style("stroke", "#000")
	.style("fill", "#f9eae1");
    return selection;
}

function boxplot_box_formatting(selection, scales) {
    selection
    	.attr("x", function(d) {return scales.x(d.x1);})
        .attr("width", function(d) {return scales.x(d.x2) - scales.x(d.x1);});
}

// Boxplot whiskers
function boxplot_whisker_init(selection, scales) {
    selection
	.attr("x1", function(d) {return scales.x(d.x1);})
    	.attr("x2", function(d) {return scales.x(d.x2);})
        .attr("y1", scales.y_graph(0))
        .attr("y2", scales.y_graph(0))
	.style("stroke", "#000")
	.style("stroke-dasharray", [3,3])
	.style("stroke-width", "1px");
    return selection;
}

function boxplot_whisker_formatting(selection, scales) {
    selection
	.attr("x1", function(d) {return scales.x(d.x1);})
    	.attr("x2", function(d) {return scales.x(d.x2);});
}

// Boxplot whiskers bars
function boxplot_whisker_bar_init(selection, scales) {
    selection
	.attr("x1", function(d) {return scales.x(d.x1);})
    	.attr("x2", function(d) {return scales.x(d.x1);})
        .attr("y1", scales.y_graph(-1))
        .attr("y2", scales.y_graph(1))
	.style("stroke", "#000")
	.style("stroke-width", "1px");
    return selection;
}

function boxplot_whisker_bar_formatting(selection, scales) {
    selection
	.attr("x1", function(d) {return scales.x(d.x1);})
    	.attr("x2", function(d) {return scales.x(d.x1);});
}

// Boxplot outliers
function boxplot_outlier_init(selection, scales) {
    selection
	.attr("cx", function(d) {return scales.x(d.x);})
        .attr("cy", scales.y_graph(0))
        .attr("r", 5)
	.style("stroke", "#000")
    	.style("fill", "none")
	.style("stroke-width", "1px");
    return selection;
}

function boxplot_outlier_formatting(selection, scales) {
    selection
    	.attr("cx", function(d) {return scales.x(d.x);});
}
