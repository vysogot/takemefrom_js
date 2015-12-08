function placeUpdate(placeId, content, isDestroyable) {
  removeLink = "";
  if (!isDestroyable) {
    removeLink = '<a id="remove" href="/places/'+placeId+'/destroy" onclick="return confirm(\'Are you sure?\')">Remove</a>'
  }

  $('#theBox').html(
    '<a href="javascript:setConnection(\''+placeId+'\');">Connect</a> ' +
     removeLink + '<form>' +
    '<br/><textarea name="content" id="content">' + content + '</textarea><br />' +
    '<input type="button" value="Submit" id="submit" /> ' +
    '<a href="/places/'+placeId+'">Play</a></form>'
  );

  $('#submit').attr('disabled', 'disabled');
  $('#content').on('input', function() {
    $('#submit').removeAttr('disabled');
  });

  $("#submit").click(function() {
    content = $('#content').val();
    $.ajax({
      type: "POST",
      url: '/places/' + placeId + '/update',
      data: { content: content }
    }).done(function(response) {

      newContent = response.updatedNodeContent;
      nodeToUpdate = nodes.filter(function(element, index) {
        return (element.data.id === placeId)
      })[0];

      nodeToUpdate.data.content = newContent;
      $('#theBox').animate({ opacity: 0 }, 500, function() {
        $('#theBox').animate({ opacity: 1 }, 500);
        placeUpdate(placeId, newContent, isDestroyable);
      });
    });
  });
}

function actionUpdate(actionId, content) {
  $('#theBox').html(
    '<a id="remove" href="/actions/'+actionId+'/destroy" onclick="return confirm(\'Are you sure?\')">Remove</a>' +
    '<form action="/actions/'+actionId+'/update" method="post">' +
      '<br/><textarea name="content">' + content + '</textarea><br />' +
      '<input type="submit" value="Submit" /> ' +
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
