$(document).ready(function(){

	$('#changeset-form').submit(function(event){

		event.preventDefault();
		$.ajax({
			url: '/crwaler/changeset',
			type: 'POST',
			dataType: 'json',
			data: {
				url: $('input[name=url]').val()

			},
		})
		.done(function() {
			console.log("success");
		})
		.fail(function() {
			console.log("error");
		})
		.always(function() {
			console.log("complete");
		});

	  	
	});

	$('#ticket-form').submit(function(event) {
		/* Act on the event */
		event.preventDefault();
		$.ajax({
			url: '/crwal/ticket',
			type: 'POST',
			dataType: 'json',
			data: {
				param1: 'value1'
			},
		})
		.done(function() {
			console.log("success");
		})
		.fail(function() {
			console.log("error");
		})
		.always(function() {
			console.log("complete");
		});
		
	});
	
});