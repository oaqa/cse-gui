$(document).ready(function() {
  initForm();
});

function initForm(params) {
  $("#search-form").submit(function() {
    doSearch();
    return false;
  });

  $("#search-btn").click(function() {
    var btn = $(this);
    btn.button("loading");
  });
  $("#search-field").keyup(function() {
    $("#search-field-control").removeClass("error");
    $("#search-error-help").hide();
  });
  
}

function doSearch() {
  var query = $("#search-field").val();
  if (query.length == 0) {
    $("#search-field-control").addClass("error");
    $("#search-error-help").show();
    $("#search-btn").button("reset");
    return;
  }
  $("#search-results").empty();
  var query = "http://peace.isri.cs.cmu.edu:9080/cse-server/data/search/" + encodeURIComponent(query);
  $.ajax(query, {
    timeout:120000
  }).done(function(json) {
    var rows = json.rows;
    mapList(new DecimalFormat(["score"]), rows);
    var data = templates.searchResults.render(json);
    $("#search-results").append(data);
    $("#search-btn").button("reset");
    highlight();
  }).fail(function(jqXHR, textStatus) {
    alert("Request failed: " + textStatus);
    $("#search-btn").button("reset");
  });
}
