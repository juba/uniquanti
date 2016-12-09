(function ($) {
    $(function() {
	$("#data_normal_args").hide();
	$("#x_limits").hide();
	$("#y_limits").hide();
	
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


