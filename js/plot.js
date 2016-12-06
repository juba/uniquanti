
function plot() {

    var width = 600, // default width
	height = 600, // default height
	dims = {},
	settings = {},
	scales = {},
	data = [],
	svg,
	zoom, drag;
    
    // Zoom behavior
    zoom = d3.zoom()
        .scaleExtent([0, 32])
        .on("zoom", zoomed);
    
    // Zoom function
    function zoomed(reset) {
	var root = svg.select(".root");
        scales.x = d3.event.transform.rescaleX(scales.x_orig);
        scales.xAxis = scales.xAxis.scale(scales.x);
        root.select(".x.axis").call(scales.xAxis);
	var chart_body = svg.select(".chart-body");
        chart_body.selectAll(".dot")
            .attr("transform", function(d) { return translation(d, scales); });
	chart_body.selectAll(".line").call(function(sel) {
	    line_formatting(sel, dims, scales);
	});
	chart_body.selectAll(".stats_symbol").call(function(sel) {
	    stats_symbol_formatting(sel, scales);
	});
	chart_body.selectAll(".stats_label").call(function(sel) {
	    stats_label_formatting(sel, scales);
	});
    }

    // Reset zoom function
    function reset_zoom() {
	var root = svg.select(".root");
        root.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
    }


    // Dots dragging function
    var dragging = false;
    drag = d3.drag()
	.subject(function(d, i) {
            return {x:scales.x(d.x)};
	})
	.on('start', function(d, i) {
	    dragging = true;
	})
	.on('drag', function(d) {
	    if (dragging) {
		var cx = d3.event.x - scales.x(d.x);
		d.x = scales.x.invert(d3.event.x);
		d3.select(this).attr("transform", function(d) { return translation(d, scales); });
		d3.select(".tooltip").style("left",(d3.mouse(d3.select("body").node())[0]) + 15 + "px")
		    .html(tooltip_content(d));
		var stats_data = stats_compute(data);
		d3.selectAll(".stats_symbol")
		    .data(stats_data, key)
		    .call(function(sel) {
			stats_symbol_formatting(sel, scales);
		    });
		d3.selectAll(".stats_label")
		    .data(stats_data, key)
		    .call(function(sel) {
			stats_label_formatting(sel, scales);
		    });
	    }
	})
	.on('end', function(d) {
	    if (dragging){
		dragging = false;
	    }
	});


    // Key function to identify rows when interactively filtering
    function key(d) {
        return d.key;
    }

    function chart(selection) {
        selection.each(function() {

            dims = setup_sizes(width, height);
            scales = setup_scales(dims, data);

            // Root chart element and axes
            var root = svg.append("g")
		.attr("class", "root")
		.attr("transform", "translate(" + dims.margins.left + "," + dims.margins.top + ")")
		.call(zoom);

            root.append("rect")
		.style("fill", "#FFF")
		.attr("width", dims.width)
		.attr("height", dims.height);

            root.call(function(sel) { add_axes(sel, dims, scales); });

            // chart body
            var chart_body = root.append("svg")
		.attr("class", "chart-body")
		.attr("width", dims.width)
		.attr("height", dims.height);

	    // Horizontal line
	    var lines = chart_body
		.selectAll(".lines")
		.data(data_lines);
	    lines.enter()
		.append("path")
		.call(line_init)
		.call(function(sel) {
		    line_formatting(sel, dims, scales);
		});
	    
            // Add points
            var dot = chart_body
		.selectAll(".dot")
		.data(data, key);
            dot.enter()
		.append("path")
		.call(function(sel) { dot_init(sel, scales); })
		.call(function(sel) { dot_formatting(sel, scales); })
		.call(drag);

	    // Add stats
	    var stats_data = stats_compute(data);
	    var stats_symbol = chart_body
		.selectAll("stats_symbol")
		.data(stats_data, key);
	    stats_symbol.enter()
		.append("path")
		.call(function(sel) { stats_symbol_formatting(sel, scales); });
	    var stats_label = chart_body
		.selectAll("stats_label")
		.data(stats_data, key);
	    stats_label.enter()
		.append("text")
		.call(function(sel) { stats_label_formatting(sel, scales); });
	    
            // Tools menu

	    // Gear icon
	    var gear = svg.append("g")
		.attr("class", "gear-menu")
		.attr("transform", "translate(" + (width - 40) + "," + 10 + ")");
	    gear.append("rect")
		.attr("class", "gear-toggle")
		.attr("width", "25")
		.attr("height", "25")
		.style("fill", "#FFFFFF");
	    gear.append("path")
		.attr("d", gear_path())
		.attr("transform", "translate(-3,3)")
		.style("fill", "#666666");

	    var menu_parent = d3.select("#plot");
	    menu_parent.style("position", "relative");
	    var menu = menu_parent.append("div")
		.attr("class", "plot-menu");

	    menu.attr("id", "plot-menu");
	    
	    menu.append("li")
		.append("a")
		.on("click", reset_zoom)
		.html("Reset zoom");
	    
	    menu.append("li")
		.append("a")
		.on("click", function() { export_svg(this, svg, settings); })
		.html("Export to SVG");
	    
	    if (settings.lasso) {
                menu.append("li")
		    .append("a")
		    .attr("class", "lasso-entry")
		    .on("click", function () {lasso_toggle(svg, settings, scales, zoom);})
		    .html("Toggle lasso on");
	    }
	    
                var label_export = menu.append("li")
		    .attr("class", "label-export");
	    label_export.append("a")
		.on("click", function() { export_labels_position(this, data, settings, scales); })
		    .html("Export labels positions");
	    if (!settings.has_labels) {
		label_export.style("display", "none");
	    }
	    
	    gear.on("click", function(d, i){
                var menu = d3.select("#plot-menu");
                var gear = svg.select(".gear-menu");
                if (!menu.classed("open")) {
		    menu.transition().duration(300)
			.style("opacity", "0.95")
			.style("width", "165px");
		    gear.classed("selected", true);
		    menu.classed("open", true);
                } else {
		    menu.transition().duration(300)
			.style("opacity", "0")
			.style("width", "0px");
		    gear.classed("selected", false);
		    menu.classed("open", false);
                }
	    });

        });
    }


    // Update chart with transitions
    function update_settings(old_settings) {
	var chart_body = svg.select(".chart-body");
        if (old_settings.labels_size != settings.labels_size)
            svg.selectAll(".point-label").transition().style("font-size", settings.labels_size + "px");
        if (old_settings.point_size != settings.point_size ||
	    old_settings.point_opacity != settings.point_opacity) {
            svg.selectAll(".dot").transition()
		.call(function(sel) { dot_formatting(sel, scales); });
	}
	var menu_parent = d3.select(svg.node().parentNode);
	menu_parent.style("position", "relative");
	var menu = menu_parent.select(".plot-menu");
	menu.attr("id", "plot-menu");
    };

    // Update data with transitions
    function update_data() {
	
	dims = setup_sizes(width, height);
	scales = setup_scales(dims, data);

	var t0 = svg.transition().duration(1000);
	t0.call(resize_plot);

	var chart_body = svg.select(".chart-body");

	// Add lines
	var line = chart_body.selectAll(".line")
	    .data(data_lines);
	line.enter().append("path").call(line_init)
	    .style("opacity", "0")
	    .merge(line)
	    .transition().duration(1000)
	    .call(function(sel) {
		line_formatting(sel, dims, scales);
	    })
	    .style("opacity", "1");
	line.exit().transition().duration(1000).style("opacity", "0").remove();
	

	// Add points
	var dot = chart_body.selectAll(".dot")
	    .data(data, key);
	dot.enter().append("path").attr("class", "dot").call(function(sel) {dot_init(sel, scales);}).call(drag)
	    .merge(dot).call(function(sel) {dot_init(sel, scales);}).transition().duration(1000).call(function(sel) {dot_formatting(sel, scales);});
	dot.exit().transition().duration(1000).attr("transform", "translate(0,0)").remove();

	// Add stats
	var stats_data = stats_compute(data);
	var stats_symbol = chart_body
	    .selectAll(".stats_symbol")
	    .data(stats_data, key);
	stats_symbol.enter()
	    .append("path")
	    .style("opacity", 0)
	    .merge(stats_symbol)
	    .transition().duration(1000)
	    .call(function(sel) { stats_symbol_formatting(sel, scales); })
	    .style("opacity", 1);
	stats_symbol.exit().transition().duration(1000).style("opacity", "0").remove();
	var stats_label = chart_body
	    .selectAll(".stats_label")
	    .data(stats_data, key);
	stats_label.enter()
	    .append("text")
	    .style("opacity", 0)
	    .merge(stats_label)
	    .transition().duration(1000)
	    .call(function(sel) { stats_label_formatting(sel, scales); })
	    .style("opacity", 1);
	stats_label.exit().transition().duration(1000).style("opacity", "0").remove();
	
	// Reset zoom
	svg.select(".root")
	    .transition().delay(1000).duration(0)
	    .call(zoom.transform, d3.zoomIdentity);
	    
    };

    // Dynamically resize plot area
    function resize_plot(selection) {
	// Change svg attributes
        selection.selectAll(".root")
            .attr("width", dims.width)
            .attr("height", dims.height);
	selection.selectAll(".root")
	    .select("rect")
            .attr("width", dims.width)
            .attr("height", dims.height);
        selection.selectAll(".chart-body")
            .attr("width", dims.width)
            .attr("height", dims.height);
	selection.select(".x.axis")
	    .attr("transform", "translate(0," + dims.height + ")");
        selection.select(".x-axis-label")
	    .attr("transform", "translate(" + (dims.width - 5) + "," + (dims.height - 6) + ")");
	selection.select(".x.axis").call(scales.xAxis);
	selection.select(".y.axis").call(scales.yAxis);
    }
    
    // Dynamically resize chart elements
    function resize_chart () {
        // recompute sizes
        dims = setup_sizes(width, height);
        // recompute x and y scales
        scales.x.range([0, dims.width]);
        scales.x_orig.range([0, dims.width]);
        scales.y.range([dims.height / 2 + dims.height / 4, dims.height / 2 - dims.height / 4]);
        scales.y_orig.range([dims.height / 2 + dims.height / 4, dims.height / 2 - dims.height / 4]);
	scales.xAxis = d3.axisBottom(scales.x).tickSize(5);
	scales.yAxis = d3.axisLeft(scales.y).tickSize(-dims.width);

	svg.call(resize_plot);

	svg.select(".root")
	    .call(zoom.transform,
		  d3.zoomTransform(svg.select(".root").node()));

        // Move menu
        svg.select(".gear-menu")
	    .attr("transform", "translate(" + (width - 40) + "," + 10 + ")");
	
    };


    chart.update_data_manual = function() {
	var manual_data = d3.select("#data_manual").node().value;
	var jitter = d3.select("#points_jitter").node().checked;
	if (!manual_data.match(/^(\d+ *, *)*\d+ *$/)) {
	    alert("Les données saisies sont invalides");
	    return;
	}
	new_data = manual_data.split(/ *, */);
	new_data = new_data.map(function(val, i) {
	    var d = {}; 
	    d.key = i;
	    d.x = parseFloat(val);
	    d.y = jitter ? d3.randomUniform(-1, 1)() : 0;
	    return d;
	});
	data = new_data;
	update_data();
    };

    chart.update_data_random = function() {
	var law = d3.select("#data_law").node();
	law = law.options[law.selectedIndex].value;
	var nbvals = d3.select("#nb_values").node().value;
	var jitter = d3.select("#points_jitter").node().checked;
	var new_data = [];
	switch (law) {
	case "uniforme":
	    var min = d3.select("#data_uniform_min").node().value;
	    var max = d3.select("#data_uniform_max").node().value;
	    new_data = d3.range(nbvals).map(d3.randomUniform(min,max));
	    new_data = new_data.map(function(val, i) {
		var d = {}; 
		d.key = i;
		d.x = val;
		d.y = jitter ? d3.randomUniform(-1, 1)() : 0;
		return d;
	    });
	    break;
	case "normale":
	    var mean = d3.select("#data_normal_mean").node().value;
	    var sd = d3.select("#data_normal_sd").node().value;
	    new_data = d3.range(nbvals).map(d3.randomNormal(mean,sd));
	    new_data = new_data.map(function(val, i) {
		var d = {}; 
		d.key = i;
		d.x = val;
		d.y = jitter ? d3.randomUniform(-1, 1)() : 0;
		return d;
	    });
	    break;
	}
	data = new_data;
	update_data();
    };

    chart.update_dots = function() {
	d3.selectAll(".dot").call(function(sel) {dot_formatting(sel, scales);});
    };

    chart.update_points_jitter = function() {
	var jitter = d3.select("#points_jitter").node().checked;
	var new_data = [];
	if (jitter) {
	    new_data = data.map(function(d) {
		d.y = d3.randomUniform(-1, 1)();
		return d;
	    });
	} else {
	    new_data = data.map(function(d) {
		d.y = 0;
		return d;
	    });
	}
	data = new_data;
	update_data();
    };

    chart.update_data = function() {
	update_data();
    };
    
    // resize
    chart.resize = function() {
        resize_chart();
    };

    // data getter/setter
    chart.data = function(value, redraw) {
        if (!arguments.length) return data;
        data = value;
        if (!redraw) update_data();
        return chart;
    };

    // settings getter/setter
    chart.settings = function(value) {
        if (!arguments.length) return settings;
        if (Object.keys(settings).length === 0) {
            settings = value;
        } else {
            var old_settings = settings;
            settings = value;
            update_settings(old_settings);
        }
        return chart;
    };

    chart.svg = function(value) {
        if (!arguments.length) return svg;
        svg = value;
        return chart;
    };

    // width getter/setter
    chart.width = function(value) {
        if (!arguments.length) return width;
        width = value;
        return chart;
    };

    // height getter/setter
    chart.height = function(value) {
        if (!arguments.length) return height;
        height = value;
        return chart;
    };

    return chart;
    
}



