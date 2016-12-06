function stats_compute(data) {
    var stats = [];
    if (d3.select("#stats_mean").node().checked) {
	stats.push({x: d3.mean(data, function(d) { return d.x;}),
		    y: -2.5,
		    col: "#FF0000",
		    type: "triangle",
		    lab: "Moyenne",
		    key: "mean"});
    };
    if (d3.select("#stats_median").node().checked) {
	stats.push({x: d3.median(data, function(d) { return d.x;}),
		    y: -1.5,
		    col: "#009900",
		    type: "line",
		    lab: "Médiane",
		    key: "median"});
    };
    if (d3.select("#stats_quartiles").node().checked) {
	stats.push({x: d3.quantile(data, 0.25, function(d) { return d.x;}),
		    y: -1.5,
		    col: "#009900",
		    type: "line",
		    lab: "Premier quartile",
		    key: "quart1"});
	stats.push({x: d3.quantile(data, 0.75, function(d) { return d.x;}),
		    y: -1.5,
		    col: "#009900",
		    type: "line",
		    lab: "Troisième quartile",
		    key: "quart3"});
    }
    if (d3.select("#stats_sd").node().checked) {
	stats.push({sd: d3.deviation(data, function(d) { return d.x;}),
		    x: d3.mean(data, function(d) { return d.x;}),
		    y: -3.5,
		    col: "#000099",
		    type: "hline",
		    lab: "Écart-type",
		    key: "sd"});
    };
    return stats;
}

function stats_symbol_formatting(selection, scales) {
    selection = selection
    	.attr("class", "stats_symbol");
    selection
	.filter(function(d) {return d.type == "triangle";})
	.attr("d", d3.symbol().type(d3.symbolTriangle).size(100))
	.style("fill", function(d) {return d.col;})
	.attr("transform", function(d) {
	    return(translation(d, scales));
	});
    selection
    	.filter(function(d) {return d.type == "line";})
	.attr("d", function(d) {
	    return draw_line([{x:scales.x(d.x), y: scales.y(-1.5)},
			      {x:scales.x(d.x), y: scales.y(1.5)}]);
	})
	.style("stroke", function(d) {return d.col;})
    	.style("stroke-dasharray", [1,3]);
    selection
    	.filter(function(d) {return d.type == "hline";})
	.attr("d", function(d) {
	    return draw_line([{x:scales.x(d.x - d.sd/2), y: scales.y(-3.5)},
			      {x:scales.x(d.x + d.sd/2), y: scales.y(-3.5)}]);
	})
	.style("stroke", function(d) {return d.col;});
    return selection;
}

function stats_label_formatting(selection, scales) {
    selection
	.attr("class", "stats_label")
	.attr("text-anchor", "middle")
	.style("font-size", "11px")
	.style("fill", function(d) {return d.col;})
	.attr("transform", function(d) {
	    return(translation(d, scales));
	})
	.attr("dy", "20")
	.text(function(d) {
	    var val = d.key == "sd" ? d.sd : d.x;
	    return d.lab + ": " + val.toFixed(2);});
    return selection;
}



function median_symbol_formatting(selection, scales) {
    selection
	.attr("d", function(d) {
	    return draw_line([{x:scales.x(d.x), y: scales.y(-2)},
			      {x:scales.x(d.x), y: scales.y(2)}]);
	})
	.attr("class", "median_symbol")
	.style("stroke", "rgb(100,0,0)")
    	.style("stroke-dasharray", "[2,2]");
    return selection;
}


