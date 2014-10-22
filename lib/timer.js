
var EventEmitter = require("events").EventEmitter;
var util = require("util");
var Q = require("q");

function Timer(name) {
    EventEmitter.call(this);

    this.finishAt = 0;
    this.interval = false;

    this.setup = function() {
        var deferred = Q.defer();
        deferred.resolve();
        return deferred.promise;
    };

    this.setInMinutes = function(timeout, force) {
        this.setInSeconds(timeout * 60, force);
    };

    this.setInSeconds = function(timeout, force) {
        if (!this.hasExpired() && !force) {
            console.log("Timer " + name + " is already set, will ignore new set");
            return;
        }

        this.finishAt = new Date().getTime() + (timeout * 1000);
        this.start();
    };

    this.setFinishAt = function(finishAt) {
        this.finishAt = finishAt;
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

                this.emit("expired", name);
            } else {
                this.emit("tick", name, this.finishAt - now);
            }
        }.bind(this), 1000);
    };

    this.getFinishAt = function() {
        return this.finishAt;
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
