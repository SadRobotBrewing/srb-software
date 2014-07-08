define([
  'primus'
], function(primus) {
  var connection = primus.connect();

  connection.on("open", function() {
    console.log("Connected to server!");
  });

  return {
    send: function(event, data, callback) {
      connection.writeAndWait({ event: event, data: data }, function(response) {
        console.log("Received data", response);
        callback(response.error, response.data);
      });
    }
  };
});
