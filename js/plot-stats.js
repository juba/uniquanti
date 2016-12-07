function stats_compute(data) {
    var stats = [];
    var jitter = d3.select("#points_jitter").node().checked;
    var delta = jitter ? 1 : 0;
    if (d3.select("#stats_median").node().checked) {
	stats.push({x: d3.median(data, function(d) { return d.x;}),
		    y: 0.5 + delta,
		    col: "#540d6e",
		    type: "quant",
		    lab: "Médiane",
		    key: "median"});
    };
    if (d3.select("#stats_quartiles").node().checked) {
	stats.push({x: d3.quantile(data.map(function(d) { return d.x;}).sort(), 0.25),
		    y: 0.5 + delta,
		    col: "#0ead69",
		    type: "quant",
		    lab: "Q1 25%",
		    key: "quart1"});
	stats.push({x: d3.quantile(data.map(function(d) { return d.x;}).sort(), 0.75),
		    y: 0.5 + delta,
		    col: "#0ead69",
		    type: "quant",
		    lab: "Q3 75%",
		    key: "quart3"});
    }
    if (d3.select("#stats_sd").node().checked) {
	stats.push({sd: d3.deviation(data, function(d) { return d.x;}),
		    x: d3.mean(data, function(d) { return d.x;}),
		    y: -0.9 - delta,
		    col: "#fe5276",
		    type: "sd",
		    lab: "Écart-type",
		    key: "sd"});
    };
    if (d3.select("#stats_mean").node().checked) {
	stats.push({x: d3.mean(data, function(d) { return d.x;}),
		    y: -0.6 - delta,
		    col: "#bb1236",
		    type: "mean",
		    lab: "Moyenne",
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
	    return draw_line([{x:scales.x(d.x), y: scales.y(0)},
			      {x:scales.x(d.x), y: scales.y(d.y)}]);
	})
	.style("stroke", function(d) {return d.col;});
    selection
    	.filter(function(d) {return d.type == "quant";})
	.attr("d", function(d) {
	    return draw_line([{x:scales.x(d.x), y: scales.y(0)},
			      {x:scales.x(d.x), y: scales.y(d.y)}]);
	})
	.style("stroke", function(d) {return d.col;})
	.style("stroke-width", 1);

    selection
    	.filter(function(d) {return d.type == "sd";})
	.attr("d", function(d) {
	    return draw_line([{x:scales.x(d.x - d.sd/2), y: scales.y(d.y + 0.3)},
			      {x:scales.x(d.x + d.sd/2), y: scales.y(d.y + 0.3)}]);
	})
	.style("stroke-width", 1)
	.style("stroke", function(d) {return d.col;});
    return selection;
}

function stats_label_formatting(selection, scales) {
    selection
	.attr("class", "stats_label")
	.attr("text-anchor", "middle")
	.attr("font-weight", "bold")
	.style("font-size", "11px")
	.style("fill", function(d) {return d.col;})
	.attr("transform", function(d) {
	    return(translation(d, scales));
	})
	.attr("dy", function(d) { return d.type == "quant" ? -10 : 15; })
	.text(function(d) {
	    var val = d.key == "sd" ? d.sd : d.x;
	    return d.lab + ": " + val.toFixed(1);});
    return selection;
}

