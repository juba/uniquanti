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
function tooltip_content(d) {
    var text = Array();
    if(d.lab !== undefined) text.push("<strong>" + d.lab + "</strong>");
    text.push("<strong>x : </strong>" + d.x.toFixed(2));
    text.push("<strong>y : </strong>" + d.y.toFixed(2));
    return text.join("<br />");
}
