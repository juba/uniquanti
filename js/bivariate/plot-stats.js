function stats_compute(data, settings) {
    var stats = [];
    if (settings.stats_sd) {
	stats.push({sd: d3.deviation(data, function(d) { return d.x;}),
		    mean: d3.mean(data, function(d) { return d.x;}),
		    col: "#fe5276",
		    type: "sd",
		    lab: ":sd:".toLocaleString(),
		    key: "sd_x"});
	stats.push({sd: d3.deviation(data, function(d) { return d.y;}),
		    mean: d3.mean(data, function(d) { return d.y;}),
		    col: "#fe5276",
		    type: "sd",
		    lab: ":sd:".toLocaleString(),
		    key: "sd_y"});
    };
    if (settings.stats_mean) {
	stats.push({mean: d3.mean(data, function(d) { return d.x;}),
		    col: "#bb1236",
		    type: "mean",
		    lab: ":mean:".toLocaleString(),
		    key: "mean_x"});
	stats.push({mean: d3.mean(data, function(d) { return d.y;}),
		    col: "#bb1236",
		    type: "mean",
		    lab: ":mean:".toLocaleString(),
		    key: "mean_y"});
	stats.push({mean_x: d3.mean(data, function(d) { return d.x;}),
		    mean_y: d3.mean(data, function(d) { return d.y;}),
		    col: "#bb1236",
		    key: "mean_point"});
    };
    if (settings.stats_cov) {
	var x = data.map(function(d) {return(d.x);});
	var y = data.map(function(d) {return(d.y);});
	stats.push({
	    cov: ss.sampleCovariance(x, y),
	    type: "covcor",
	    lab: ":covariance:".toLocaleString(),
	    col: "#F28A30",
	    key: "cov"
	});
	stats.push({
	    cor: ss.sampleCorrelation(x, y),
	    type: "covcor",
	    lab: ":correlation:".toLocaleString(),
	    col: "#F05837",
	    key: "cor"
	});
    }
    return stats;
}

function stats_symbol_formatting(selection, scales, settings) {
    selection = selection
    	.attr("class", "stats_symbol");
    selection
	.filter(function(d) {return d.key == "mean_x";})
    	.attr("d", function(d) {
	    return draw_line([{x:scales.x(d.mean), y: scales.y(scales.y.domain()[0])},
			      {x:scales.x(d.mean), y: scales.y(scales.y.domain()[0]) - 15}]);
	})
	.style("stroke", function(d) {return d.col;})
    	.style("stroke-width", 2);
    selection
	.filter(function(d) {return d.key == "mean_y";})
    	.attr("d", function(d) {
	    return draw_line([{x:scales.x(scales.x.domain()[0]), y: scales.y(d.mean)},
			      {x:scales.x(scales.x.domain()[0]) + 15, y: scales.y(d.mean)}]);
	})
	.style("stroke", function(d) {return d.col;})
    	.style("stroke-width", 2);
    selection
    	.filter(function(d) {return d.key == "sd_x";})
	.attr("d", function(d) {
	    return draw_line([{x:scales.x(d.mean - d.sd/2), y: scales.y(scales.y.domain()[0])-32},
			      {x:scales.x(d.mean + d.sd/2), y: scales.y(scales.y.domain()[0])-32}]);
	})
	.style("stroke-width", 1)
	.style("stroke", function(d) {return d.col;});
    selection
    	.filter(function(d) {return d.key == "sd_y";})
	.attr("d", function(d) {
	    return draw_line([{x: scales.x(scales.x.domain()[0])+32, y:scales.y(d.mean - d.sd/2)},
			      {x: scales.x(scales.x.domain()[0])+32, y:scales.y(d.mean + d.sd/2)}]);
	})
	.style("stroke-width", 1)
	.style("stroke", function(d) {return d.col;});
    selection
    	.filter(function(d) {return d.key == "mean_point";})
	.attr("d", d3.symbol()
	      .type(d3.symbolCircle)
	      .size(48))
	.attr("transform", function(d) {
	    return("translate(" + scales.x(d.mean_x) + "," + scales.y(d.mean_y) + ")");
	})
	.style("stroke", function(d) {return d.col;})
    	.style("fill", "none");
    return selection;
}

function stats_label_formatting(selection, scales) {
    selection
    	.filter(function(d) {return d.key != "mean_point";})
	.attr("class", "stats_label")
	.style("font-size", "12px")
	.style("fill", function(d) {return d.col;});
    selection
	.filter(function(d) {return d.key == "mean_x";})
    	.attr("text-anchor", "middle")
	.text(function(d) { return d.lab + ": " + d.mean.toFixed(1);})
	.attr("transform", function(d) {
	    return( "translate(" + scales.x(d.mean) + "," + scales.y(scales.y.domain()[0]) + ")");
	})
	.attr("dy", -18);
    selection
	.filter(function(d) {return d.key == "sd_x";})
    	.attr("text-anchor", "middle")
    	.text(function(d) { return d.lab + ": " + d.sd.toFixed(1);})
	.attr("transform", function(d) {
	    return( "translate(" + scales.x(d.mean) + "," + scales.y(scales.y.domain()[0]) + ")");
	})
	.attr("dy", -35);
    selection
	.filter(function(d) {return d.key == "mean_y";})
    	.attr("text-anchor", "middle")
    	.text(function(d) { return d.lab + ": " + d.mean.toFixed(1);})
	.attr("transform", function(d) {
	    return( "translate(" + scales.x(scales.x.domain()[0]) + "," + scales.y(d.mean) + ") rotate(-90)");
	})
	.attr("dy", 26);
    selection
	.filter(function(d) {return d.key == "sd_y";})
    	.attr("text-anchor", "middle")
    	.text(function(d) { return d.lab + ": " + d.sd.toFixed(1);})
	.attr("transform", function(d) {
	    return( "translate(" + scales.x(scales.x.domain()[0]) + "," + scales.y(d.mean) + ") rotate(-90)");
	})
	.attr("dy", 45);
    selection
	.filter(function(d) {return d.key == "cov";})
    	.attr("text-anchor", "middle")
        .text(function(d) { return d.lab + ": " + d.cov.toFixed(1);})
	.attr("transform", function(d) {
	    var x_pos = (scales.x(scales.x.domain()[1]) - scales.x(scales.x.domain()[0]))/2;
	    return( "translate(" + x_pos + ",0)");
	})
	.attr("dy", 15);
    selection
	.filter(function(d) {return d.key == "cor";})
    	.attr("text-anchor", "middle")
        .text(function(d) { return d.lab + ": " + d.cor.toFixed(3);})
	.attr("transform", function(d) {
	    var x_pos = (scales.x(scales.x.domain()[1]) - scales.x(scales.x.domain()[0]))/2;
	    return( "translate(" + x_pos + ",0)");
	})
	.attr("dy", 30);

    return selection;
}