// PLOT INIT

var width = d3.select("#plot").node().getBoundingClientRect().width;
var height = 600;

var svg = d3.select("#plot").append("svg");
svg.attr("width", width)
    .attr("height", height)
    .append("style")
    .text("#plot {font: 11px Open Sans, Droid Sans, Helvetica, Verdana, sans-serif;}" +
	  "#plot .axis line, .axis path { stroke: #000; fill: none; shape-rendering: CrispEdges;} " +
	  "#plot .axis text { fill: #000; }");

// Create tooltip content div
var tooltip = d3.select(".tooltip");
if (tooltip.empty()) {
    tooltip = d3.select("body")
	.append("div")
	.style("visibility", "hidden")
	.attr("class", "tooltip");
}

// Create plot instance
var plot = plot().width(width).height(height).svg(svg);

// Default data
var data = [{key: 1, x: 50, y: 0}];
var data_lines = [{slope: 0,
		   intercept: 0,
		   stroke: "#CCC",
		   stroke_dasharray: [3,3]}];

plot = plot.data(data, true);
d3.select("#plot").call(plot);

// Add controls handlers
d3.select("#data_manual_submit").on("click", plot.update_data_manual);
d3.select("#data_random_submit").on("click", plot.update_data_random);

window.onresize = function() {
    var width = d3.select("#plot").node().getBoundingClientRect().width;
    var height = 600;
    svg
	.attr("width", width)
	.attr("height", height);
    // resize chart
    plot.width(width).height(height).svg(svg).resize();
};

d3.select("#points_size").on("input change", plot.update_dots);
d3.select("#points_opacity").on("input change", plot.update_dots);
d3.select("#points_jitter").on("input change", plot.update_points_jitter);

d3.select("#stats_mean").on("input change", plot.update_data);
d3.select("#stats_median").on("input change", plot.update_data);
d3.select("#stats_quartiles").on("input change", plot.update_data);
d3.select("#stats_sd").on("input change", plot.update_data);
