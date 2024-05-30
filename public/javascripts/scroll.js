 $(document).ready(function(){

 // 	$(window).stellar();
	// $(".spacer").css("height",$(window).height()+'px');
	// $(".block-title").attr("height",$(window).height()+'px');
	// $( window ).resize(function() {
 //  		$(".spacer").css("height",$(window).height()+'px');
 //  		$(".block-title").attr("height",$(window).height()+'px');
	// });

	$.stellar({
		horizontalScrolling: false,
		verticalOffset: 40
	});

 	$('.scrollTo').click(function(e) {
    	e.preventDefault();
	    var bandId = $(this).attr('href');  
	    console.log(bandId);
	    $('html, body').animate({
	      	scrollTop: $(bandId).offset().top}, 'slow'
	    );
	    
  	});

  	$('.flexslider').flexslider({
		animation: "slide",
		slideshowSpeed: 3000
	});
	versions = [ '15', '20', '21', '22', '23', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36']


	$('#evolution').on('click',function(){
	    console.log( $('#introduction').offset().top );
	    $('html, body').animate({
	      	scrollTop: $('#introduction').offset().top + 180}, 'slow'
	    );

        setTimeout(function(){renderCircleGraph("/wordpress/circle_developer_comment_" + versions[0] + ".json","developer-evolution",300,666,666,versions[0])},0);
        setTimeout(function(){renderCircleGraph("/wordpress/circle_developer_comment_" + versions[1] + ".json","developer-evolution",300,666,666,versions[1])},2000);
        setTimeout(function(){renderCircleGraph("/wordpress/circle_developer_comment_" + versions[2] + ".json","developer-evolution",300,666,666,versions[2])},4000);
        setTimeout(function(){renderCircleGraph("/wordpress/circle_developer_comment_" + versions[3] + ".json","developer-evolution",300,666,666,versions[3])},6000);
        setTimeout(function(){renderCircleGraph("/wordpress/circle_developer_comment_" + versions[4] + ".json","developer-evolution",300,666,666,versions[4])},8000);
        setTimeout(function(){renderCircleGraph("/wordpress/circle_developer_comment_" + versions[5] + ".json","developer-evolution",300,666,666,versions[5])},10000);
        setTimeout(function(){renderCircleGraph("/wordpress/circle_developer_comment_" + versions[6] + ".json","developer-evolution",300,666,666,versions[6])},12000);
        setTimeout(function(){renderCircleGraph("/wordpress/circle_developer_comment_" + versions[7] + ".json","developer-evolution",300,666,666,versions[7])},14000);
        setTimeout(function(){renderCircleGraph("/wordpress/circle_developer_comment_" + versions[8] + ".json","developer-evolution",300,666,666,versions[8])},16000);
        setTimeout(function(){renderCircleGraph("/wordpress/circle_developer_comment_" + versions[9] + ".json","developer-evolution",300,666,666,versions[9])},18000);
        setTimeout(function(){renderCircleGraph("/wordpress/circle_developer_comment_" + versions[10] + ".json","developer-evolution",300,666,666,versions[10])},20000);
        setTimeout(function(){renderCircleGraph("/wordpress/circle_developer_comment_" + versions[11] + ".json","developer-evolution",300,666,666,versions[11])},22000);
        setTimeout(function(){renderCircleGraph("/wordpress/circle_developer_comment_" + versions[12] + ".json","developer-evolution",300,666,666,versions[12])},24000);
        setTimeout(function(){renderCircleGraph("/wordpress/circle_developer_comment_" + versions[13] + ".json","developer-evolution",300,666,666,versions[13])},26000);
        setTimeout(function(){renderCircleGraph("/wordpress/circle_developer_comment_" + versions[14] + ".json","developer-evolution",300,666,666,versions[14])},28000);
        setTimeout(function(){renderCircleGraph("/wordpress/circle_developer_comment_" + versions[15] + ".json","developer-evolution",300,666,666,versions[15])},30000);
        setTimeout(function(){renderCircleGraph("/wordpress/circle_developer_comment_" + versions[16] + ".json","developer-evolution",300,666,666,versions[16])},32000);

    });

});

var renderCircleGraph = function( jsonFile, divId, distance, width, height,version){

    var width = width?width:350,
        height = height?height:350;

    var color = d3.scale.category20();


    d3.select(document.getElementById(divId)).html("<h1>wordpress版本"+version+"</h1>");

    var svg = d3.select(document.getElementById(divId)).append("svg")
        .attr("width", width)
        .attr("height", height);

 

	var force = d3.layout.force()
	    .gravity(.05)
	    .linkDistance(200)
	    .charge(-100)
	    .size([width, height]);

	d3.json(jsonFile, function(error, json) {
		force
		  .nodes(json.nodes)
		  .links(json.links)
		  .start();

		var link = svg.selectAll(".link")
		  .data(json.links)
		.enter().append("line")
		  .attr("class", "link")
		  .style("stroke-width", function(d) { return Math.sqrt(d.value); });

		var node = svg.selectAll(".node")
		  .data(json.nodes)
		.enter().append("g")
		  .attr("class", "node")
		  .call(force.drag)
		  .style("stroke", function(d) { return color(d.group);});

		node.append("image")
		  .attr("xlink:href", "https://github.com/favicon.ico")
		  .attr("x", -8)
		  .attr("y", -8)
		  .attr("width", 16)
		  .attr("height", 16);
		node.append("text")
		  .attr("dx", 12)
		  .attr("dy", ".35em")
		  .text(function(d) { return d.name });

		force.on("tick", function() {
		link.attr("x1", function(d) { return d.source.x; })
		    .attr("y1", function(d) { return d.source.y; })
		    .attr("x2", function(d) { return d.target.x; })
		    .attr("y2", function(d) { return d.target.y; });

		node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
		});
	});
}