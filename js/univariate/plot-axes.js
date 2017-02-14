// Create and draw x and y axes
function add_axes(selection, dims, settings, scales) {
    // x axis
    selection.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + dims.height + ")")
        .style("font-size", "11px")
        .call(scales.xAxis);

}
