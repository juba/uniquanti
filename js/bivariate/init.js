(function ($) {
    $(function() {
	$("#data_normal_args").hide();
	$("#graph_hist_args").hide();
	$("#graph_kde_args").hide();
	$("#x_limits").hide();
	$("#y_limits").hide();
	$("#points_show_labels").hide();
	
	
	$("#data_law").on("change", function() {
	    switch($(this).val()) {
	    case 'uniforme':
		$("#data_uniform_args").show();
		$("#data_normal_args").hide();
		break;
	    case 'normale':
		$("#data_uniform_args").hide();
		$("#data_normal_args").show();
		break;
	    }
	});

	$("#graph_type").on("change", function() {
	    switch($(this).val()) {
	    case 'none':
		$("#graph_hist_args").hide();
		$("#graph_kde_args").hide();
		break;
	    case 'hist':
		$("#graph_hist_args").show();
		$("#graph_kde_args").hide();
		break;
	    case 'boxplot':
		$("#graph_hist_args").hide();
		$("#graph_kde_args").hide();
		break;
	    case 'kde':
		$("#graph_kde_args").show();
		$("#graph_hist_args").hide();
		break;
	    }
	});
	
	$("#x_manual").on("change", function() {
	    if($(this).prop('checked')) {
		$("#x_limits").show();
	    } else {
		$("#x_limits").hide();
	    }
	});

	$("#y_manual").on("change", function() {
	    if($(this).prop('checked')) {
		$("#y_limits").show();
	    } else {
		$("#y_limits").hide();
	    }
	});

	
    });
  
})(jQuery);


