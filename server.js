var Primus = require('primus');
var PrimusResponder = require('primus-responder');
var http = require('http');
var express = require('express');
var fs = require('fs');
var Phidget = require("./phidget");

var app = express();
var server = http.createServer(app);
var primus = new Primus(server);
var port = process.env.PORT || 3000;
var phidget = new Phidget();


app.use(express.static(__dirname + '/client'));
primus.use('responder', PrimusResponder);

server.listen(port, function() {
  console.log("Now listening on " + port);
});

phidget.connect(function(error) {
  if (error) {
    console.error("Could not connect to phidget board, error: " + error);
    process.exit(255);
  }
  
  console.log('Connected to phidget board!');
});

var programs = JSON.parse(fs.readFileSync('programs.json'));

primus.on('connection', function(spark) {
  console.log("Client connected!");

  spark.on('request', function(data, done) {
    console.log("Got request", JSON.stringify(data));

    if (data.event === "addProgram") {
      var program = {};

      program.id = programs.length + "";
      program.name = data.data;
      program.description = "";
      program.valves = [ ];

      programs.push(program);

      fs.writeFile('programs.json', JSON.stringify(programs, null, 2), function(error, data) {
        if (error) {
          console.log(error);
          done({ error: error });
          return;
        }

        done({ data: program });
      });
    } else if (data.event === "saveProgram") {
      var found = false;

      for (var n = 0; n < programs.length; n++) {
        if (programs[n].id === data.data.id) {
          programs[n] = data.data;
          found = true;
          break;
        }
      }

      if (!found) {
        done({ error: "No program found with id " + data.data.id });
      } else {
       fs.writeFile('programs.json', JSON.stringify(programs, null, 2), function(error) {
          if (error) {
            console.log(error);
            done({ error: error });
            return;
          }

          done({ data: data.data });
        });
      }
    } else if (data.event === "loadPrograms") {
      done({ data: programs });
    } else if (data.event === "setValves") {
      console.log(data);
      phidget.setValves(data.data);
      done({ });
    } else {
      done(data);
    }
  });
});
