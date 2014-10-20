
var http = require('http');
var express = require('express');
var fs = require('q-io/fs');
var path = require('path');
var moment = require("moment");

var io = require("./lib/io");
var brew = require("./lib/brew");
var webio = require("./lib/webio");

var app = express();
var server = http.createServer(app);

var port = process.env.PORT || 3000;

io.setup({})
.then(function() {
    return brew.setup(io);
})
.then(function() {
    return webio.setup(server);
})
.then(function() {
    app.use(express.static(__dirname + '/public'));

    io.on("status", function(status) {
        webio.emit("status", status);
    });

    brew.on("brew", function(brew) {
        webio.emit("brew", brew);
    });

    webio.register("getProgramNames", function() {
        return fs.list("./programs")
        .then(function(files) {
            return files.map(function(file) { return path.basename(file, ".json"); });
        });
    });

    webio.register('getProgramParameters', function(programName) {
        return fs.read(path.join("./programs", programName + ".json"))
        .then(JSON.parse)
        .then(function(program) {
            return program.parameters;
        });
    });

    webio.register('getBrew', function() {
        return brew.get();
    });

    webio.register('getStatus', function() {
        return io.getStatus();
    });

    webio.register('startBrew', function(options) {
        return brew.start(options.name, options.description, options.programName, options.parameters);
    });

    webio.register('userOkay', function(criteriaIndex) {
        return brew.userOkay(criteriaIndex);
    });

    server.listen(port, function() {
        console.log("Now listening on " + port);
    });
})
.catch(function(error) {
    console.error(error);
    process.exit(255);
});

/*
var Phidget = require("./phidget");
var phidget = new Phidget();*/

    // phidget.connect(function(error) {
    //     if (error) {
    //         console.error("Could not connect to phidget board, error: " + error);
    //         process.exit(255);
    //     }
// });


/*
var categories = JSON.parse(fs.readFileSync('categories.json'));
var programs = JSON.parse(fs.readFileSync('programs.json'));

// TODO: Remove this when list is tri-state
programs = programs.map(function(element) {
  element.valves = element.valves.map(function(element) {
    if (typeof element === "object") {
      return element;
    } else {
      return { id: element, state: "on" };
    }
  });

  return element;
});

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
    } else if (data.event === "loadCategories") {
      done({ data: categories });
    } else if (data.event === "setValves") {
      console.log(data);
      phidget.setValves(data.data);
      setTimeout(function() {
        done({ });
      }, 100);
    } else if (data.event === "getValves") {
      done({ data: phidget.getValves() });
    } else {
      done(data);
    }
  });
});*/
