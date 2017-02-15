(function ($) {
    $(function() {
	$("#data_normal_args_x").hide();
	$("#data_normal_args_y").hide();
	$("#x_limits").hide();
	$("#y_limits").hide();
	$("#points_show_labels").hide();
	$("#manual_line_options").hide();
	$("#reg_line_options").hide();
	$("#manualtable").hide();
	$("#regtable").hide();
	
	
	
	$("#data_law_x").on("change", function() {
	    switch($(this).val()) {
	    case 'uniforme':
		$("#data_uniform_args_x").show();
		$("#data_normal_args_x").hide();
		break;
	    case 'normale':
		$("#data_uniform_args_x").hide();
		$("#data_normal_args_x").show();
		break;
	    }
	});

	$("#data_law_y").on("change", function() {
	    switch($(this).val()) {
	    case 'uniforme':
		$("#data_uniform_args_y").show();
		$("#data_normal_args_y").hide();
		break;
	    case 'normale':
		$("#data_uniform_args_y").hide();
		$("#data_normal_args_y").show();
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

	$("#manual_line").on("change", function() {
	    if($(this).prop('checked')) {
		$("#manual_line_options").show();
		$("#manualtable").show();
	    } else {
		$("#manual_line_options").hide();
		$("#manualtable").hide();
	    }
	});
	$("#reg_line").on("change", function() {
	    if($(this).prop('checked')) {
		$("#reg_line_options").show();
		$("#regtable").show();
	    } else {
		$("#reg_line_options").hide();
		$("#regtable").hide();		
	    }
	});

	
	
    });
  
})(jQuery);


