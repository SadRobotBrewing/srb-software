
var EventEmitter = require("events").EventEmitter;
var util = require("util");
var Q = require("q");
var PID = require("liquid-pid");

function Regulator(io, name, Kp, Ki, Kd) {
    EventEmitter.call(this);

    this.input = "";
    this.output = "";
    this.pid = new PID({
        Pmax: 1,
        Kp: Kp,
        Ki: Ki,
        Kd: Kd
    });

    io.on("temperature", function(name, temperature) {
        if (this.input === name) {
            var value = this.pid.calculate(temperature);

            if (value > 0.5) {
                io.setPin(this.output);
            } else {
                io.unsetPin(this.output);
            }
        }
    }.bind(this));

    this.start = function(temperature, input, output) {
        return io.enableTemperature(input).then(function() {
            this.pid.setPoint(temperature);
            this.input = input;
            this.output = output;
        }.bind(this));
    };

    this.stop = function() {
        var deferred = Q.defer();

        this.input = "";
        this.output = "";

        deferred.resolve();
        return deferred.promise;
    };
}

util.inherits(Regulator, EventEmitter);

module.exports = Regulator;
