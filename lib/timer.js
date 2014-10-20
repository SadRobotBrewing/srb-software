
var EventEmitter = require("events").EventEmitter;
var util = require("util");
var path = require("path");
var fs = require("q-io/fs");
var Q = require("q");

function Timer(name) {
    EventEmitter.call(this);

    this.finishAt = 0;
    this.interval = false;

    this.setup = function() {
        var deferred = Q.defer();

        console.log("Setting up timer");

        deferred.resolve();

        fs.read(path.join("./state", "timer_" + name))
        .then(function(finishAt) {
            this.finishAt = parseInt(finishAt, 10);

            if (isNaN(this.finishAt)) {
                this.finishAt = 0;
                fs.remove(path.join("./state", "timer_" + name));
            } else {
                this.start();
            }
        }.bind(this));

        return deferred.promise;
    };

    this.setInMinutes = function(timeout) {
        this.setInSeconds(timeout * 60);
    };

    this.setInSeconds = function(timeout) {
        if (!this.hasExpired()) {
            console.log("Timer " + name + " is already set, will ignore new set");
            return;
        }

        this.finishAt = new Date().getTime() + (timeout * 1000);

        fs.write(path.join("./state", "timer_" + name), this.finishAt.toString());

        this.start();
    };

    this.start = function() {
        if (this.interval) {
            clearInterval(this.interval);
        }

        console.log("Timer " + name + " started, will expire at " + this.finishAt);

        this.interval = setInterval(function() {
            var now = new Date().getTime();

            if (now >= this.finishAt) {
                clearInterval(this.interval);
                this.interval = false;
                this.finishAt = 0;

                fs.remove(path.join("./state", "timer_" + name));

                this.emit("expired", name);
            } else {
                this.emit("tick", name, this.finishAt - now);
            }
        }.bind(this), 1000);
    };

    this.getTimeLeft = function() {
        return this.finishAt ? this.finishAt - new Date().getTime() : 0;
    };

    this.hasExpired = function() {
        return this.finishAt === 0;
    };
}

util.inherits(Timer, EventEmitter);

module.exports = Timer;
