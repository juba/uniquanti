// Clean variables levels to be valid CSS classes
function css_clean(s) {
    if (s === undefined) return "";
    return s.toString().replace(/[^\w-]/g, "_");
}

// Default translation function for points and labels
function translation(d, scales) {
     return "translate(" + scales.x(d.x) + "," + scales.y(d.y) + ")";
}

// Create tooltip content function
function tooltip_content(d, xlab, ylab) {
    var text = Array();
    if(d.lab !== undefined) text.push("<strong>" + d.lab + "</strong>");
    text.push("<strong>"+xlab+" : </strong>" + d.x.toFixed(2));
    text.push("<strong>"+ylab+" : </strong>" + d.y.toFixed(2));
    return text.join("<br />");
}

// Compute sum of squared errors
function compute_error (data, slope, intercept) {
    var errors = data.map(function (d) {
	return Math.pow((d.y - (d.x * slope + intercept)), 2);
    });
    return errors.reduce(function(acc, val) {
	return acc + val;
    });
}

// Compute R2
function compute_r2(data, error) {
    var sse = error;
    var mean_y = d3.mean(data, function(d) {return d.y;});
    var tss = data.map(function(d) {
	return Math.pow(d.y - mean_y, 2);
    });
    tss = tss.reduce(function(acc, val) {
	return acc + val;
    });
    return 1 - sse / tss;
}
