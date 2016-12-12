function stats_compute(data, settings) {
    var stats = [];
    var delta = settings.jitter ? 1 : 0;
    var sorted_data = data.map(function(d) { return d.x;}).sort(d3.ascending);
    if (settings.stats_median) {
	stats.push({x: d3.median(data, function(d) { return d.x;}),
		    y: 0.5 + delta,
		    col: "#540d6e",
		    type: "quant",
		    lab: ":median:".toLocaleString(),
		    key: "median"});
    };
    if (settings.stats_quartiles) {
	stats.push({x: d3.quantile(sorted_data, 0.25),
		    y: 0.5 + delta,
		    col: "#0ead69",
		    type: "quant",
		    lab: "Q1",
		    key: "quart1"});
	stats.push({x: d3.quantile(sorted_data, 0.75),
		    y: 0.5 + delta,
		    col: "#0ead69",
		    type: "quant",
		    lab: "Q3",
		    key: "quart3"});
    }
    if (settings.stats_sd) {
	stats.push({sd: d3.deviation(data, function(d) { return d.x;}),
		    x: d3.mean(data, function(d) { return d.x;}),
		    y: -1.1 - delta,
		    col: "#fe5276",
		    type: "sd",
		    lab: ":sd:".toLocaleString(),
		    key: "sd"});
    };
    if (settings.stats_mean) {
	stats.push({x: d3.mean(data, function(d) { return d.x;}),
		    y: -0.6 - delta,
		    col: "#bb1236",
		    type: "mean",
		    lab: ":mean:".toLocaleString(),
		    key: "mean"});
    };
    return stats;
}

function stats_symbol_formatting(selection, scales) {
    selection = selection
    	.attr("class", "stats_symbol");
    selection
	.filter(function(d) {return d.type == "mean";})
    	.attr("d", function(d) {
	    return draw_line([{x:scales.x(d.x), y: scales.y_points(0)},
			      {x:scales.x(d.x), y: scales.y_points(d.y)}]);
	})
	.style("stroke", function(d) {return d.col;});
    selection
    	.filter(function(d) {return d.type == "quant";})
	.attr("d", function(d) {
	    return draw_line([{x:scales.x(d.x), y: scales.y_points(0)},
			      {x:scales.x(d.x), y: scales.y_points(d.y)}]);
	})
	.style("stroke", function(d) {return d.col;})
	.style("stroke-width", 1);

    selection
    	.filter(function(d) {return d.type == "sd";})
	.attr("d", function(d) {
	    return draw_line([{x:scales.x(d.x - d.sd/2), y: scales.y_points(d.y)},
			      {x:scales.x(d.x + d.sd/2), y: scales.y_points(d.y)}]);
	})
	.style("stroke-width", 1)
	.style("stroke", function(d) {return d.col;});
    return selection;
}

function stats_label_formatting(selection, scales) {
    selection
	.attr("class", "stats_label")
	.attr("text-anchor", "middle")
	.style("font-size", "12px")
	.style("fill", function(d) {return d.col;})
	.attr("transform", function(d) {
	    return(translation(d, scales));
	})
	.attr("dy", function(d) { return d.type == "quant" ? -10 : 15; })
	.text(function(d) {
	    var val = d.key == "sd" ? d.sd : d.x;
	    return  d.lab + ": " + val.toFixed(1);});
    return selection;
}

