(function ($) {
    $(function() {
	$("#data_normal_args").hide();
    
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

    });
  
})(jQuery);


