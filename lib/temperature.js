
var EventEmitter = require("events").EventEmitter;
var util = require("util");
var phidget = require('phidget-bridge');
var Q = require("q");

function Temperature() {
    EventEmitter.call(this);

    this.phid = null;

    this.setup = function(config) {
        var deferred = Q.defer();

        console.log("Setting up temperature");

        phidget.on("attach", function(phid) {
            console.log("Phidget[" + phid + "] bridge attached");

            phidget.setDataRate(this.phid, 1000);

            deferred.resolve();
        }.bind(this));

        phidget.on("detach", function(phid) {
            console.log("Phidget[" + phid + "] detached");
        }.bind(this));

        phidget.on("error", function(phid, errorString) {
            console.error("Phidget[" + phid + "] error:", errorString);

            deferred.reject(errorString);
        }.bind(this));

        phidget.on("data", function(phid, index, value) {
            console.log("temperature", index, value); // TODO: Calculate Temperature
            this.emit("temperature", 0, 100); // TODO: Calculate Temperature
            this.emit("temperature", 1, 101); // TODO: Calculate Temperature
            this.emit("temperature", 2, 102); // TODO: Calculate Temperature
        }.bind(this));

        try {
            this.phid = phidget.create();

            phidget.open(this.phid, parseInt(config.serial, 10));
        } catch (e) {
            deferred.reject(e);
        }

        return deferred.promise;
    };

    this.getValue = function(index) {
        var deferred = Q.defer();

        try {
            deferred.resolve(phidget.getBridgeValue(this.phid, index)); // TODO: Calculate Temperature
        } catch (e) {
            deferred.reject(e);
        }

        return deferred.promise;
    };

    this.enable = function(index) {
        var deferred = Q.defer();

        try {
            phidget.setGain(this.phid, index, 1);
            phidget.setEnabled(this.phid, index, 1);
            deferred.resolve();
        } catch (e) {
            deferred.reject(e);
        }

        return deferred.promise;
    };
}

util.inherits(Temperature, EventEmitter);

module.exports = Temperature;
