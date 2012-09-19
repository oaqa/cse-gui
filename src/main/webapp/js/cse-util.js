callbackFunctor = function(g, params) {
	if (params.length == 1)
		return combinator(params[0], null);
	var f1 = params[0];
	var rest = params.slice(1, params.length);
	return combinator(f1, callbackFunctor(g, rest));
}

function combinator(f1, f2, g) {
	if (f2 == null)
		return schonfinkelize(f1, null);
	return schonfinkelize(f1, f2);
}



reqfunc2 = function request2(query, p,callback, g) {
	var req = $.ajax({
		url : query,
		complete : function(response, status) {
			if (callback != null)
				callback(schonfinkelize(g, p()));
			else
				g(p());
		}
	});
}



getAJAXQuery2 = function(query, p) {
	var request = reqfunc;
	return schonfinkelize(request, query, p);
}

getAJAXQuery = function(query, p) {
	var request = reqfunc;
	return schonfinkelize(request, query, p);
}

function schonfinkelize(fn) {
	var slice = Array.prototype.slice, stored_args = slice.call(arguments, 1);
	return function() {
		var new_args = slice.call(arguments), args = stored_args
				.concat(new_args);
		return fn.apply(null, args);
	};
}


reqfunc = function request(query, p, callback,g) {
	var req = $
			.ajax({
				url : query,
				complete : function(response, status) {
					if (callback != null)
						callback(schonfinkelize(g, p(JSON
								.parse(response.responseText))));
					else
						g(p(JSON.parse(response.responseText)));
				}
			});
}

AJAXsequence2 = function(g, params) {
	var requests = new Array();
	params.forEach(function(p) {
		var query = p.query;
		var dataProcessor = p.processor;
		requests.push(getAJAXQuery2(query, dataProcessor));
	});
	requests[0] = schonfinkelize(requests[0],null);
	for ( var i = 0; i < requests.length; i++) {
		var r = requests[i];
		if (i < requests.length - 1){
			var rnext = requests[i+1];
			requests[i+1] = schonfinkelize(rnext, r);
		}
		else r(g);
	}
}

AJAXsequence = function(g, params) {
	var requests = new Array();
	params.forEach(function(p) {
		var query = p.query;
		var dataProcessor = p.processor;
		requests.push(getAJAXQuery(query, dataProcessor));
	});
	requests[0] = schonfinkelize(requests[0], g);
	callbackFunctor(g, requests)();
}