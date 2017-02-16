// Create and draw x and y axes
function add_axes(selection, dims, settings, scales, xlab, ylab) {
    // x axis
    selection.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + dims.height + ")")
        .call(scales.xAxis);
    // x axis
    selection.append("g")
        .attr("class", "y axis")
        .call(scales.yAxis);

    // x axis label
    selection.append("text")
        .attr("class", "x-axis-label")
        .attr("transform", "translate(" + (dims.width - 5) + "," + (dims.height - 6) + ")")
        .style("text-anchor", "end")
        .style("font-size", "11px")
        .text(xlab);

    // y axis label
    selection.append("text")
        .attr("class", "y-axis-label")
        .attr("transform", "translate(5,6) rotate(-90)")
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .style("font-size", "11px")
        .text(ylab);
    
}
