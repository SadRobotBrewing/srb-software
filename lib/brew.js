
var EventEmitter = require("events").EventEmitter;
var util = require("util");
var path = require('path');
var moment = require("moment");
var fs = require("q-io/fs");
var Q = require("q");

function insertParameters(object, parameters) {
    object.forEach(function(item) {
        for (var key in item) {
            if (typeof item[key] === "string") {
                parameters.forEach(function(parameter) {
                    item[key] = item[key].replace("%" + parameter.name, parameter.value);
                });
            }
        }
    });
}

function Brew() {
    EventEmitter.call(this);

    this.brew = false;
    this.brewId = false;
    this.io = null;

    this.emitBrew = function() {
        this.emit("brew", this.brew);
    };

    this.get = function() {
        var deferred = Q.defer();
        deferred.resolve(this.brew);
        return deferred.promise;
    };

    this.setup = function(io) {
        var deferred = Q.defer();

        this.io = io;

        this.io.on("status", function() {
            this.checkCriteria();
        }.bind(this));

        fs.read(path.join("./brews", "ongoing"))
        .then(function(brewId) {
            return fs.read(path.join("./brews", brewId.toString(), "brew.json"));
        })
        .then(JSON.parse)
        .then(function(brew) {
            this.brewId = brew.id;
            this.brew = brew;

            deferred.resolve();
            this.execute();
        }.bind(this))
        .catch(function(error) {
            console.log("No ongoing brew could be read, error:" + error);
            deferred.resolve();
        });

        return deferred.promise;
    };

    this.save = function() {
        this.emitBrew();
        return fs.write(path.join("./brews", this.brew.id, "brew.json"), JSON.stringify(this.brew, null, 2));
    };

    this.start = function(name, description, programName, parameters) {
        var brewDir = "";
        var brew = {};

        return fs.read(path.join("./programs", programName + ".json"))
        .then(JSON.parse)
        .then(function(program) {
            program.steps.forEach(function(step) {
                insertParameters(step.actions, parameters);
                insertParameters(step.criteria, parameters);
            });

            brew = {
                id: moment().format() + "_" + name.replace(/ /g, "_"),
                created: moment().format(),
                name: name,
                description: description,
                programName: programName,
                parameters: parameters,
                steps: program.steps,
                step: 0
            };
            brewDir = path.join("./brews", brew.id);

            return fs.makeDirectory(brewDir);
        })
        .then(function() {
            return fs.write(path.join(brewDir, "brew.json"), JSON.stringify(brew, null, 2));
        })
        .then(function() {
            return fs.write(path.join("./brews", "ongoing"), brew.id);
        })
        .then(function() {
            return this.io.setPins([]);
        }.bind(this))
        .then(function() {
            this.brewId = brew.id;
            this.brew = brew;

            console.log("New brew started with id " + this.brewId);

            this.emitBrew();
            this.execute();
        }.bind(this));
    };

    this.execute = function() {
        var step = this.brew.steps[this.brew.step];

        if (!step) {
            console.log("Brew finished...");
            this.brewId = false;
            this.brew = false;
            fs.remove(path.join("./brews", "ongoing"));
            this.emitBrew();
            return;
        }

        var promises = [];
        var outputs = [];

        for (var n = 0; n < step.actions.length; n++) {
            if (step.actions[n].type === "SetPins") {
                outputs = step.actions[n].outputs;
            } else if (step.actions[n].type === "SetTemperature") {
                //this.io.setTemperature(step.actions[n].inpu
            } else if (step.actions[n].type === "SetTimer") {
                this.io.setTimer(step.actions[n].timer, step.actions[n].timeout);
            }
        }

        promises.push(this.io.setPins(outputs));

        Q.allSettled(promises)
        .catch(function(error) {
            console.error("Failed to execute, error: " + error);
            console.error(error.stack);
        });
    };

    this.checkCriteria = function() {
        if (!this.brew) {
            return;
        }

        //console.log("Checking step criteria");

        var step = this.brew.steps[this.brew.step];
        var pass = true;
        var changed = false;

        this.io.getStatus().then(function(status) {
            for (var n = 0; n < step.criteria.length; n++) {
                var fullfilled = step.criteria[n].fullfilled;

                if (step.criteria[n].type === "AwaitTemperature") {
                    step.criteria[n].fullfilled = status.temperatures[step.criteria[n].input] >= step.criteria[n].temperature;
                } else if (step.criteria[n].type === "AwaitTimer") {
                    step.criteria[n].fullfilled = this.io.hasTimerExpired(step.criteria[n].timer);
                }

                pass = pass && step.criteria[n].fullfilled;
                changed = changed || fullfilled !== step.criteria[n].fullfilled;
            }

            if (pass) {
                this.brew.step++;
                this.save();
                this.execute();
            } else if (changed) {
                this.save();
            }
        }.bind(this));
    };

    this.userOkay = function(criteriaIndex) {
        var step = this.brew.steps[this.brew.step];
        var deferred = Q.defer();

        if (step.criteria[criteriaIndex] && step.criteria[criteriaIndex].type === "AwaitUser") {
            step.criteria[criteriaIndex].fullfilled = true;
            this.save();
            this.checkCriteria();
        }

        return deferred.promise;
    };
}

util.inherits(Brew, EventEmitter);

module.exports = new Brew();
