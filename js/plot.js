
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
	    //d3.select(".tooltip").style("visibility", "hidden");
	})
	.on('drag', function(d) {
	    if (dragging) {
		var cx = d3.event.x - scales.x(d.x);
		d.x = scales.x.invert(d3.event.x);
		d3.select(this).attr("transform", function(d) { return translation(d, scales); });
		d3.select(".tooltip").style("top", (d3.event.pageY+15)+"px").style("left",(d3.event.pageX+15)+"px");
	    }
	})
	.on('end', function(d) {
	    if (dragging){
		dragging = false;
		d3.select(".tooltip").style("visibility", "visible");
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

            // Add points
            var dot = chart_body
		.selectAll(".dot")
		.data(data, key);
            dot.enter()
		.append("path")
		.call(function(sel) { dot_init(sel, scales); })
		.call(function(sel) { dot_formatting(sel, scales); })
		.call(drag);

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

	// Add points
	var dot = chart_body.selectAll(".dot")
	    .data(data, key);
	dot.enter().append("path").call(function(sel) {dot_init(sel, scales);}).call(drag)
	    .merge(dot).call(function(sel) {dot_init(sel, scales);}).transition().duration(1000).call(function(sel) {dot_formatting(sel, scales);});
	dot.exit().transition().duration(1000).attr("transform", "translate(0,0)").remove();

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
        dims = setup_sizes(width, height, settings);
	dims = setup_legend_sizes(dims, scales, settings);
        // recompute x and y scales
        scales.x.range([0, dims.width]);
        scales.x_orig.range([0, dims.width]);
        scales.y.range([dims.height, 0]);
        scales.y_orig.range([dims.height, 0]);
	scales.xAxis = d3.axisBottom(scales.x).tickSize(-dims.height);
	scales.yAxis = d3.axisLeft(scales.y).tickSize(-dims.width);

	svg.call(resize_plot);

	svg.select(".root")
	    .call(zoom.transform,
		  d3.zoomTransform(svg.select(".root").node()));

        // Move menu
        if (settings.menu) {
            svg.select(".gear-menu")
		.attr("transform", "translate(" + (width - 40) + "," + 10 + ")");
        }
	
    };


    chart.update_data_manual = function() {
	var manual_data = d3.select("#data_manual").node().value;
	if (!manual_data.match(/^(\d+ *, *)*\d+ *$/)) {
	    alert("Les données saisies sont invalides");
	}
	new_data = manual_data.split(/ *, */);
	console.log(new_data);
	new_data = new_data.map(function(val, i) {
	    var d = {}; 
	    d.key = i;
	    d.x = parseFloat(val);
	    d.y = 0;
	    return d;
	});
	data = new_data;
	console.log(new_data);
	update_data();
    };

    chart.update_data_random = function() {
	var law = d3.select("#data_law").node();
	law = law.options[law.selectedIndex].value;
	var nbvals = d3.select("#nb_values").node().value;
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
		d.y = 0;
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
		d.y = 0;
		return d;
	    });
	    break;
	}
	data = new_data;
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


var data = [{key: 1, x: 100, y: 0}];


plot = plot.data(data, true);
d3.select("#plot").call(plot);


// Add controls handlers
d3.select("#data_manual_submit").on("click", plot.update_data_manual);
d3.select("#data_random_submit").on("click", plot.update_data_random);
