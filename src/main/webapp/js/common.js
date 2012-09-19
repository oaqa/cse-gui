var z = 10;

var df = d3.format("0,.1f");
var nf = d3.format("0,.5f");

var stf = d3.time.format.utc("%H:%M:%S");
var sdf = d3.time.format.utc("%b %d");
var tf = d3.time.format.utc("%m-%d-%Y %H:%M:%S");
var dtf = d3.time.format.utc("%Y-%m-%d");

var labels;

function map(fn, object) {
  for ( var key in object) {
    object[key] = fn.fn(key, object[key]);
  }
}

function mapList(fn, rows) {
  for (var i = 0; i < rows.length; i++) {
    map(fn, rows[i]);
  }
}

function DateFormat(set) {
  this.set = set;
  this.fn = function fn(key, value) {
    if ($.inArray(key, set) > -1) {
      return tf(new Date(value));
    } else {
      return value;
    }
  }
}

function DecimalFormat(set) {
  this.set = set;
  this.fn = function fn(key, value) {
    if ($.inArray(key, set) > -1) {
      return nf(value);
    } else {
      return value;
    }
  }
}

$.urlParam = function(name) {
  var results = new RegExp('[\\?&]' + name + '=([^&#]*)')
      .exec(window.location.href);
  return results[1] || 0;
}

function fmtDuration(duration) {
  var hours = Math.floor(duration / (60 * 60));
  var mins = Math.floor((duration - (hours * (60 * 60))) / 60);
  var secs = Math.floor(duration - (hours * (60 * 60)) - (mins * 60));
  return hours + "h " + mins + "m " + secs + "s";
}

function loadScale(label, color, min, max) {
  labels.append("div").text(label);
  var range = d3.range(0, 9);
  var values = d3.scale.linear().domain([ 0, 9 ]).range([ min, max ]);
  var vis = labels.append("svg:svg").attr("height", 10).append("svg:g");
  var minLabel = roundc(min);
  start = addLabel(vis, minLabel, 0);
  chars = minLabel.length;
  offset = (chars * z);
  vis.selectAll("rect.label").data(range).enter().append("svg:rect").attr("x",
      function(d) {
        return (d * z) + offset;
      }).attr("class", "day").attr("width", z).attr("height", z).style(
      "stroke", "#fff").style("fill", function(d) {
    return color(values(d));
  });
  offset = offset + 100;
  addLabel(vis, roundc(max), offset);
}

function addLabel(vis, val, pos) {
  return vis.append("svg:text").attr("class", "label").text(val).attr("x", pos)
      .attr("y", z - 1).style("fill", "#000");
}

function roundc(val) {
  return (val < 100) ? nf(val) : df(val);
}
