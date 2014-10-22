
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
                if (this.calibration[index].fixed) {
                    value = this.calibration[index].fixed;
                } else if (this.calibration[index].a) {
                    value = Math.round(100 * (this.calibration[index].a * value + this.calibration[index].b)) / 100;
                }

                this.emit("temperature", index, value);
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
                if (this.calibration[index].fixed) {
                    value = this.calibration[index].fixed;
                } else {
                    value = phidget.getBridgeValue(this.phid, index);

                    if (this.calibration[index].a) {
                        value = Math.round(100 * (this.calibration[index].a * value + this.calibration[index].b)) / 100;
                    }
                }
            }

            deferred.resolve(value);
        } catch (e) {
            deferred.reject(e);
        }

        return deferred.promise;
    };

    this.enable = function(index, a, b, fixed) {
        var deferred = Q.defer();

        this.calibration[index] = { a: a, b: b, fixed: fixed };

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
