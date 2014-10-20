
var EventEmitter = require("events").EventEmitter;
var util = require("util");
var phidget = require('phidget-bridge');
var Q = require("q");

function Temperature() {
    EventEmitter.call(this);

    this.phid = null;
    this.calibration = {};

    this.setup = function(config) {
        var deferred = Q.defer();

        console.log("Setting up temperature");

        phidget.on("attach", function(phid) {
            console.log("Phidget[" + phid + "] bridge attached");

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
            if (this.calibration[index]) {
                value = Math.round(100 * (this.calibration[index].a * value + this.calibration[index].b)) / 100;
                this.emit("temperature", 0, value); // TODO: Calculate Temperature
                this.emit("temperature", 1, value); // TODO: Calculate Temperature
                this.emit("temperature", 2, value);
            }
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
            var value = 0;

            if (this.calibration[index]) {
                value = phidget.getBridgeValue(this.phid, index);
                value = Math.round(100 * (this.calibration[index].a * value + this.calibration[index].b)) / 100;
            }

            deferred.resolve(value);
        } catch (e) {
            deferred.reject(e);
        }

        return deferred.promise;
    };

    this.enable = function(index, a, b) {
        var deferred = Q.defer();

        this.calibration[index] = { a: a, b: b };

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
