$(document).ready(function() {
	var authorsQuery = "/cse-gui/data/table/authors"
	async.waterfall([ function(callback) {
		var first_author;
		$.ajax(authorsQuery).done(function(json) {
			var authors = json.rows;
			var tab_data = templates.authorTab.render(json);
			$('#tab-container').append(tab_data);
			callback(null, authors,first_author);
		});
	}, function(authors,first_author, callback) {
		var first = true;
		authors.forEach(function(a) {
			var author = a.author;
			var dataset_query = "/cse-gui/data/table/datasets/" + author;
			if(first){
			$.ajax(dataset_query).done(function(json) {		
				var data = templates.datasetTab.render(json);
				$("#" + author + "-menu").append(data);	
				var first_author = author;
				var first_dataset = json.rows[0].dataset;
				drawGraph(first_author,first_dataset);
			});
			first=false;}
			else {
				$.ajax(dataset_query).done(function(json) {
					var data = templates.datasetTab.render(json);
					$("#" + author + "-menu").append(data);
				});
			}
		});
		callback(null);
	} ], function(err) {
		$('.tabs').live("click", function(e) {
			e.preventDefault();
			console.log("clicked!");
			$("#chart-container").empty();
			var parts = decodeURI(e.target).split('#');
			window.location.hash = '\#' + parts;
			var author = parts[1];
			var dataset = parts[2];
			drawGraph(author,dataset);
		});
	});
});

function drawGraph(author,dataset){
data = templates.authorTrend.render({
	"author" : author
});
$('#chart-container').append(data);
generateGraph(author,dataset);
}