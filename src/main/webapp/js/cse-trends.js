var BASE_QUERY = "data/table/"
var FMETRIC_BASE_QUERY = BASE_QUERY + "f1-metrics";

function generateGraph(author, dataset) {
	async.waterfall([ function(callback) {
		ajaxQuery(FMETRIC_BASE_QUERY, author, dataset, callback);
	}, function(result, author, dataset, callback) {
		var urls = generateURLs(result, dataset, author);
		callback(null, result, urls);
	}, function(result, urls, callback) {
		var series = generateSeries(result);
		callback(null, result, urls, series);
	}, function(result, urls, series, callback) {
		var funcs = getDataProcessors(result);
		callback(null, result, urls, series, funcs);
	} ], function(err, result, urls, series, funcs) {
		graph = initGraph(urls, funcs, series);
		// initRawGraph({"x": 0 , "y":0});
	});

}

function getData(json) {
	var weekData = new Array();
	var rawData = new Array();
	var rows = json;
	// in milliseconds
	var week = 60 * 60 * 24 * 7 * 1000;
	var start = 1;
	var sum = 0;
	var offset = 0;
	var j = 0;
	for ( var i = 1; i < rows.length; i++) {
		if (rows[i].y == 0) {
			offset++;
			continue;
		}

		if ((rows[i].x - rows[start].x) >= week || (i == rows.length - 1)) {
			weekData[j] = {
				"data" : rawData,
				"x" : Math.floor(rows[start].x / 1000),
				"y" : sum / (i - offset - start)
			};
			start = i;
			j++;
			sum = 0;
			rawData = new Array();
		}
		rawData[i] = {
			"x" : rows[i].x,
			"y" : rows[i].y
		};
		sum += rows[i].y;

	}

	/*
	 * for ( var i = 0; i < 5; i++) { map(new DateFormat([ "date" ]),
	 * weekData[i].x); }
	 */
	return weekData;
}

function generateURLs(data, dataset, author) {
	var urls = new Array();
	data.rows.forEach(function(m) {
		urls.push(BASE_QUERY + m.COLUMN_NAME + "-measure-time/" + author + "/"
				+ dataset);
	});
	return urls;
}

function getDataProcessors(data) {
	var f = new Array();
	data.rows.forEach(function(m) {
		var fn = function(datarow) {

			var d = {
				"name" : m.COLUMN_NAME,
				"data" : getData(datarow.rows)
			};
			return d;
		}
		f.push(fn);
	});
	return f;
}

function generateSeries(data) {
	var palette = new Rickshaw.Color.Palette({
		scheme : 'colorwheel'
	});
	var series = new Array();
	data.rows.forEach(function(m) {
		series.push({
			"color" : palette.color(),
			"name" : m.COLUMN_NAME
		});
	});
	return series;
}

function ajaxQuery(query, author, dataset, callback) {
	$.ajax({
		url : query,
		complete : function(response, status) {
			var result = JSON.parse(response.responseText);
			callback(null, result, author, dataset);
		}
	});
}

function displayAxes(graph) {
	var ticksTreatment = 'glow';
	var xAxis = new Rickshaw.Graph.Axis.Time({
		graph : graph,
		tickFormat : Rickshaw.Fixtures.Number.formatKMBT,
		ticksTreatment : ticksTreatment
	});

	xAxis.render();
	var yAxis = new Rickshaw.Graph.Axis.Y({
		graph : graph,
		tickFormat : Rickshaw.Fixtures.Number.formatKMBT,
		ticksTreatment : ticksTreatment
	});

	yAxis.render();
}

function initRawGraph(data) {
	var graph = new Rickshaw.Graph({
		element : document.querySelector("#subchart"),
		width : 900,
		height : 400,
		series : [ {
			color : 'steelblue',
			data : data
		} ]
	});

	graph.render();
}

function initGraph(urls, data, series) {
	console.log(JSON.stringify(urls));
	console.log(data);
	console.log(JSON.stringify(series));

	new Rickshaw.Graph.AjaxList({

		element : document.getElementById("chart"),

		dataURLArray : urls,

		onData : data,

		onComplete : function(transport) {
			var graph = transport.graph;
			displayAxes(graph);
			var detail = new Rickshaw.Graph.HoverDetail({
				graph : graph
			});
			graph.render();
			/*
			 * var slider = new Rickshaw.Graph.RangeSlider({ graph : graph,
			 * element : document.getElementById('slider') });
			 */
			var hoverDetail = new Rickshaw.Graph.HoverDetail({
				graph : graph
			});

			var annotator = new Rickshaw.Graph.Annotate({
				graph : graph,
				element : document.getElementById('timeline')
			});

			var legend = new Rickshaw.Graph.Legend({
				graph : graph,
				element : document.getElementById('legend')

			});
			var shelving = new Rickshaw.Graph.Behavior.Series.Toggle({
				graph : graph,
				legend : legend
			});

			var order = new Rickshaw.Graph.Behavior.Series.Order({
				graph : graph,
				legend : legend
			});

			var highlighter = new Rickshaw.Graph.Behavior.Series.Highlight({
				graph : graph,
				legend : legend
			});

			var smoother = new Rickshaw.Graph.Smoother({
				graph : graph,
				element : document.getElementById('slider')
			});
			var controls = new RenderControls({
				element : document.querySelector('form'),
				graph : graph
			});

		},

		height : 450,
		width : 900,
		renderer : 'line',
		stroke : true,

		series : series
	});
}
