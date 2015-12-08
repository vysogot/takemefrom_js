function placeUpdate(placeId, content, isDestroyable) {
  removeLink = "";
  if (!isDestroyable) {
    removeLink = '<a id="remove" href="/places/'+placeId+'/destroy">Remove</a><br />'
  }

  $('#theBox').html(
    '<a href="javascript:setConnection(\''+placeId+'\');">Connect</a><br />' +
     removeLink +
    '<form action="/places/'+placeId+'/update" method="post">' +
      '<textarea name="content">' + content + '</textarea><br />' +
      '<input type="submit" value="Submit" />' +
    '</form>'
  );
}

function actionUpdate(actionId, content) {
  $('#theBox').html(
    '<a id="remove" href="/actions/'+actionId+'/destroy">Remove</a><br />' +
    '<form action="/actions/'+actionId+'/update" method="post">' +
      '<textarea name="content">' + content + '</textarea><br />' +
      '<input type="submit" value="Submit" />' +
    '</form>'
  );
}

function addNewPlace(fromPlaceId) {
  $.ajax({
    url: "/places/create/" + fromPlaceId
  }).done(function(response) {
    nodes.push({ data: response.newNode });
    edges.push({ data: response.newEdge })
    makeGraph();
  });
}

function addNewEdge(fromPlaceId, toPlaceId) {
  $.ajax({
    url: "/actions/create/" + fromPlaceId + '/' + toPlaceId
  }).done(function(response) {
    edges.push({ data: response.newEdge })
    makeGraph();
  });
}
