
function plot() {

    var width, // default width
	height, // default height
	dims = {},
	settings = {},
	scales = {},
	data = [],
	xlab = "x", ylab = "y",
	bins,
	svg,
	zoom, points_drag;
    
    // Zoom behavior
    zoom = d3.zoom()
        .scaleExtent([0, 256])
        .on("zoom", zoomed);
    
    // Zoom function
    function zoomed(reset) {
	var root = svg.select(".root");
        scales.x = d3.event.transform.rescaleX(scales.x_orig);
	scales.y = d3.event.transform.rescaleY(scales.y_orig);
        scales.xAxis = scales.xAxis.scale(scales.x);
	scales.yAxis = scales.yAxis.scale(scales.y);
        root.select(".x.axis").call(scales.xAxis);
	root.select(".y.axis").call(scales.yAxis);
	
	var chart_body = svg.select(".chart-body");
        chart_body.selectAll(".dot")
            .attr("transform", function(d) { return translation(d, scales); });
	chart_body.selectAll(".xrug").call(function(sel) {
	    x_rug_formatting(sel, scales, settings);
	});
	chart_body.selectAll(".yrug").call(function(sel) {
	    y_rug_formatting(sel, scales, settings);
	});
	chart_body.selectAll(".label").call(function(sel) {
	    label_formatting(sel, scales, settings);
	});
	chart_body.selectAll(".line").call(function(sel) {
	    line_formatting(sel, dims, scales);
	});
	chart_body.selectAll(".stats_symbol").call(function(sel) {
	    stats_symbol_formatting(sel, scales, settings);
	});
	chart_body.selectAll(".stats_label").call(function(sel) {
	    stats_label_formatting(sel, scales);
	});
	chart_body.selectAll(".manualerror, .regerror").call(function(sel) {
	    error_formatting(sel, dims, scales);
	});
	chart_body.selectAll(".manualerrorpoint, .regerrorpoint").call(function(sel) {
	    error_dot_formatting(sel, scales, settings);
	});
	chart_body.selectAll(".predict-line").call(function(sel) {
	    predict_line_formatting(sel, scales);
	});
	chart_body.selectAll(".predict-dot").call(function(sel) {
	    predict_dot_formatting(sel, scales);
	});
	chart_body.selectAll(".predict-label").call(function(sel) {
	    predict_label_formatting(sel, scales);
	});
    }

    // Reset zoom function
    function reset_zoom() {
	var root = svg.select(".root");
        root.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
    }


    // Dots dragging function
    var points_dragging = false;
    points_drag = function() {
	if(!settings.allow_dragging) return function() {};
	return d3.drag()
	.subject(function(d, i) {
            return {x:scales.x(d.x)};
	})
	.on('start', function(d, i) {
	    points_dragging = true;
	})
	.on('drag', function(d) {
	    if (points_dragging) {
		var cx = d3.event.x - scales.x(d.x);
		var cy = d3.event.y - scales.y(d.y);
		d.x = scales.x.invert(d3.event.x);
		d.y = scales.y.invert(d3.event.y);
		d3.select(this).attr("transform", function(d) { return translation(d, scales); });
		d3.select(".tooltip").style("left",(d3.mouse(d3.select("body").node())[0]) + 15 + "px")
		    .html(tooltip_content(d, xlab, ylab));
		d3.selectAll(".label").call(function(sel) {
		    label_formatting(sel, scales, settings);
		});
		// Rugs 
		d3.selectAll(".xrug").call(function(sel) {
		    x_rug_formatting(sel, scales, settings);
		});
		d3.selectAll(".yrug").call(function(sel) {
		    y_rug_formatting(sel, scales, settings);
		});
		// Stats symbols and labels
		var stats_data = stats_compute(data, settings);
		d3.selectAll(".stats_symbol")
		    .data(stats_data, key)
		    .call(function(sel) {
			stats_symbol_formatting(sel, scales, settings);
		    });
		d3.selectAll(".stats_label")
		    .data(stats_data, key)
		    .call(function(sel) {
			stats_label_formatting(sel, scales);
		    });
		// Manual line table
		var slope, intercept, error, r2;
		if (settings.manual_line) {
		    slope = parseFloat(settings.manual_slope);
		    intercept = parseFloat(settings.manual_intercept);
		    error = compute_error(data, slope, intercept);
		    d3.select("#man-slope").text(parseFloat(settings.manual_slope).toPrecision(3));
		    d3.select("#man-intercept").text(parseFloat(settings.manual_intercept).toPrecision(3));
		    d3.select("#man-error").text(error.toFixed(1));
		}
		// Regression line
		if (settings.reg_line) {
		    var regression = ss.linearRegression(data.map(function(d) {
			return [d.x, d.y];
		    }));
		    var reg_line_data = [{slope: regression.m,
				      intercept: regression.b,
				      stroke: "#E00"
				     }];
		    var reg_line = d3.selectAll(".regline")
			.data(reg_line_data)
			.call(function(sel) {
			    line_formatting(sel, dims, scales);
			});
		    error = compute_error(data, regression.m, regression.b);
		    r2 = compute_r2(data, error);
		    d3.select("#reg-slope").text(regression.m.toPrecision(3));
		    d3.select("#reg-intercept").text(regression.b.toPrecision(3));
		    d3.select("#reg-error").text(error.toFixed(1));
		    d3.select("#reg-r2").text(r2.toPrecision(3));
		}
		// Manual line errors
		if (settings.manual_errors) {
		    // Update error lines
		    slope = parseFloat(settings.manual_slope);
		    intercept = parseFloat(settings.manual_intercept);
		    var manual_errors_data = data.map(function(d) {
			return {x: d.x,
				ystart: d.y,
				yend: slope * d.x + intercept,
				stroke: "#0B0" 
			       };
		    });
		    var manual_error = d3.selectAll(".manualerror")
			.data(manual_errors_data)
			.call(function(sel) {
			    error_formatting(sel, dims, scales);
			});
		    // Update error points
		    var manual_errors_points_data = data.map(function(d) {
			return {x: d.x,
				y: slope * d.x + intercept,
				col: "#0B0" 
			       };
		    });
		    var manual_error_points = d3.selectAll(".manualerrorpoint")
			.data(manual_errors_points_data)
			.call(function(sel) {
			    error_dot_formatting(sel, scales, settings);
			});
		}
		// Regression line errors
		if (settings.reg_errors) {
		    // Update error lines
		    var reg_errors_data = data.map(function(d) {
			return {x: d.x,
				ystart: d.y,
				yend: regression.m * d.x + regression.b,
				stroke: "#F05837" 
			       };
		    });
		    var reg_error = d3.selectAll(".regerror")
			.data(reg_errors_data)
			.call(function(sel) {
			    error_formatting(sel, dims, scales);
			});
		    // Update error points
		    var reg_errors_points_data = data.map(function(d) {
			return {x: d.x,
				y: regression.m * d.x + regression.b,
				col: "#F05837" 
			       };
		    });
		    var reg_error_points = d3.selectAll(".regerrorpoint")
			.data(reg_errors_points_data)
			.call(function(sel) {
			    error_dot_formatting(sel, scales, settings);
			});
		}
		// Predicted value
		if (settings.reg_predict) {
		    var reg_predict_data = [{x: parseFloat(settings.reg_predict),
					     y: parseFloat(settings.reg_predict) * regression.m + regression.b,
					     type: "base"},
					    {x: parseFloat(settings.reg_predict),
					     y: parseFloat(settings.reg_predict) * regression.m + regression.b,
					     type: "h_line"}];
		}
		var predict_line = d3.selectAll(".predict-line")
		    .data(reg_predict_data)
		    .call(function(sel) {
			predict_line_formatting(sel, scales);
		    });
		var predict_dot = d3.selectAll(".predict-dot")
		    .data(reg_predict_data)
		    .call(function(sel) {
			predict_dot_formatting(sel, scales);
		    });
		var predict_label = d3.selectAll(".predict-label")
		    .data(reg_predict_data)
		    .call(function(sel) {
			predict_label_formatting(sel, scales);
		    });
	    }
	})
	.on('end', function(d) {
	    if (points_dragging){
		points_dragging = false;
	    }
	});
    };


    // Key function to identify rows when interactively filtering
    function key(d) {
        return d.key;
    }

    function chart(selection) {
        selection.each(function() {

            dims = setup_sizes(width, height, settings);
            scales = setup_scales(dims, data, settings);

            // Root chart element and axes
            var root = svg.append("g")
		.attr("class", "root")
		.attr("transform", "translate(" + dims.margins.left + "," + dims.margins.top + ")")
		.call(zoom);

            root.append("rect")
		.style("fill", "#FFF")
		.attr("width", dims.width)
		.attr("height", dims.height);

            root.call(function(sel) { add_axes(sel, dims, settings, scales, xlab, ylab); });

            // chart body
            var chart_body = root.append("svg")
		.attr("class", "chart-body")
		.attr("width", dims.width)
		.attr("height", dims.height);

	    // Axes lines
	    var lines = chart_body
		.selectAll(".lines")
		.data(data_lines);
	    lines.enter()
		.append("path")
		.call(line_init)
		.call(function(sel) {
		    line_formatting(sel, dims, scales);
		});
	    
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

    // Update plot dims and scales
    function update_scales() {
	dims = setup_sizes(width, height, settings);
	scales = setup_scales(dims, data, settings);

	svg.transition().duration(1000).call(resize_plot);

	// Reset zoom
	svg.select(".root")
	    .transition().delay(1000).duration(0)
	    .call(zoom.transform, d3.zoomIdentity);
    }

    

    // Update data with transitions
    function update_plot() {
	
	
	var root = svg.select(".root");


	var chart_body = svg.select(".chart-body");

	// Add 0 lines
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

	// Update axes labels
	d3.select(".x-axis-label").text(xlab);
	d3.select(".y-axis-label").text(ylab);
	
	// Add points
	var dot = chart_body.selectAll(".dot")
	    .data(data, key);
	dot.enter().append("path").attr("class", "dot").call(function(sel) {dot_init(sel, scales, settings, xlab, ylab);}).call(points_drag())
	    .merge(dot).transition().duration(1000).call(function(sel) {dot_formatting(sel, scales, settings);});
	dot.exit().transition().duration(1000).attr("transform", "translate(0,0)").remove();

	// Add rugs
	var data_rugs = settings.rugs ? data : [];
	var xrug = chart_body.selectAll(".xrug")
	    .data(data_rugs, key);
	if (settings.rugs) {
	    xrug.enter().append("path").attr("class", "xrug").call(function(sel) {x_rug_init(sel, scales, settings);})
		.merge(xrug).transition().duration(1000).call(function(sel) {x_rug_formatting(sel, scales, settings);});
	}
	xrug.exit().transition().duration(1000).style("opacity", 0).remove();
	var yrug = chart_body.selectAll(".yrug")
	    .data(data_rugs, key);
	if (settings.rugs) {
	    yrug.enter().append("path").attr("class", "yrug").call(function(sel) {y_rug_init(sel, scales, settings);})
		.merge(yrug).transition().duration(1000).call(function(sel) {y_rug_formatting(sel, scales, settings);});
	}
	yrug.exit().transition().duration(1000).style("opacity", 0).remove();
	
	// Add labels
	var data_labels = (!settings.show_labels || data[0].lab === undefined) ? [] : data;
	var label = chart_body.selectAll(".label")
	    .data(data_labels, key);
	if (settings.show_labels) {
	    label.enter().append("text").attr("class", "label").call(function(sel) {label_init(sel, scales, settings);})
		.merge(label).transition().duration(1000).call(function(sel) {label_formatting(sel, scales, settings);});
	}
	label.exit().transition().duration(1000).style("opacity", 0).remove();

	
	// Add stats
	var stats_data = stats_compute(data, settings);
	var stats_symbol = chart_body
	    .selectAll(".stats_symbol")
	    .data(stats_data, key);
	stats_symbol.enter()
	    .append("path")
	    .style("opacity", 0)
	    .merge(stats_symbol)
	    .transition().duration(1000)
	    .call(function(sel) { stats_symbol_formatting(sel, scales, settings); })
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

	// Add manual line
	var error, r2;
	var manual_line_data = [];
	if (settings.manual_line & settings.manual_slope != "" & settings.manual_intercept != "") {
	    var slope = parseFloat(settings.manual_slope);
	    var intercept = parseFloat(settings.manual_intercept);
	    manual_line_data = [{slope: slope,
				 intercept: intercept,
				 stroke: "#0B0",
				 stroke_width: "2px"
				}];
	    error = compute_error(data, slope, intercept);
	    d3.select("#man-slope").text(parseFloat(settings.manual_slope).toPrecision(3));
	    d3.select("#man-intercept").text(parseFloat(settings.manual_intercept).toPrecision(3));
	    d3.select("#man-error").text(parseFloat(error).toFixed(1));
	}
	var manual_line = chart_body.selectAll(".manualline")
	    .data(manual_line_data);
	manual_line.enter().append("path").call(line_init)
	    .attr("class", "manualline line")
	    .style("opacity", "0")
	    .merge(manual_line)
	    .transition().duration(1000)
	    .call(function(sel) {
		line_formatting(sel, dims, scales);
	    })
	    .style("opacity", "1");
	manual_line.exit().transition().duration(1000).style("opacity", "0").remove();
	
	// Add regression line
	var reg_line_data = [];
	if (settings.reg_line & data.length > 0) {
	    var regression = ss.linearRegression(data.map(function(d) {
		return [d.x, d.y];
	    }));
	    reg_line_data = [{slope: regression.m,
			      intercept: regression.b,
			      stroke: "#F05837",
			      stroke_width: "2px"
			     }];
	    error = compute_error(data, regression.m, regression.b);
	    r2 = compute_r2(data, error);
	    d3.select("#reg-slope").text(regression.m.toPrecision(3));
	    d3.select("#reg-intercept").text(regression.b.toPrecision(3));
	    d3.select("#reg-error").text(error.toFixed(1));
	    d3.select("#reg-r2").text(r2.toPrecision(3));
	}
	var reg_line = chart_body.selectAll(".regline")
	    .data(reg_line_data);
	reg_line.enter().append("path").call(line_init)
	    .attr("class", "regline line")
	    .style("opacity", "0")
	    .merge(reg_line)
	    .transition().duration(1000)
	    .call(function(sel) {
		line_formatting(sel, dims, scales);
	    })
	    .style("opacity", "1");
	reg_line.exit().transition().duration(1000).style("opacity", "0").remove();

	// Add manual error lines
	var manual_errors_data = [];
	if (settings.manual_errors) {
	    var slope = parseFloat(settings.manual_slope);
	    var intercept = parseFloat(settings.manual_intercept);
	    manual_errors_data = data.map(function(d) {
		return {x: d.x,
			ystart: d.y,
			yend: slope * d.x + intercept,
			stroke: "#0B0" 
		       };
	    });
	}
	var manual_error = chart_body.selectAll(".manualerror")
	    .data(manual_errors_data);
	manual_error.enter().append("path").call(error_init)
	    .attr("class", "manualerror")
	    .style("opacity", "0")
	    .merge(manual_error)
	    .transition().duration(1000)
	    .call(function(sel) {
		error_formatting(sel, dims, scales);
	    })
	    .style("opacity", "1");
	manual_error.exit().transition().duration(1000).style("opacity", "0").remove();

	// Add manual error points
	var manual_errors_points_data = [];
	if (settings.manual_errors) {
	    manual_errors_points_data = data.map(function(d) {
		return {x: d.x,
			y: slope * d.x + intercept,
			col: "#0B0" 
		       };
	    });
	}
	var manual_error_points = chart_body.selectAll(".manualerrorpoint")
	    .data(manual_errors_points_data);
	manual_error_points.enter().append("path")
	    .call(function(sel) {
		error_dot_init(sel, scales, settings);
	    })
	    .attr("class", "manualerrorpoint")
	    .style("opacity", "0")
	    .merge(manual_error_points)
	    .transition().duration(1000)
	    .call(function(sel) {
		error_dot_formatting(sel, scales, settings);
	    })
	    .style("opacity", "1");
	manual_error_points.exit().transition().duration(1000).style("opacity", "0").remove();
	
	// Add regression error lines
	var reg_errors_data = [];
	if (settings.reg_errors) {
	    reg_errors_data = data.map(function(d) {
		return {x: d.x,
			ystart: d.y,
			yend: regression.m * d.x + regression.b,
			stroke: "#F05837" 
		       };
	    });
	}
	var reg_error = chart_body.selectAll(".regerror")
	    .data(reg_errors_data);
	reg_error.enter().append("path").call(error_init)
	    .attr("class", "regerror")
	    .style("opacity", "0")
	    .merge(reg_error)
	    .transition().duration(1000)
	    .call(function(sel) {
		error_formatting(sel, dims, scales);
	    })
	    .style("opacity", "1");
	reg_error.exit().transition().duration(1000).style("opacity", "0").remove();

	// Add regression error points
	var reg_errors_points_data = [];
	if (settings.reg_errors) {
	    reg_errors_points_data = data.map(function(d) {
		return {x: d.x,
			y: regression.m * d.x + regression.b,
			col: "#F05837" 
		       };
	    });
	}
	var reg_error_points = chart_body.selectAll(".regerrorpoint")
	    .data(reg_errors_points_data);
	reg_error_points.enter().append("path")
	    .call(function(sel) {
		error_dot_init(sel, scales, settings);
	    })
	    .attr("class", "regerrorpoint")
	    .style("opacity", "0")
	    .merge(reg_error_points)
	    .transition().duration(1000)
	    .call(function(sel) {
		error_dot_formatting(sel, scales, settings);
	    })
	    .style("opacity", "1");
	reg_error_points.exit().transition().duration(1000).style("opacity", "0").remove();

	// Add regression predict value
	var reg_predict_data = [];
	if(settings.reg_predict != "" & settings.reg_line) {
	    reg_predict_data = [{x: parseFloat(settings.reg_predict),
				 y: parseFloat(settings.reg_predict) * regression.m + regression.b,
				 type: "base"},
				{x: parseFloat(settings.reg_predict),
				 y: parseFloat(settings.reg_predict) * regression.m + regression.b,
				type: "h_line"}];
	}
	var predict_line = chart_body.selectAll(".predict-line")
	    .data(reg_predict_data);
	predict_line.enter().append("path")
	    .call(predict_line_init)
	    .attr("class", "predict-line")
	    .style("opacity", "0")
	    .merge(predict_line)
	    .transition().duration(1000)
	    .call(function(sel) {
		predict_line_formatting(sel, scales);
	    })
	    .style("opacity", "1");
	predict_line.exit().transition().duration(1000).style("opacity", "0").remove();
	var predict_dot = chart_body.selectAll(".predict-dot")
	    .data(reg_predict_data);
	predict_dot.enter().append("path")
	    .call(predict_dot_init)
	    .attr("class", "predict-dot")
	    .style("opacity", "0")
	    .merge(predict_dot)
	    .transition().duration(1000)
	    .call(function(sel) {
		predict_dot_formatting(sel, scales);
	    })
	    .style("opacity", "1");
	predict_dot.exit().transition().duration(1000).style("opacity", "0").remove();
	var predict_label = chart_body.selectAll(".predict-label")
	    .data(reg_predict_data);
	predict_label.enter().append("text")
	    .attr("class", "predict-label")
	    .style("opacity", "0")
	    .merge(predict_label)
	    .transition().duration(1000)
	    .call(function(sel) {
		predict_label_formatting(sel, scales);
	    })
	    .style("opacity", "1");
	predict_label.exit().transition().duration(1000).style("opacity", "0").remove();


	
	    
    };

    // Dynamically resize plot area
    function resize_plot(svg_sel) {
	// Change svg_sel attributes
        svg_sel.attr("width", dims.svg_width)
            .attr("height", dims.svg_height);
        svg_sel.selectAll(".root")
            .attr("width", dims.width)
            .attr("height", dims.height);
	svg_sel.selectAll(".root")
	    .select("rect")
            .attr("width", dims.width)
            .attr("height", dims.height);
        svg_sel.selectAll(".chart-body")
            .attr("width", dims.width)
            .attr("height", dims.height);
	svg_sel.select(".x.axis")
	    .attr("transform", "translate(0," + dims.height + ")");
        svg_sel.select(".x-axis-label")
	    .attr("transform", "translate(" + (dims.width - 5) + "," + (dims.height - 6) + ")");
	svg_sel.select(".x.axis").call(scales.xAxis);
	svg_sel.select(".y.axis").call(scales.yAxis);
    }
    
    // Dynamically resize chart elements
    function resize_chart () {
        // recompute sizes
        dims = setup_sizes(width, height, settings);
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
        svg.select(".gear-menu")
	    .attr("transform", "translate(" + (width - 40) + "," + 10 + ")");
	
    };
 
    chart.update_data_manual = function() {
	var data_string_x = settings.data_manual_x;
	var data_string_y = settings.data_manual_y;
	var new_data_x = data_string_x.split(/ *, */);
	var new_data_y = data_string_y.split(/ *, */);
	var valid = true;
	new_data = new_data_x.map(function(val, i) {
	    var d = {}; 
	    d.key = i;
	    d.x = parseFloat(val);
	    var y = new_data_y[i];
	    d.y = y === undefined ? 0 : parseFloat(y);
	    if (isNaN(d.x) | isNaN(d.y)) {
		valid = false;
	    };
	    return d;
	});
	if (!valid) {
	    alert(":invalid_data:".toLocaleString());
	    return;
	}
	data = new_data;
	d3.select("#points_show_labels").style("display", "none");
	settings.allow_dragging = true;
	xlab = "x";
	ylab = "y";
	update_scales();
	update_plot();
    };

    chart.update_data_random = function() {
	var new_data_x = [];
	var new_data_y = [];
	switch (settings.data_law_x) {
	case "uniforme":
	    new_data_x = d3.range(settings.data_nbvalues)
		.map(d3.randomUniform(settings.data_uniform_min_x, settings.data_uniform_max_x));
	    break;
	case "normale":
	    new_data_x = d3.range(settings.data_nbvalues)
	    	.map(d3.randomNormal(settings.data_normal_mean_x, settings.data_normal_sd_x));
	    break;
	}
	switch (settings.data_law_y) {
	case "uniforme":
	    new_data_y = d3.range(settings.data_nbvalues)
		.map(d3.randomUniform(settings.data_uniform_min_y, settings.data_uniform_max_y));
	    break;
	case "normale":
	    new_data_y = d3.range(settings.data_nbvalues)
	    	.map(d3.randomNormal(settings.data_normal_mean_y, settings.data_normal_sd_y));
	    break;
	}
	var new_data = new_data_x.map(function(val, i) {
	    var d = {}; 
	    d.key = i;
	    d.x = parseFloat(val);
	    d.y = parseFloat(new_data_y[i]);
	    return d;
	});
	data = new_data;
	d3.select("#points_show_labels").style("display", "none");
	settings.allow_dragging = true;
	xlab = "x";
	ylab = "y";
	update_scales();
	update_plot();
    };

    chart.update_data_dataset = function() {
	var new_data, csv_data, labels;
	var id = settings.data_dataset;
	switch(id) {
	case "lifeexp_gdp_europe_2007":
	    csv_data = d3.csvParse(datasets(id));
	    new_data = csv_data.map(function(val, i) {
		var d = {}; 
		d.lab = val.country;
		d.key = d.lab;
		d.y = parseFloat(val.lifeExp);
		d.x = parseFloat(val.gdpPercap);
		return d;
	    });
	    labels = true;
	    xlab = "GDP per capita";
	    ylab = "Life expectancy";
	    break;
	case "lifeexp_gdp_world_2007":
	    csv_data = d3.csvParse(datasets(id));
	    new_data = csv_data.map(function(val, i) {
		var d = {}; 
		d.lab = val.country;
		d.key = d.lab;
		d.y = parseFloat(val.lifeExp);
		d.x = parseFloat(val.gdpPercap);
		return d;
	    });
	    labels = true;
	    xlab = "GDP per capita";
	    ylab = "Life expectancy";
	    break;
	case "galton_1886":
	    csv_data = d3.csvParse(datasets(id));
	    new_data = csv_data.map(function(val, i) {
		var d = {}; 
		d.key = i;
		d.y = parseFloat(val.child);
		d.x = parseFloat(val.parent);
		xlab = "Mid-parents height (cm)";
		ylab = "Child height (cm)";
		return d;
	    });
	    labels = false;
	    break;
	}
	if (labels) {
	    d3.select("#points_show_labels").style("display", "block");
	} else {
	    d3.select("#points_show_labels").style("display", "none");
	}
	data = new_data;
	settings.allow_dragging = false;
	update_scales();
	update_plot();
    };

    chart.switch_axes = function() {
	data = data.map(function(d) {
	    var tmp_y = d.y;
	    d.y = d.x;
	    d.x = tmp_y;
	    return(d);
	});
	var tmp_ylab = ylab;
	ylab = xlab;
	xlab = tmp_ylab;
	update_scales();
	update_plot();
    };
    
    chart.update_dots = function() {
	d3.selectAll(".dot").call(function(sel) {
	    dot_init(sel, scales, settings, xlab, ylab);
	    dot_formatting(sel, scales, settings);
	});
	d3.selectAll(".xrug").call(function(sel) {
	    x_rug_formatting(sel, scales, settings);
	});
	d3.selectAll(".yrug").call(function(sel) {
	    y_rug_formatting(sel, scales, settings);
	});
	d3.selectAll(".manualerrorpoint, .regerrorpoint").call(function(sel) {
	    error_dot_init(sel, scales, settings);
	});
	
    };

    chart.update_scales = function() {
	update_scales();
    };
    
    chart.update_plot = function() {
	update_plot();
    };
    
    // resize
    chart.resize = function() {
        resize_chart();
    };

    // data getter/setter
    chart.data = function(value, redraw) {
        if (!arguments.length) return data;
        data = value;
        if (!redraw) update_plot();
        return chart;
    };

    // settings getter/setter
    chart.settings = function(value) {
        if (!arguments.length) return settings;
        settings = value;
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


function generate_settings() {
    var law_x = d3.select("#data_law_x").node();
    law_x = law_x.options[law_x.selectedIndex].value;
    var law_y = d3.select("#data_law_y").node();
    law_y = law_y.options[law_y.selectedIndex].value;
    var dataset = d3.select("#data_dataset").node();
    dataset = dataset.options[dataset.selectedIndex].value;
    var settings = {
	data_manual_x: d3.select("#data_manual_x").node().value,
	data_manual_y: d3.select("#data_manual_y").node().value,
	data_law_x: law_x,
	data_law_y: law_y,
	data_nbvalues: d3.select("#nb_values").node().value,
	data_uniform_min_x: d3.select("#data_uniform_min_x").node().value,
	data_uniform_max_x: d3.select("#data_uniform_max_x").node().value,
	data_normal_mean_x: d3.select("#data_normal_mean_x").node().value,
	data_normal_sd_x: d3.select("#data_normal_sd_x").node().value,
	data_uniform_min_y: d3.select("#data_uniform_min_y").node().value,
	data_uniform_max_y: d3.select("#data_uniform_max_y").node().value,
	data_normal_mean_y: d3.select("#data_normal_mean_y").node().value,
	data_normal_sd_y: d3.select("#data_normal_sd_y").node().value,
	data_dataset: dataset,
	points_size: d3.select("#points_size").node().value,
	points_opacity: parseFloat(d3.select("#points_opacity").node().value),
	show_labels: d3.select("#show_labels").node().checked,
	rugs: d3.select("#show_rugs").node().checked,
	stats_mean: d3.select("#stats_mean").node().checked,
	stats_sd: d3.select("#stats_sd").node().checked,
	stats_cov: d3.select("#stats_cov").node().checked,
	stats_spearman: d3.select("#stats_spearman").node().checked,
	manual_line: d3.select("#manual_line").node().checked,
	manual_slope: d3.select("#manual_slope").node().value,
	manual_intercept: d3.select("#manual_intercept").node().value,
	manual_errors: d3.select("#manual_line").node().checked & d3.select("#manual_errors").node().checked,
	reg_line: d3.select("#reg_line").node().checked,
	reg_errors: d3.select("#reg_line").node().checked & d3.select("#reg_errors").node().checked,
	reg_predict: d3.select("#reg_predict").node().value,
	fixed: d3.select("#coord_fixed").node().checked,
	x_manual: d3.select("#x_manual").node().checked,
	x_min: d3.select("#x_min").node().value,
	x_max: d3.select("#x_max").node().value,
	y_manual: d3.select("#y_manual").node().checked,
	y_min: d3.select("#y_min").node().value,
	y_max: d3.select("#y_max").node().value,
	allow_dragging: true
    };
    return settings;
};

var svg = d3.select("#plot").append("svg");
var width = d3.select("#plot").node().getBoundingClientRect().width;
var settings = generate_settings();
var height = 600;

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
plot = plot.settings(settings);

// Default data
var data = [];
var data_lines = [{slope: 0,
		   intercept: 0,
		   stroke: "#777",
		   stroke_dasharray: [3,3]},
		  {slope: null,
		   intercept: 0,
		   stroke: "#777",
		   stroke_dasharray: [3,3]}
		 ];

plot = plot.data(data, true);
d3.select("#plot").call(plot);

// Add controls handlers
d3.select("#form_manual_data").on("submit", function(e) {
    d3.event.preventDefault();
    plot = plot.settings(generate_settings());
    plot.update_data_manual();
});
d3.select("#form_random_data").on("submit", function(e) {
    d3.event.preventDefault();
    plot = plot.settings(generate_settings());
    plot.update_data_random();
});
d3.select("#form_dataset").on("submit", function(e) {
    d3.event.preventDefault();
    plot = plot.settings(generate_settings());
    plot.update_data_dataset();
});
d3.select("#points_size").on("input", function(e) {
    plot = plot.settings(generate_settings());
    plot.update_dots();
});
d3.select("#points_opacity").on("input", function(e) {
    plot = plot.settings(generate_settings());
    plot.update_dots();
});
d3.selectAll("#show_rugs, #show_labels").on("input", function(e) {
    plot = plot.settings(generate_settings());
    plot.update_plot();
});
d3.selectAll("#stats_mean, #stats_sd, #stats_cov, #stats_spearman").on("input", function(e) {
    plot = plot.settings(generate_settings());
    plot.update_plot();
});
d3.selectAll("#coord_fixed, #x_manual, #x_min, #x_max, #y_manual, #y_min, #y_max").on("input", function(e) {
    plot = plot.settings(generate_settings());
    plot.update_scales();
    plot.update_plot();
});
d3.select("#coord_switch").on("click", function(e) {
    plot.switch_axes();
});
d3.selectAll("#manual_line, #manual_slope, #manual_intercept, #manual_errors").on("input", function(e) {
    plot = plot.settings(generate_settings());
    plot.update_plot();
});
d3.selectAll("#reg_line, #reg_errors, #reg_predict").on("input", function(e) {
    plot = plot.settings(generate_settings());
    plot.update_plot();
});

// Window resize

window.onresize = function() {
    var width = d3.select("#plot").node().getBoundingClientRect().width;
    svg
	.attr("width", width)
	.attr("height", height);
    // resize chart
    plot.width(width).height(height).svg(svg).resize();
};
