// Export to SVG function
function export_svg(sel, svg, settings) {
    var svg_content = svg
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .attr("version", 1.1)
        .node().parentNode.innerHTML;
    // Dirty dirty dirty...
    svg_content = svg_content.replace(/<g class="gear-menu[\s\S]*?<\/g>/, '');
    svg_content = svg_content.replace(/<div class="plot-menu[\s\S]*?<\/div>/, '');
    var image_data = "data:image/octet-stream;base64," + window.btoa(unescape(encodeURIComponent(svg_content)));
    d3.select(sel)
        .attr("download", "plot.svg")
        .attr("href", image_data);
}
