// Create and draw x and y axes
function add_axes(selection, dims, settings, scales) {
    // x axis
    selection.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + dims.height + ")")
        .style("font-size", "11px")
        .call(scales.xAxis);

    // y axis
    // selection.append("g")
    //     .attr("class", "y axis")
    //     .style("font-size", "11px")
    //     .call(scales.yAxis);

    // selection.append("text")
    //     .attr("class", "y-axis-label")
    //     .attr("transform", "translate(5,6) rotate(-90)")
    //     .attr("dy", ".71em")
    //     .style("text-anchor", "end")
    //     .text("Effectif");

}
