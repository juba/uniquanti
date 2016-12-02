(function($){
    $(function(){

	$('.button-collapse').sideNav();
	
	$(document).ready(function() {
	    $('select').material_select();
	});

      
    }); // end of document ready
})(jQuery); // end of jQuery name space





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


    // Text labels dragging function
    var dragging = false;
    drag = d3.drag()
	.subject(function(d, i) {
            var size = (d.size_var === undefined) ? settings.point_size : scales.size(d.size_var);
            var dx = get_label_dx(d, i, settings, scales);
            var dy = get_label_dy(d, i, settings, scales);
            return {x:scales.x(d.x)+dx, y:scales.y(d.y)+dy};
	})
	.on('start', function(d, i) {
	    if (!d3.event.sourceEvent.shiftKey) {
		dragging = true;
		d3.select(this).style('fill', '#000');
		var chart = d3.select(this).node().parentNode;
		var size = (d.size_var === undefined) ? settings.point_size : scales.size(d.size_var);
		var dx = get_label_dx(d, i, settings, scales);
		var dy = get_label_dy(d, i, settings, scales);
		d3.select(chart).append("svg:line")
		    .attr("id", "scatterD3-drag-line")
		    .attr("x1", scales.x(d.x)).attr("x2", scales.x(d.x) + dx)
		    .attr("y1", scales.y(d.y)).attr("y2", scales.y(d.y) + dy)
		    .style("stroke", "#000")
		    .style("opacity", 0.3);
	    }
	})
	.on('drag', function(d) {
	    if (dragging) {
		var cx = d3.event.x - scales.x(d.x);
		var cy = d3.event.y - scales.y(d.y);
		d3.select(this)
		    .attr('dx', cx + "px")
		    .attr('dy', cy + "px");
		d3.select("#scatterD3-drag-line")
		    .attr('x2', scales.x(d.x) + cx)
		    .attr("y2", scales.y(d.y) + cy);
		d.lab_dx = cx;
		d.lab_dy = cy;
	    }
	})
	.on('end', function(d) {
	    if (dragging){
		d3.select(this).style('fill', scales.color(d.col_var));
		d3.select("#scatterD3-drag-line").remove();
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

            // Add points
            var dot = chart_body
		.selectAll(".dot")
		.data(data, key);
            dot.enter()
		.append("path")
		.call(function(sel) { dot_init(sel, scales); })
		.call(function(sel) { dot_formatting(sel, scales); });

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

	dims = setup_sizes(width, height, settings);
	scales = setup_scales(dims, settings, data);

	// Change axes labels
	svg.select(".x-axis-label").text(settings.xlab);
	svg.select(".y-axis-label").text(settings.ylab);

	var t0 = svg.transition().duration(1000);
	t0.call(resize_plot);

	var chart_body = svg.select(".chart-body");

	// Add points
	var dot = chart_body.selectAll(".dot")
	    .data(data, key);
	dot.enter().append("path").call(function(sel) {dot_init(sel, scales);})
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


    // Add controls handlers for shiny
    chart.add_controls_handlers = function() {
        // Zoom reset
        d3.select("#" + settings.dom_id_reset_zoom)
            .on("click", reset_zoom);

        // SVG export
        d3.select("#" + settings.dom_id_svg_export)
            .on("click", function() { export_svg(this, svg, settings); });

        // Lasso toggle
        d3.select("#" + settings.dom_id_lasso_toggle)
            .on("click", function () {lasso_toggle(svg, settings, scales, zoom);});
    };

    // resize
    chart.resize = function() {
        resize_chart();
    };

    // settings getter/setter
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

var data = [{key: 1, x: 10, y: 0},
	    {key: 2, x: 25, y: 0},
	    {key: 3, x: 57, y: 0},
	    {key: 4, x: 65, y: 0},
	    {key: 5, x: 44, y: 0},
	    {key: 6, x: 87, y: 0},
	    {key: 7, x: 8, y: 0}];

plot = plot.data(data, true);
d3.select("#plot").call(plot);
