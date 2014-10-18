
var EventEmitter = require("events").EventEmitter;
var util = require("util");
var phidget = require('phidget-interfacekit');
var Chain = require("achain.js");
var Q = require("q");
var Timer = require("./timer");

var spec = require("../conf/hardware.json");


function Hardware() {
    EventEmitter.call(this);

    this.timers = {};

    this.setup = function(config, callback) {
        var deferred = Q.defer();

        try {
            phidget.create();

            phidget.on("attach", function() {
                console.log("Phidget attached!");
            });

            phidget.on("detach", function() {
                console.log("Phidget detached!");
            });

            phidget.on("error", function(errorCode) {
                console.log("Phidget error!", errorCode);
            });

            phidget.open(-1);

            console.log("Waiting for interface kit to be attached....");

            phidget.waitForAttachment(10000);

            console.log("Device Type: " + phidget.getDeviceType());
            console.log("Device Serial Number: " + phidget.getSerialNumber());
            console.log("Device Version: " + phidget.getDeviceVersion());
            console.log("Device Input Count: " + phidget.getInputCount());
            console.log("Device Output Count: " + phidget.getOutputCount());
            console.log("Device Sensor Count: " + phidget.getSensorCount());

            Object.keys(spec).forEach(function(name) {
                if (spec[name].type === "timer") {
                    this.timers[name] = new Timer(name);

                    this.timers[name].on("tick", function() {
                        this.emitStatus();
                    }.bind(this));

                    this.timers[name].on("expired", function() {
                        this.emit("timerExpired", name);
                    }.bind(this));
                }
            }.bind(this));

            deferred.resolve();
        } catch (e) {
            console.error(e);
            deferred.reject(e);
        }

        return deferred.promise;
    };

    this.emitStatus = function() {
        this.getStatus()
        .then(function(status) {
            this.emit("status", status);
        }.bind(this));
    };

    this.getStatus = function() {
        var promises = [];
        var status = {
            timers: {},
            outputs: {}
        };

        Object.keys(spec).forEach(function(name) {
            if (spec[name].type === "output") {
                promises.push(
                    this.getPin(name)
                    .then(function(value) {
                        status.outputs[name] = value;
                    })
                );
            } else if (spec[name].type === "timer") {
                status.timers[name] = this.timers[name].getTimeLeft();
            }
        }.bind(this));

        return Q.allSettled(promises).then(function() {
            return status;
        });
    };

    this.getPin = function(name) {
        var deferred = Q.defer();
        deferred.resolve(!!phidget.getOutputState(spec[name].pin));
        return deferred.promise;
    };

    this.setPin = function(name) {
        var deferred = Q.defer();

        console.log("Setting pin " + name);
        return this.getPin(name)
        .then(function(current) {
            if (current === true) {
                console.log("Setting pin " + name + " was already set");
                return;
            }

            phidget.setOutputState(spec[name].pin, 1);
            this.emitStatus();
        }.bind(this));
    };

    this.unsetPin = function(name) {
        var deferred = Q.defer();

        console.log("Unsetting pin " + name);
        return this.getPin(name)
        .then(function(current) {
            if (current === false) {
                console.log("Unsetting pin " + name + " was already unset");
                return;
            }

            phidget.setOutputState(spec[name].pin, 0);
            this.emitStatus();
        }.bind(this));
    };

    this.setPins = function(names) {
        var promises = [];

        Object.keys(spec).forEach(function(name) {
            if (spec[name].type === "output") {
                if (names.indexOf(name) === -1) {
                    promises.push(this.unsetPin(name));
                } else {
                    promises.push(this.setPin(name));
                }
            }
        }.bind(this));

        return Q.allSettled(promises);
    };

    this.setTimer = function(name, timeout) {
        this.timers[name].setInMinutes(timeout);
    }

    this.hasTimerExpired = function(name) {
        return this.timers[name].hasExpired();
    };
}

util.inherits(Hardware, EventEmitter);

module.exports = new Hardware();
