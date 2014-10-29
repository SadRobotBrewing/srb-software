
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
