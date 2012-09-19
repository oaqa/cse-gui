$(document).ready(function() {
  loadAnalysis();
});

function loadAnalysis() {
  $("#analysis-header").empty();
  var id = $.urlParam('id');
  var stage = $.urlParam('stage');
  var hash = $.urlParam('traceHash');
  var query = "/cse-gui/data/table/error-analysis/" + id + "/" + stage + "/" + hash;
  $.ajax(query).done(function(json) {
    var rows = json.rows;
    mapList(new DecimalFormat(["av_map", "psgmap"]), rows);
    var data = templates.errAnalysis.render(json);
    $("#analysis-header").append(data);
  });
}

function loadChart(parent) {
  var id = $.urlParam('id');
  var query = "/cse-gui/data/table/topics-progress/" + id;
  d3.json(query, function(json) {
    doGraph(json, parent);
  });
}

function doGraph(json, parent) {
  var color = d3.interpolateRgb("#aad", "#556");
  var source = json.rows;
  var success_data = [];
  var failure_data = [];
  source.forEach(function(d, i) {
    var total = parent.total;
    var sratio = (d.success / total) * 100;
    var fratio = (d.failures / total) * 100 ;
    var seq = d.sequenceid;
    var label = d.question;
    success_data[i] = stream_index(sratio, i, seq, label);
    failure_data[i] = stream_index(fratio, i, seq, label);
  });
  data = d3.layout.stack()([ success_data, failure_data ]);
  var margin = 25, 
    xmargin = 35, 
    width = 760 - xmargin, 
    height = 300 - .5 - margin, 
    voffset = 10, 
    mx = source.length,
  // my = d3.max(data, function(d) {
  // return d3.max(d, function(d) {
  // return d.y0 + d.y;
  // });
  // }),
  my = 100,
  mz = d3.max(data, function(d) {
    return d3.max(d, function(d) {
      return d.y;
    });
  }), 
  x = function(d) {return (d.i * width / mx);}, 
  y0 = function(d) {return (height - d.y0 * height / my) + voffset;},
  y1 = function(d) {return (height - (d.y + d.y0) * height / my) + voffset;};
  var y = d3.scale.linear().range([ height, 0 ]);
  var svg = d3.select("#progress-chart")
    .append("svg")
    .attr("width", width + xmargin)
    .attr("height", height + margin + voffset);
  var layers = svg.selectAll("g.layer").data(data).enter().append("g").style(
      "fill", function(d, i) {
        return color(i / (2 - 1));
      }).attr("class", "layer");
  var bars = layers.selectAll("g.bar")
    .data(function(d) { return d; })
    .enter()
    .append("g")
    .attr("class", "bar")
    .attr("transform", function(d) {
      return "translate(" + (x(d) + xmargin) + ",0)";
    });
  bars
    .append("rect")
      .attr("width", x({ i : .9}))
      .attr("x", 0)
      .attr("y", height + voffset)
      .attr("height", 0)
      .transition()
      .delay(function(d, i) { return i * 10; })
      .attr("y", y1)
      .attr("height", function(d) {
        return (y0(d) - y1(d));
      });
  bars.append("title").text(function(d) {
    return d.lbl;
  });
  var labels = svg.selectAll("text.glabel").data(data[0]).enter()
      .append("text").attr("class", "glabel").attr("dy", ".85em").attr(
          "text-anchor", "middle").attr(
          "transform",
          function(d) {
            return "translate(" + (x(d) + xmargin) + ", "
                + (height + 13 + voffset) + ") rotate(270)";
          }).text(function(d) {
        return d.x;
      });
  svg.append("line").attr("x1", xmargin).attr("x2", width - x({
    i : .1
  }) + xmargin).attr("y1", height + voffset).attr("y2", height + voffset);
  var yaxis = svg.append("g").selectAll(".rule").data(y.ticks(10)).enter()
      .append("g").attr("class", "rule").attr("transform", function(d) {
        return "translate(0," + (y(d) + voffset) + ")";
      });
  yaxis.append("line").attr("x2", width);
  yaxis.append("text").attr("x", 6).attr("dy", ".35em").text(function(d) {
    return d * 100 + "%";
  });
}

function getExpectedCount(json) {
  var rows = json.rows;
  var total = 0;
  var prod = 1;
  for ( var i = 0; i < rows.length; i++) {
    var size = rows[i].size;
    prod *= size;
    total += prod;
  }
  return [total, prod];
}

function stream_index(d, i, seqid, label) {
  return {
    x : seqid,
    y : Math.max(0, d),
    i : i,
    lbl : label
  };
}
