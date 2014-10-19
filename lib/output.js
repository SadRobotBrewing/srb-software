
var EventEmitter = require("events").EventEmitter;
var util = require("util");
var phidget = require('phidget-interfacekit');
var Q = require("q");

function Output() {
    EventEmitter.call(this);

    this.phid = null;
    this.outputCount = 0;

    this.setup = function(config) {
        var deferred = Q.defer();

        console.log("Setting up output");

        phidget.on("attach", function(phid) {
            console.log("Phidget[" + phid + "] interfacekit attached");
            this.outputCount = phidget.getOutputCount(this.phid);

            deferred.resolve();
        }.bind(this));

        phidget.on("detach", function(phid) {
            console.log("Phidget[" + phid + "] detached");
        }.bind(this));

        phidget.on("error", function(phid, errorString) {
            console.error("Phidget[" + phid + "] error:", errorString);

            deferred.reject(errorString);
        }.bind(this));

        phidget.on("outputChange", function(phid, index, state) {
            this.emit("pin", index, !!state);
        }.bind(this));

        try {
            this.phid = phidget.create();

            phidget.open(this.phid, parseInt(config.serial, 10));
        } catch (e) {
            deferred.reject(e);
        }

        return deferred.promise;
    };

    this.getPin = function(index) {
        var deferred = Q.defer();

        try {
            deferred.resolve(!!phidget.getOutputState(this.phid, index));
        } catch (e) {
            deferred.reject(e);
        }

        return deferred.promise;
    };

    this.setPin = function(index) {
        return this.getPin(index)
        .then(function(current) {
            if (current !== true) {
                phidget.setOutputState(this.phid, index, 1);
            }
        }.bind(this));
    };

    this.unsetPin = function(index) {
        return this.getPin(index)
        .then(function(current) {
            if (current !== false) {
                phidget.setOutputState(this.phid, index, 0);
            }
        }.bind(this));
    };

    this.setPins = function(indices) {
        var promises = [];

        for (var index = 0; index < this.outputCount; index++) {
            if (indices.indexOf(index) === -1) {
                promises.push(this.unsetPin(index, true));
            } else {
                promises.push(this.setPin(index, true));
            }
        }

        return Q.allSettled(promises);
    };
}

util.inherits(Output, EventEmitter);

module.exports = Output;
