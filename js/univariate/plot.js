
function plot() {

	var width = 600, // default width
		height = 600, // default height
		dims = {},
		settings = {},
		scales = {},
		data = [],
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
		scales.xAxis = scales.xAxis.scale(scales.x);
		root.select(".x.axis").call(scales.xAxis);
		root.select(".x.axis.graph").call(scales.xAxis);

		var chart_body = svg.select(".chart-body");
		chart_body.selectAll(".dot")
			.attr("transform", function (d) { return translation(d, scales); });
		chart_body.selectAll(".label").call(function (sel) {
			label_formatting(sel, scales, settings);
		});
		chart_body.selectAll(".line").call(function (sel) {
			line_formatting(sel, dims, scales);
		});
		chart_body.selectAll(".stats_symbol").call(function (sel) {
			stats_symbol_formatting(sel, scales);
		});
		chart_body.selectAll(".stats_label").call(function (sel) {
			stats_label_formatting(sel, scales);
		});
		chart_body.selectAll(".bar").call(function (sel) {
			bar_formatting(sel, scales, bins);
		});
		chart_body.selectAll(".bar-label").call(function (sel) {
			bar_label_formatting(sel, scales, settings);
		});
		chart_body.selectAll(".boxplot-box").call(function (sel) {
			boxplot_box_formatting(sel, scales, settings);
		});
		chart_body.selectAll(".boxplot-median").call(function (sel) {
			boxplot_median_formatting(sel, scales, settings);
		});
		chart_body.selectAll(".boxplot-whisker").call(function (sel) {
			boxplot_whisker_formatting(sel, scales, settings);
		});
		chart_body.selectAll(".boxplot-whisker-bar").call(function (sel) {
			boxplot_whisker_bar_formatting(sel, scales, settings);
		});
		chart_body.selectAll(".boxplot-outlier").call(function (sel) {
			boxplot_outlier_formatting(sel, scales, settings);
		});
		chart_body.selectAll(".kde").call(function (sel) {
			kde_formatting(sel, scales);
		});

	}

	// Reset zoom function
	function reset_zoom() {
		var root = svg.select(".root");
		root.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
	}


	// Dots dragging function
	var points_dragging = false;
	points_drag = function () {
		if (!settings.allow_dragging) return function () { };
		return d3.drag()
			.subject(function (d, i) {
				return { x: scales.x(d.x) };
			})
			.on('start', function (d, i) {
				points_dragging = true;
			})
			.on('drag', function (d) {
				if (points_dragging) {
					var cx = d3.event.x - scales.x(d.x);
					d.x = scales.x.invert(d3.event.x);
					d3.select(this).attr("transform", function (d) { return translation(d, scales); });
					d3.select(".tooltip").style("left", (d3.mouse(d3.select("body").node())[0]) + 15 + "px")
						.html(tooltip_content(d));
					d3.selectAll(".label").call(function (sel) {
						label_formatting(sel, scales, settings);
					});
					var stats_data = stats_compute(data, settings);
					d3.selectAll(".stats_symbol")
						.data(stats_data, key)
						.call(function (sel) {
							stats_symbol_formatting(sel, scales);
						});
					d3.selectAll(".stats_label")
						.data(stats_data, key)
						.call(function (sel) {
							stats_label_formatting(sel, scales);
						});
					if (settings.graph_type == "hist") {
						bins = compute_bins(data, settings);
						scales = compute_hist_scales(scales, bins, settings, points_dragging);
						d3.selectAll(".bar")
							.data(bins, key)
							.transition().duration(100).ease(d3.easeLinear)
							.call(function (sel) {
								bar_formatting(sel, scales, bins);
							});
						d3.selectAll(".bar-label")
							.data(bins, key)
							.transition().duration(100).ease(d3.easeLinear)
							.call(function (sel) {
								bar_label_formatting(sel, scales, settings);
							});

						d3.select(".y.axis.graph")
							.transition().duration(100).ease(d3.easeLinear)
							.call(scales.yAxis_graph);
					}
					if (settings.graph_type == "boxplot") {
						var boxplot_stats = compute_boxplot_stats(data, settings);
						var data_median = compute_boxplot_median(boxplot_stats, settings);
						d3.selectAll(".boxplot-median")
							.data(data_median, key)
							.transition().duration(100).ease(d3.easeLinear)
							.call(function (sel) {
								boxplot_median_formatting(sel, scales);
							});
						var data_box = compute_boxplot_box(boxplot_stats, settings);
						d3.selectAll(".boxplot-box")
							.data(data_box, key)
							.transition().duration(100).ease(d3.easeLinear)
							.call(function (sel) {
								boxplot_box_formatting(sel, scales);
							});
						var data_whiskers = compute_boxplot_whiskers(boxplot_stats, settings);
						d3.selectAll(".boxplot-whisker")
							.data(data_whiskers, key)
							.transition().duration(100).ease(d3.easeLinear)
							.call(function (sel) {
								boxplot_whisker_formatting(sel, scales);
							});
						d3.selectAll(".boxplot-whisker-bar")
							.data(data_whiskers, key)
							.transition().duration(100).ease(d3.easeLinear)
							.call(function (sel) {
								boxplot_whisker_bar_formatting(sel, scales);
							});
						var data_outliers = compute_boxplot_outliers(boxplot_stats, settings);
						var chart_body = d3.select(".chart-body");
						var outliers = chart_body.selectAll(".boxplot-outlier")
							.data(data_outliers, key);
						outliers.enter().append("circle")
							.attr("class", "boxplot-outlier")
							.call(function (sel) { boxplot_outlier_init(sel, scales); })
							.merge(outliers)
							.call(function (sel) { boxplot_outlier_formatting(sel, scales); })
							.style("opacity", 1);
						outliers.exit()
							.remove();
					}
					if (settings.graph_type == "kde") {
						var kde_data = compute_kde_data(data, settings, scales);
						scales = compute_kde_scales(scales, kde_data, settings, points_dragging);
						kde_data = add_kde_extremes(kde_data, scales);
						d3.selectAll(".kde")
							.data([kde_data])
							.transition().duration(100).ease(d3.easeLinear)
							.call(function (sel) {
								kde_formatting(sel, scales, bins);
							});
						d3.select(".y.axis.graph")
							.transition().duration(100).ease(d3.easeLinear)
							.call(scales.yAxis_graph);
					}
				}
			})
			.on('end', function (d) {
				if (points_dragging) {
					points_dragging = false;
				}
			});
	};


	// Key function to identify rows when interactively filtering
	function key(d) {
		return d.key;
	}

	function chart(selection) {
		selection.each(function () {

			dims = setup_sizes(width, height);
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

			root.call(function (sel) { add_axes(sel, dims, settings, scales); });

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
				.call(function (sel) {
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
				.on("click", function () { export_svg(this, svg, settings); })
				.html("Export to SVG");

			gear.on("click", function (d, i) {
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


	// Update data with transitions
	function update_plot() {

		dims = setup_sizes(width, height);
		scales = setup_scales(dims, data, settings);
		bins = compute_bins(data, settings);
		var kde_data = compute_kde_data(data, settings, scales);
		if (settings.graph_type == "hist") {
			scales = compute_hist_scales(scales, bins, settings);
		}
		if (settings.graph_type == "boxplot") {
			scales = compute_boxplot_scales(scales, bins, settings);
		}
		if (settings.graph_type == "kde") {
			scales = compute_kde_scales(scales, kde_data, settings);
			kde_data = add_kde_extremes(kde_data, scales);
		}

		var root = svg.select(".root");

		// Histogram and density axes
		if ((settings.graph_type == "hist" || settings.graph_type == "kde")
			&& svg.select(".y.axis.graph").empty()) {
			root.append("g")
				.attr("class", "x axis graph")
				.attr("transform", "translate(0, 400)")
				.style("font-size", "11px")
				.style("opacity", 0);
			root.append("g")
				.attr("class", "y axis graph")
				.style("font-size", "11px")
				.style("opacity", 0);
		}
		// Boxplot axes
		if (settings.graph_type == "boxplot" && svg.select(".x.axis.graph").empty()) {
			root.append("g")
				.attr("class", "x axis graph")
				.attr("transform", "translate(0, 400)")
				.style("font-size", "11px")
				.style("opacity", 0);
		}
		// Remove y axis for boxplot
		if (settings.graph_type == "boxplot") {
			root.selectAll(".y.axis.graph")
				.remove();
		}
		// Remove axes if no graph
		if (!settings.graph) {
			root.selectAll(".x.axis.graph, .y.axis.graph")
				.transition().duration(1000)
				.style("opacity", 0)
				.remove();
		}

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
			.call(function (sel) {
				line_formatting(sel, dims, scales);
			})
			.style("opacity", "1");
		line.exit().transition().duration(1000).style("opacity", "0").remove();

		// Add points
		var dot = chart_body.selectAll(".dot")
			.data(data, key);
		dot.enter().append("path").attr("class", "dot").call(function (sel) { dot_init(sel, scales, settings); }).call(points_drag())
			.merge(dot).transition().duration(1000).call(function (sel) { dot_formatting(sel, scales, settings); });
		dot.exit().transition().duration(1000).attr("transform", "translate(0,0)").remove();

		// Add labels
		var data_labels = (!settings.show_labels || data[0].lab === undefined) ? [] : data;
		var label = chart_body.selectAll(".label")
			.data(data_labels, key);
		if (settings.show_labels) {
			label.enter().append("text").attr("class", "label").call(function (sel) { label_init(sel, scales, settings); })
				.merge(label).transition().duration(1000).call(function (sel) { label_formatting(sel, scales, settings); });
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
			.call(function (sel) { stats_symbol_formatting(sel, scales); })
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
			.call(function (sel) { stats_label_formatting(sel, scales); })
			.style("opacity", 1);
		stats_label.exit().transition().duration(1000).style("opacity", "0").remove();

		// Add histogram
		var bar = chart_body
			.selectAll(".bar")
			.data(bins, key);
		if (settings.graph_type == "hist") {
			bar.enter().append("rect")
				.attr("class", "bar")
				.style("opacity", 0)
				.call(function (sel) { bar_init(sel, scales, settings); })
				.merge(bar)
				.transition().duration(1000)
				.call(function (sel) { bar_formatting(sel, scales, bins); })
				.style("opacity", 1);
		}
		bar.exit()
			.transition().duration(1000)
			.attr("width", 0)
			.style("opacity", 0)
			.remove();
		// Histogram labels
		var labels_data = settings.hist_labels ? bins : [];
		var bar_labels = chart_body
			.selectAll(".bar-label")
			.data(labels_data, key);
		if (settings.graph_type == "hist" && settings.hist_labels) {
			bar_labels.enter().append("text")
				.attr("class", "bar-label")
				.style("opacity", 0)
				.call(function (sel) { bar_label_init(sel, scales); })
				.merge(bar_labels)
				.transition().duration(1000)
				.call(function (sel) { bar_label_formatting(sel, scales, settings); });
		}
		bar_labels.exit()
			.transition().duration(1000)
			.attr("width", 0)
			.style("opacity", 0)
			.remove();

		// Boxplot
		var boxplot_stats = compute_boxplot_stats(data, settings);
		// Boxplot box
		var data_box = compute_boxplot_box(boxplot_stats, settings);
		var box = chart_body
			.selectAll(".boxplot-box")
			.data(data_box, key);
		if (settings.graph_type == "boxplot") {
			box.enter().append("rect")
				.attr("class", "boxplot-box")
				.style("opacity", 0)
				.call(function (sel) { boxplot_box_init(sel, scales); })
				.merge(box)
				.transition().duration(1000)
				.call(function (sel) { boxplot_box_formatting(sel, scales); })
				.style("opacity", 1);
		}
		box.exit()
			.transition().duration(1000)
			.style("opacity", 0)
			.remove();
		// Median line
		var data_median = compute_boxplot_median(boxplot_stats, settings);
		var median = chart_body
			.selectAll(".boxplot-median")
			.data(data_median, key);
		if (settings.graph_type == "boxplot") {
			median.enter().append("line")
				.attr("class", "boxplot-median")
				.style("opacity", 0)
				.call(function (sel) { boxplot_median_init(sel, scales); })
				.merge(median)
				.transition().duration(1000)
				.call(function (sel) { boxplot_median_formatting(sel, scales); })
				.style("opacity", 1);
		}
		median.exit()
			.transition().duration(1000)
			.style("opacity", 0)
			.remove();
		// Boxplot whiskers
		var data_whiskers = compute_boxplot_whiskers(boxplot_stats, settings);
		var whiskers = chart_body
			.selectAll(".boxplot-whisker")
			.data(data_whiskers, key);
		if (settings.graph_type == "boxplot") {
			whiskers.enter().append("line")
				.attr("class", "boxplot-whisker")
				.style("opacity", 0)
				.call(function (sel) { boxplot_whisker_init(sel, scales); })
				.merge(whiskers)
				.transition().duration(1000)
				.call(function (sel) { boxplot_whisker_formatting(sel, scales); })
				.style("opacity", 1);
		}
		whiskers.exit()
			.transition().duration(1000)
			.style("opacity", 0)
			.remove();
		// Boxplot whiskers bars
		var whiskers_bars = chart_body
			.selectAll(".boxplot-whisker-bar")
			.data(data_whiskers, key);
		if (settings.graph_type == "boxplot") {
			whiskers_bars.enter().append("line")
				.attr("class", "boxplot-whisker-bar")
				.style("opacity", 0)
				.call(function (sel) { boxplot_whisker_bar_init(sel, scales); })
				.merge(whiskers_bars)
				.transition().duration(1000)
				.call(function (sel) { boxplot_whisker_bar_formatting(sel, scales); })
				.style("opacity", 1);
		}
		whiskers_bars.exit()
			.transition().duration(1000)
			.style("opacity", 0)
			.remove();
		// Boxplot outliers
		var data_outliers = compute_boxplot_outliers(boxplot_stats, settings);
		var outliers = chart_body
			.selectAll(".boxplot-outlier")
			.data(data_outliers, key);
		if (settings.graph_type == "boxplot") {
			outliers.enter().append("circle")
				.attr("class", "boxplot-outlier")
				.style("opacity", 0)
				.call(function (sel) { boxplot_outlier_init(sel, scales); })
				.merge(outliers)
				.transition().duration(1000)
				.call(function (sel) { boxplot_outlier_formatting(sel, scales); })
				.style("opacity", 1);
		}
		outliers.exit()
			.transition().duration(1000)
			.style("opacity", 0)
			.remove();

		// Add density
		var kde = chart_body
			.selectAll(".kde")
			.data([kde_data]);
		if (settings.graph_type == "kde") {
			kde.enter().append("path")
				.attr("class", "kde")
				.style("opacity", 0)
				.call(function (sel) { kde_init(sel, scales); })
				.merge(kde)
				.transition().duration(1000)
				.call(function (sel) { kde_formatting(sel, scales); })
				.style("opacity", 1);
		}
		if (kde_data.length == 0) {
			kde.transition().duration(1000)
				.attr("width", 0)
				.style("opacity", 0)
				.remove();
		}



		// Reset zoom
		svg.select(".root")
			.transition().delay(1000).duration(0)
			.call(zoom.transform, d3.zoomIdentity);

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
		if (settings.graph) {
			svg_sel.select(".x.axis.graph")
				.call(scales.xAxis)
				.style("opacity", 1);
			svg_sel.select(".y.axis.graph")
				.call(scales.yAxis_graph)
				.style("opacity", 1);
		}
	}

	// Dynamically resize chart elements
	function resize_chart() {
		// recompute sizes
		dims = setup_sizes(width, height);
		// recompute x and y scales
		scales.x.range([0, dims.width]);
		scales.x_orig.range([0, dims.width]);
		scales.y_points.range(settings.graph ? [700, 400] : [300, 0]);
		scales.y_points_orig.range(settings.graph ? [700, 400] : [300, 0]);
		scales.xAxis = d3.axisBottom(scales.x).tickSize(5);
		scales.yAxis_points = d3.axisLeft(scales.y_points).tickSize(-dims.width);

		svg.call(resize_plot);

		svg.select(".root")
			.call(zoom.transform,
				d3.zoomTransform(svg.select(".root").node()));

		// Move menu
		svg.select(".gear-menu")
			.attr("transform", "translate(" + (width - 40) + "," + 10 + ")");

	};


	chart.update_data_manual = function () {
		var data_string = settings.data_manual;
		var new_data = data_string.split(/ *, */);
		var valid = true;
		new_data = new_data.map(function (val, i) {
			var d = {};
			d.key = i;
			d.x = parseFloat(val);
			if (isNaN(d.x)) { valid = false; };
			var defined_y = data[i] !== undefined && data[i].y !== undefined;
			var y = defined_y ? data[i].y : d3.randomUniform(-1, 1)();
			d.y = settings.jitter ? y : 0;
			return d;
		});
		if (!valid) {
			alert(":invalid_data:".toLocaleString());
			return;
		}
		data = new_data;
		d3.select("#points_show_labels").style("display", "none");
		settings.allow_dragging = true;
		update_plot();
	};

	chart.update_data_random = function () {
		var new_data = [];
		switch (settings.data_law) {
			case "uniforme":
				new_data = d3.range(settings.data_nbvalues)
					.map(d3.randomUniform(settings.data_uniform_min, settings.data_uniform_max));
				new_data = new_data.map(function (val, i) {
					var d = {};
					d.key = i;
					d.x = val;
					var defined_y = data[i] !== undefined && data[i].y !== undefined;
					var y = defined_y ? data[i].y : d3.randomUniform(-1, 1)();
					d.y = settings.jitter ? y : 0;
					return d;
				});
				break;
			case "normale":
				new_data = d3.range(settings.data_nbvalues)
					.map(d3.randomNormal(settings.data_normal_mean, settings.data_normal_sd));
				new_data = new_data.map(function (val, i) {
					var d = {};
					d.key = i;
					d.x = val;
					var defined_y = data[i] !== undefined && data[i].y !== undefined;
					var y = defined_y ? data[i].y : d3.randomUniform(-1, 1)();
					d.y = settings.jitter ? y : 0;
					return d;
				});
				break;
		}
		data = new_data;
		d3.select("#points_show_labels").style("display", "none");
		settings.allow_dragging = true;
		update_plot();
	};

	chart.update_data_dataset = function () {
		var new_data, csv_data, labels;
		var id = settings.data_dataset;
		switch (id) {
			case "life_expectancy_2014":
				csv_data = d3.csvParse(datasets(id));
				new_data = csv_data.map(function (val, i) {
					var d = {};
					d.lab = val.Country;
					d.key = d.lab;
					d.x = parseFloat(val.life_exp_2014);
					return d;
				});
				labels = true;
				break;
			case "population_departements_2013":
				csv_data = d3.csvParse(datasets(id));
				new_data = csv_data.map(function (val, i) {
					var d = {};
					d.lab = val.Departement;
					d.key = d.lab;
					d.x = parseInt(val.Population);
					return d;
				});
				labels = true;
				break;
			case "densite_departements_2013":
				csv_data = d3.csvParse(datasets(id));
				new_data = csv_data.map(function (val, i) {
					var d = {};
					d.lab = val.Departement;
					d.key = d.lab;
					d.x = parseFloat(val.Densite);
					return d;
				});
				labels = true;
				break;
			case "kung_heights":
				csv_data = d3.csvParse(datasets(id));
				new_data = csv_data.map(function (val, i) {
					var d = {};
					d.key = i;
					d.x = parseFloat(val.height);
					return d;
				});
				labels = false;
				break;
			case "age_meres_2015":
				csv_data = d3.csvParse(datasets(id));
				new_data = csv_data.map(function (val, i) {
					var d = {};
					d.key = i;
					d.x = parseInt(val.age);
					return d;
				});
				labels = false;
				break;

		}
		new_data = new_data.map(function (d, i) {
			var defined_y = data[i] !== undefined && data[i].y !== undefined;
			var y = defined_y ? data[i].y : d3.randomUniform(-1, 1)();
			d.y = settings.jitter ? y : 0;
			return d;
		});
		if (labels) {
			d3.select("#points_show_labels").style("display", "block");
		} else {
			d3.select("#points_show_labels").style("display", "none");
		}
		data = new_data;
		settings.allow_dragging = false;
		update_plot();
	};

	chart.update_dots = function () {
		d3.selectAll(".dot").call(function (sel) {
			dot_init(sel, scales, settings);
			dot_formatting(sel, scales, settings);
		});
	};

	chart.update_points_jitter = function () {
		var new_data = [];
		if (settings.jitter) {
			new_data = data.map(function (d) {
				d.y = d3.randomUniform(-1, 1)();
				return d;
			});
		} else {
			new_data = data.map(function (d) {
				d.y = 0;
				return d;
			});
		}
		data = new_data;
		update_plot();
	};

	chart.update_plot = function () {
		update_plot();
	};

	// resize
	chart.resize = function () {
		resize_chart();
	};

	// data getter/setter
	chart.data = function (value, redraw) {
		if (!arguments.length) return data;
		data = value;
		if (!redraw) update_plot();
		return chart;
	};

	// settings getter/setter
	chart.settings = function (value) {
		if (!arguments.length) return settings;
		settings = value;
		return chart;
	};

	chart.svg = function (value) {
		if (!arguments.length) return svg;
		svg = value;
		return chart;
	};

	// width getter/setter
	chart.width = function (value) {
		if (!arguments.length) return width;
		width = value;
		return chart;
	};

	// height getter/setter
	chart.height = function (value) {
		if (!arguments.length) return height;
		height = value;
		return chart;
	};

	return chart;

}



// PLOT INIT


function generate_settings() {
	var law = d3.select("#data_law").node();
	law = law.options[law.selectedIndex].value;
	var graph_type = d3.select("#graph_type").node();
	graph_type = graph_type.options[graph_type.selectedIndex].value;
	var dataset = d3.select("#data_dataset").node();
	dataset = dataset.options[dataset.selectedIndex].value;
	var settings = {
		data_manual: d3.select("#data_manual").node().value,
		data_law: law,
		data_nbvalues: d3.select("#nb_values").node().value,
		data_uniform_min: d3.select("#data_uniform_min").node().value,
		data_uniform_max: d3.select("#data_uniform_max").node().value,
		data_normal_mean: d3.select("#data_normal_mean").node().value,
		data_normal_sd: d3.select("#data_normal_sd").node().value,
		data_dataset: dataset,
		points_size: d3.select("#points_size").node().value,
		points_opacity: d3.select("#points_opacity").node().value,
		jitter: d3.select("#points_jitter").node().checked,
		show_labels: d3.select("#show_labels").node().checked,
		stats_mean: d3.select("#stats_mean").node().checked,
		stats_median: d3.select("#stats_median").node().checked,
		stats_quartiles: d3.select("#stats_quartiles").node().checked,
		stats_sd: d3.select("#stats_sd").node().checked,
		x_manual: d3.select("#x_manual").node().checked,
		x_min: d3.select("#x_min").node().value,
		x_max: d3.select("#x_max").node().value,
		y_manual: d3.select("#y_manual").node().checked,
		y_min: d3.select("#y_min").node().value,
		y_max: d3.select("#y_max").node().value,
		graph_type: graph_type,
		hist_classes: d3.select("#hist_classes").node().value,
		hist_exact: d3.select("#hist_exact").node().checked,
		hist_percent: d3.select("#hist_percent").node().checked,
		hist_labels: d3.select("#hist_labels").node().checked,
		kde_scale: d3.select("#kde_scale").node().value,
		allow_dragging: true,
		graph: graph_type != "none"
	};
	return settings;
};

var svg = d3.select("#plot").append("svg");
var width = d3.select("#plot").node().getBoundingClientRect().width;
var settings = generate_settings();
var height = settings.graph ? 700 : 300;
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
var data_lines = [{
	slope: 0,
	intercept: 0,
	stroke: "#CCC",
	stroke_dasharray: [3, 3]
}];

plot = plot.data(data, true);
d3.select("#plot").call(plot);

// Add controls handlers
d3.select("#form_manual_data").on("submit", function (e) {
	d3.event.preventDefault();
	plot = plot.settings(generate_settings());
	plot.update_data_manual();
});
d3.select("#form_random_data").on("submit", function (e) {
	d3.event.preventDefault();
	plot = plot.settings(generate_settings());
	plot.update_data_random();
});
d3.select("#form_dataset").on("submit", function (e) {
	d3.event.preventDefault();
	plot = plot.settings(generate_settings());
	plot.update_data_dataset();
});
d3.select("#points_size").on("input", function (e) {
	plot = plot.settings(generate_settings());
	plot.update_dots();
});
d3.select("#points_opacity").on("input", function (e) {
	plot = plot.settings(generate_settings());
	plot.update_dots();
});
d3.select("#points_jitter").on("input", function (e) {
	plot = plot.settings(generate_settings());
	plot.update_points_jitter();
});
d3.selectAll("#show_labels").on("input", function (e) {
	plot = plot.settings(generate_settings());
	plot.update_plot();
});
d3.selectAll("#stats_mean, #stats_median, #stats_quartiles, #stats_sd").on("input", function (e) {
	plot = plot.settings(generate_settings());
	plot.update_plot();
});
d3.selectAll("#x_manual, #x_min, #x_max, #y_manual, #y_min, #y_max").on("input", function (e) {
	plot = plot.settings(generate_settings());
	plot.update_plot();
});
d3.select("#graph_type").on("input", function (e) {
	var width = d3.select("#plot").node().getBoundingClientRect().width;
	var settings = generate_settings();
	var height = settings.graph ? 700 : 300;
	plot = plot.settings(settings);
	plot.width(width).height(height);
	plot.update_plot();
});
d3.selectAll("#hist_classes, #hist_exact, #hist_percent, #hist_labels").on("input", function (e) {
	plot = plot.settings(generate_settings());
	plot.update_plot();
});
d3.selectAll("#kde_scale").on("input", function (e) {
	plot = plot.settings(generate_settings());
	plot.update_plot();
});


// Window resize

window.onresize = function () {
	var width = d3.select("#plot").node().getBoundingClientRect().width;
	var graph_type = d3.select("#graph_type").node();
	graph_type = graph_type.options[graph_type.selectedIndex].value;
	var height = graph_type != "none" ? 700 : 300;
	svg
		.attr("width", width)
		.attr("height", height);
	// resize chart
	plot.width(width).height(height).svg(svg).resize();
};
