
var EventEmitter = require("events").EventEmitter;
var util = require("util");
var Q = require("q");

var Timer = require("./timer");
var Output = require("./output");
var Temperature = require("./temperature");

var spec = require("../conf/hardware.json");


function IO() {
    EventEmitter.call(this);

    this.timers = {};
    this.output = {};
    this.temperature = {};
    this.statusDirty = false;
    this.status = {
        temperatures: {},
        outputs: {},
        timers: {}
    };

    function getNameByOutputPin(serial, pin) {
        for (var name in spec) {
            if (spec[name].type === "output" && spec[name].serial === serial && spec[name].pin === pin) {
                return name;
            }
        }

        return false;
    }

    function getNameByTemperatureInput(serial, input) {
        for (var name in spec) {
            if (spec[name].type === "temperature" && spec[name].serial === serial && spec[name].input === input) {
                return name;
            }
        }

        return false;
    }

    this.setup = function(config) {
        var promises = [];

        Object.keys(spec).forEach(function(name) {
            if (spec[name].type === "timer") {

                this.timers[name] = new Timer(name);

                this.timers[name].on("tick", function(name, timeLeft) {
                    this.status.timers[name] = timeLeft;
                    this.statusDirty = true;
                }.bind(this));

                this.timers[name].on("expired", function(name) {
                    this.status.timers[name] = 0;
                    this.statusDirty = true;
                }.bind(this));

            } else if (spec[name].type === "output") {

                if (!this.output[spec[name].serial]) {
                    this.output[spec[name].serial] = new Output();

                    this.output[spec[name].serial].on("pin", function(pin, state) {
                        var pinName = getNameByOutputPin(spec[name].serial, pin);

                        if (pinName) {
                            this.status.outputs[pinName] = state;
                            this.statusDirty = true;
                        }
                    }.bind(this));
                }

            } else if (spec[name].type === "temperature") {

                if (!this.temperature[spec[name].serial]) {
                    this.temperature[spec[name].serial] = new Temperature();

                    this.temperature[spec[name].serial].on("temperature", function(input, value) {
                        var inputName = getNameByTemperatureInput(spec[name].serial, input);

                        if (inputName) {
                            this.status.temperatures[inputName] = value;
                            this.statusDirty = true;
                        }
                    }.bind(this));
                }

            }
        }.bind(this));

        for (var name in this.timers) {
            promises.push(this.timers[name].setup());
        }

        for (var name in this.output) {
            promises.push(this.output[name].setup({ serial: name }));
        }

        for (var name in this.temperature) {
            promises.push(this.temperature[name].setup({ serial: name }));
        }

        Object.keys(spec).forEach(function(name) {
            if (spec[name].type === "output") {
                promises.push(
                    this.getPin(name)
                    .then(function(value) {
                        this.status.outputs[name] = value;
                        this.statusDirty = true;
                    }.bind(this))
                );
            } else if (spec[name].type === "temperature") {
                promises.push(
                    this.enableTemperature(name)
                    .then(function() {
                        return this.getTemperature(name);
                    }.bind(this))
                    .then(function(value) {
                        this.status.temperatures[name] = value;
                        this.statusDirty = true;
                    }.bind(this))
                );
            } else if (spec[name].type === "timer") {
                this.status.timers[name] = this.timers[name].getTimeLeft();
                this.statusDirty = true;
            }
        }.bind(this));

        setInterval(function() {
            if (this.statusDirty) {
                this.emit("status", this.status);
                this.statusDirty = false;
            }
        }.bind(this), 1000);


        return Q.allSettled(promises);
    };

    this.getStatus = function() {
        var deferred = Q.defer();
        deferred.resolve(this.status);
        return deferred.promise;
    };

    this.getPin = function(name) {
        return this.output[spec[name].serial].getPin(spec[name].pin);
    };

    this.setPin = function(name) {
        return this.output[spec[name].serial].setPin(spec[name].pin);
    };

    this.unsetPin = function(name) {
        return this.output[spec[name].serial].unsetPin(spec[name].pin);
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

    this.getTemperature = function(name) {
        return this.temperature[spec[name].serial].getValue(spec[name].input);
    };

    this.enableTemperature = function(name) {
        return this.temperature[spec[name].serial].enable(spec[name].input);
    };

    this.setTimer = function(name, timeout) {
        this.timers[name].setInMinutes(timeout);
    }

    this.hasTimerExpired = function(name) {
        return this.timers[name].hasExpired();
    };
}

util.inherits(IO, EventEmitter);

module.exports = new IO();
