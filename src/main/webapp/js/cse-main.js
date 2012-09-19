$(function() {
  loadTable();
});

function loadTable(params) {
 // $("#experiment-tbody").empty();
  var query = "/cse-gui/data/table/experiments";
  $.ajax(query).done(function(json) {
    var rows = json.rows;
    for (var i = 0; i < rows.length; i++) {
      map(new DateFormat([ "date" ]), rows[i]);
    }
    
    var data = templates.table.render(json);

    $("#experiment-tbody").append(data);
    
  });
}
