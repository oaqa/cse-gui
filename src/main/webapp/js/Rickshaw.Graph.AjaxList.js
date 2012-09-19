
//Rickshaw.namespace('Graph.AjaxList');

Rickshaw.Graph.AjaxList = function(args) {
	console.log(JSON.stringify(args.dataURLArray))
	var self = this;
	this.dataURLArray = args.dataURLArray;
	var callbackfns = new Array();
	var data = new Array();
	
	for(var i=0;i<this.dataURLArray.length;i++){
	callbackfns.push(schonfinkelize(function(dataURLArray,args,callback){
		//console.log(JSON.stringify(dataURLArray));
		$.ajax( {
		url:  dataURLArray,
		complete: function(response, status) {

			if (status === 'error') {
				console.log("error loading dataURL: " + this.dataURL);
			}

			var tdata = JSON.parse(response.responseText);	

			if (typeof args === 'function') {
				var processedData = args(tdata);
		//		console.log("processor: " + args);
	//			console.log("DATA::" + JSON.stringify( processedData));
				callback(null,processedData);
			}
			}});
},this.dataURLArray[i],args.onData[i]));}	
	
	async.series(callbackfns, function(err,results){
			var graph = finish(args,results);

	});




finish = function(args,data){
	console.log(JSON.stringify(data));
	if (args.series) {

		args.series.forEach(function(s) {

			var seriesKey = s.key || s.name;
			if (!seriesKey)
				throw "series needs a key or a name";

			data.forEach(function(d) {

				var dataKey = d.key || d.name;
				if (!dataKey)
					throw "data needs a key or a name";

				if (seriesKey == dataKey) {
					var properties = [ 'color', 'name', 'data' ];
					properties.forEach(function(p) {
						s[p] = s[p] || d[p];
					});
				}
		});
		});
	} else {
		args.series = data;
	}

	self.graph = new Rickshaw.Graph(args);
	self.graph.render();

	if (typeof args.onComplete == 'function') {
		args.onComplete(self);
	}
	return self.graph;

}
};
