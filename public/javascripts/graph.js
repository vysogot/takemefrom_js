function placeUpdate(gameId, placeId, content) {
  $('#theBox').html(
    '<form action="/places/update" method="post">' +
      '<input type="hidden" name="gameId" value="' + gameId + '"/>' +
      '<input type="hidden" name="_id" value="' + placeId + '"/>' +
      '<textarea name="content">' + content + '</textarea><br />' +
      '<input type="submit" value="Submit" />' +
    '</form>'
  );
}

function actionUpdate(gameId, placeId, actionId, content) {
  $('#theBox').html(
    '<form action="/places/update" method="post">' +
      '<input type="hidden" name="gameId" value="' + gameId + '"/>' +
      '<input type="hidden" name="_id" value="' + placeId + '"/>' +
      '<input type="hidden" name="actionId" value="' + actionId + '"/>' +
      '<textarea name="actionBody">' + content + '</textarea><br />' +
      '<input type="submit" value="Submit" />' +
    '</form>'
  );
}

function addNewPlace(gameId, fromPlaceId) {
  $.ajax({
    url: "/places/create/" + gameId + '/' + fromPlaceId
  }).done(function(response) {
    nodes.push({ data: response.newNode });
    edges.push({ data: response.newEdge })
    makeGraph();
  });
}
